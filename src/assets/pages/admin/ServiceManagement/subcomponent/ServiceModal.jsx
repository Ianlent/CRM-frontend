import { useEffect } from "react";
import { Modal, Form, Input, Select, message } from "antd";

const ServiceModal = ({ visible, onCancel, onSave, editingService, isLoading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (editingService) {
                form.setFieldsValue({
                    ...editingService,
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, editingService, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            onSave(values);

        } catch (errorInfo) {
            console.log("Validation Failed:", errorInfo);
            message.error("Please fill in all required fields correctly.");
        }
    };

    return (
        <Modal
            centered
            title={editingService ? "Edit Service" : "Create New Service"}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isLoading}
            okText={editingService ? "Update" : "Create"}
            cancelText="Cancel"
        >
            <Form form={form} layout="vertical" name="service_form">
                <Form.Item
                    name="serviceName"
                    label="Service Name"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="serviceUnit"
                    label="Service Unit"
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="servicePricePerUnit"
                    label="Price per Unit"
                >
                    <Input type="number" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ServiceModal;