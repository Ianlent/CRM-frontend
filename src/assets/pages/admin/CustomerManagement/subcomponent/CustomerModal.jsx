import React, { useEffect } from "react";
import { Modal, Form, Input, message, InputNumber } from "antd"; // Removed Select, Switch

// --- Backend Validation Rules (copied for frontend consistency) ---
const vietnameseMobilePrefixes = [
    "032", "033", "034", "035", "036", "037", "038", "039", // Viettel (new)
    "070", "076", "077", "078", "079", // MobiFone (new)
    "081", "082", "083", "084", "085", // VinaPhone (new)
    "056", "058", // Vietnamobile (new)
    "059", // Gmobile (new)
    "086", "096", "097", "098", // Viettel (old 09x series)
    "089", "090", "093", // MobiFone (old 09x series)
    "088", "091", "094", // VinaPhone (old 09x series)
    "092", // Vietnamobile (old 09x series)
    "099", // Gmobile (old 09x series)
];

// Sort prefixes by length descending, then alphabetically, to ensure longer prefixes
vietnameseMobilePrefixes.sort((a, b) => b.length - a.length || a.localeCompare(b));

const phoneNumberRegex = new RegExp(
    `^(${vietnameseMobilePrefixes.join("|")})[0-9]{7}$`
);
// --- END Backend Validation Rules ---

const CustomerModal = ({ visible, onCancel, onSave, editingCustomer, isLoading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editingCustomer) {
                // When editing, set form fields with existing customer data
                // Ensure points is a number, even if it might come as string from some source
                form.setFieldsValue({
                    ...editingCustomer,
                    points: typeof editingCustomer.points === 'string'
                        ? parseInt(editingCustomer.points, 10) || 0
                        : editingCustomer.points || 0
                });
            } else {
                // When creating, reset form and set default values
                form.resetFields();
                form.setFieldsValue({ points: 0 }); // Default points for new customer, isDeleted is not needed now
            }
        }
    }, [visible, editingCustomer, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            // Pass validated values to the onSave prop (which is handleSave in CustomerTable)
            onSave(values);
        } catch (errorInfo) {
            console.log("Validation Failed:", errorInfo);
            message.error("Please fill in all required fields correctly.");
        }
    };

    return (
        <Modal
            centered
            title={editingCustomer ? "Edit Customer" : "Create New Customer"}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isLoading}
            okText={editingCustomer ? "Update" : "Create"}
            cancelText="Cancel"
            destroyOnClose={true} // Ensures form state is reset when modal closes
        >
            <Form form={form} layout="vertical" name="customer_form"> {/* Removed 'name' prop on Form.Item */}
                <Form.Item
                    name="_id"
                    label="Customer ID"
                >
                    <Input readOnly />

                </Form.Item>

                <Form.Item
                    name="firstName"
                    label="First Name"
                    rules={[
                        { required: true, message: "Please input the first name!" },
                        { min: 2, message: "First name must be at least 2 characters." },
                        { max: 32, message: "First name cannot exceed 32 characters." }, // Updated max length
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="lastName"
                    label="Last Name"
                    rules={[
                        { required: true, message: "Please input the last name!" },
                        { min: 2, message: "Last name must be at least 2 characters." },
                        { max: 32, message: "Last name cannot exceed 32 characters." }, // Updated max length
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    rules={[
                        { required: true, message: "Please input the phone number!" },
                        {
                            pattern: phoneNumberRegex, // Added regex for Vietnamese phone numbers
                            message: "Invalid Vietnamese phone number format (must be 10 digits starting with valid prefix).",
                        },
                        {
                            len: 10, // Explicitly check for exactly 10 digits
                            message: "Phone number must be exactly 10 digits long.",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Address"
                    rules={[
                        { required: true, message: "Please input the address!" },
                        { min: 5, message: "Address must be at least 5 characters." }, // Updated min length
                        { max: 128, message: "Address cannot exceed 128 characters." }, // Updated max length
                    ]}
                >
                    <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
                </Form.Item>
                <Form.Item
                    name="points"
                    label="Points"
                    rules={[
                        { required: true, message: "Please input customer points!" },
                        { type: "number", min: 0, message: "Points must be a non-negative number." },
                    ]}
                >
                    <InputNumber style={{ width: '100%' }} min={0} precision={0} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CustomerModal;