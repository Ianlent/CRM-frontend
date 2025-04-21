import { Modal, Form, Input, Button } from "antd";

const EditableTableModal = ({ isEditing, setIsEditing, form, data, onChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      const newData = [...data];
      const index = newData.findIndex((item) => isEditing === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...values });
        onChange(newData);
      } else {
        newData.push(values);
        onChange(newData);
      }
      setIsModalVisible(false);
      setIsEditing(null);
    });
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        {isEditing ? "Edit" : "Add"}
      </Button>
      <Modal
        title={isEditing ? "Edit" : "Add"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          {columns.map((column) => (
            <Form.Item
              key={column.key}
              name={column.key}
              label={column.title}
              rules={[{ required: true, message: "Please input value!" }]}
            >
              {column.inputType === "select" ? (
                <Select placeholder="Select an option">
                  {column.options.map((option) => (
                    <Select.Option key={option}>{option}</Select.Option>
                  ))}
                </Select>
              ) : (
                <Input />
              )}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
};

export default EditableTableModal;
