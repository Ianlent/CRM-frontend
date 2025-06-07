import { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
const { Option } = Select;

const DiscountModal = ({ visible, onCancel, onSave, editingDiscount, isLoading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editingDiscount) {
                // When editing, set existing discount data.
                form.setFieldsValue({
                    ...editingDiscount,
                });
            } else {
                // When creating, reset fields to their initial state.
                form.resetFields();
            }
        }
    }, [visible, editingDiscount, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            onSave(values);
        } catch (errorInfo) {
            console.log("Validation Failed:", errorInfo);
            // General error message for validation failure
            message.error("Please correct the errors in the form.");
        }
    };

    return (
        <Modal
            title={editingDiscount ? "Edit Discount" : "Create New Discount"}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isLoading}
            okText={editingDiscount ? "Update" : "Create"}
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical" name="discount_form">
                <Form.Item
                    name="discountName"
                    label="Discount Name"
                    rules={[
                        {
                            required: true,
                            message: "Discount name is required!",
                        },
                        {
                            type: 'string',
                            message: "Discount name must be a string",
                        },
                        {
                            max: 30,
                            message: "Discount name can't be longer than 30 characters",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="discountType"
                    label="Discount Type"
                    rules={[
                        {
                            required: true,
                            message: "Please select a discount type!",
                        },
                        {
                            validator: (_, value) => {
                                const discountTypes = ["percent", "fixed"]; // Ensure this matches your backend enum
                                if (!value || discountTypes.includes(value)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    `Discount type must be one of: ${discountTypes.join(", ")}`
                                );
                            },
                        },
                    ]}
                >
                    <Select>
                        <Option value="percent">Percent</Option>
                        <Option value="fixed">Fixed</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="amount"
                    label="Amount"
                    rules={[
                        {
                            required: true,
                            message: "Amount is required!",
                        },
                        {
                            validator: (_, value) => {
                                // Validate that it's an integer greater than 0
                                if (value === undefined || value === null || value === '') {
                                    return Promise.resolve(); // Handled by required rule
                                }
                                const num = Number(value);
                                if (Number.isInteger(num) && num > 0) {
                                    return Promise.resolve();
                                }
                                return Promise.reject("Amount must be a positive integer");
                            },
                        },
                    ]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    name="requiredPoints"
                    label="Required Points"
                    rules={[
                        {
                            required: true,
                            message: "Required points is required!",
                        },
                        {
                            validator: (_, value) => {
                                // Validate that it's a non-negative integer (min: 0)
                                if (value === undefined || value === null || value === '') {
                                    return Promise.resolve(); // Handled by required rule
                                }
                                const num = Number(value);
                                if (Number.isInteger(num) && num >= 0) {
                                    return Promise.resolve();
                                }
                                return Promise.reject("Required points must be a non-negative integer");
                            },
                        },
                    ]}
                >
                    <Input type="number" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DiscountModal;