import { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";
// Removed: import he from "he"; // No longer needed
const { Option } = Select;

// Define Vietnamese mobile prefixes and regex for frontend validation
const vietnameseMobilePrefixes = [
    "032",
    "033",
    "034",
    "035",
    "036",
    "037",
    "038",
    "039", // Viettel (new)
    "070",
    "076",
    "077",
    "078",
    "079", // MobiFone (new)
    "081",
    "082",
    "083",
    "084",
    "085", // VinaPhone (new)
    "056",
    "058", // Vietnamobile (new)
    "059", // Gmobile (new)
    "086",
    "096",
    "097",
    "098", // Viettel (old 09x series)
    "089",
    "090",
    "093", // MobiFone (old 09x series)
    "088",
    "091",
    "094", // VinaPhone (old 09x series)
    "092", // Vietnamobile (old 09x series)
    "099", // Gmobile (old 09x series)
];

vietnameseMobilePrefixes.sort((a, b) => b.length - a.length || a.localeCompare(b));

const phoneNumberRegex = new RegExp(
    `^(${vietnameseMobilePrefixes.join("|")})[0-9]{7}$`
);

const UserModal = ({ visible, onCancel, onSave, editingUser, isLoading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editingUser) {
                // When editing, set existing user data.
                // Clear password fields as they are optional for update.
                form.setFieldsValue({
                    ...editingUser,
                    password: "", // Explicitly clear password field
                    confirm: "",   // Explicitly clear confirm password field
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ userRole: "employee", userStatus: "active" });
            }
        }
    }, [visible, editingUser, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            // --- Removed he.encode usage ---
            // The `values` object will be sent directly to onSave
            // which in turn sends it to the backend.
            // Backend will handle the encoding/sanitization.

            // Pass only password and confirm if they are not empty for update
            if (editingUser && !values.password) {
                // If in edit mode and password field is empty, remove it from values
                // The UserTable's handleSave will then omit it from the payload
                delete values.password;
                delete values.confirm; // Also remove confirm if password is not set
            }

            onSave(values); // Pass the values directly without explicit frontend encoding

        } catch (errorInfo) {
            console.log("Validation Failed:", errorInfo);
            message.error("Please fill in all required fields correctly.");
        }
    };

    return (
        <Modal
            title={editingUser ? "Edit User" : "Create New User"}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isLoading}
            okText={editingUser ? "Update" : "Create"}
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical" name="user_form">
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                        {
                            required: !editingUser, // Required for create, optional for update
                            message: "Username is required",
                        },
                        {
                            min: 3,
                            message: "Username must be between 3 and 32 characters",
                        },
                        {
                            max: 32,
                            message: "Username must be between 3 and 32 characters",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="userRole"
                    label="User Role"
                    rules={[
                        {
                            required: !editingUser, // Required for create, optional for update
                            message: "User role is required",
                        },
                    ]}
                >
                    <Select placeholder="Select a role">
                        <Option value="admin">Admin</Option>
                        <Option value="manager">Manager</Option>
                        <Option value="employee">Employee</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="userStatus"
                    label="User Status"
                    rules={[
                        {
                            required: true,
                            message: "Please select a status!",
                        },
                    ]}
                >
                    <Select placeholder="Select a status">
                        <Option value="active">Active</Option>
                        <Option value="suspended">Suspended</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="phoneNumber"
                    label="Phone Number"
                    rules={[
                        {
                            required: !editingUser || (editingUser && form.getFieldValue('phoneNumber')),
                            message: "Phone number is required.",
                        },
                        {
                            len: 10,
                            message: "Phone number must be exactly 10 digits long.",
                        },
                        {
                            pattern: phoneNumberRegex,
                            message:
                                "Invalid Vietnamese phone number format. It must be a 10-digit number starting with a valid mobile carrier prefix (e.g., 090, 032, 079).",
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                {/* Password field is now always visible but required only for new users */}
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        {
                            required: !editingUser, // Required for create, optional for update
                            message: "Password is required",
                        },
                        // Only apply length/complexity rules if a password is provided (for update)
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value && editingUser) { // If editing and password is empty, it's valid (optional)
                                    return Promise.resolve();
                                }
                                // Apply rules if creating or if value is present during update
                                if (value && value.length < 8) {
                                    return Promise.reject(new Error("Password must be at least 8 characters"));
                                }
                                if (value && !/[A-Z]/.test(value)) {
                                    return Promise.reject(new Error("Password must contain at least one uppercase letter"));
                                }
                                if (value && !/[0-9]/.test(value)) {
                                    return Promise.reject(new Error("Password must contain at least one number"));
                                }
                                if (!value && !editingUser) { // If creating and no password
                                    return Promise.reject(new Error("Password is required"));
                                }
                                return Promise.resolve();
                            },
                        }),
                    ]}
                    hasFeedback
                >
                    <Input.Password placeholder={editingUser ? "Leave blank to keep current password" : ""} />
                </Form.Item>
                {/* Confirm Password field is now always visible */}
                <Form.Item
                    name="confirm"
                    label="Confirm Password"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                        // Required if password field has a value
                        ({ getFieldValue }) => ({
                            required: !!getFieldValue("password"),
                            message: "Please confirm your password!",
                            validator(_, value) {
                                if (!getFieldValue("password") && !value) { // Both empty, valid if password field is optional
                                    return Promise.resolve();
                                }
                                if (getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(
                                    new Error("The two passwords that you entered do not match!")
                                );
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder={editingUser ? "Confirm new password" : ""} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UserModal;