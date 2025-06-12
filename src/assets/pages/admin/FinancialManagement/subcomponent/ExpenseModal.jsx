// In ExpenseModal.js
import { Modal, Form, Input, InputNumber, DatePicker } from "antd";
import dayjs from "dayjs";

const ExpenseModal = ({ editingExpense, isModalVisible, handleCancel, form, handleSaveExpense }) => {
    return (
        <Modal
            centered
            title={editingExpense ? "Edit Expense" : "Add New Expense"}
            open={isModalVisible}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            okText={editingExpense ? "Update" : "Add"}
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveExpense}
                initialValues={{ expenseDate: dayjs() }}
            >
                <Form.Item
                    name="amount"
                    label="Amount ($)"
                    rules={[{ required: true, message: "Please enter the amount!" }]}
                >
                    <InputNumber min={0} className="w-full" />
                </Form.Item>
                <Form.Item name="expenseDescription" label="Description">
                    <Input />
                </Form.Item>
                <Form.Item
                    name="expenseDate"
                    label="Date"
                    rules={[{ required: true, message: "Please select the date!" }]}
                >
                    <DatePicker className="w-full" format="YYYY-MM-DD" maxDate={dayjs()} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ExpenseModal;