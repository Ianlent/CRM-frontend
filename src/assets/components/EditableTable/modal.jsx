import { Modal, Form, Input, Button } from "antd";
import { useEffect } from "react";

/**
 * EditModal is a React component that displays a modal window with a form
 * for editing a row of data in a table. The modal is centered and can be
 * closed by clicking the cancel button or the overlay. The form is validated
 * when the OK button is clicked, and if the form is valid, the onOk callback
 * is called with the form values as an argument. The modal is also reset when
 * it is closed.
 *
 * The EditModal component takes the following props:
 *
 * - open (boolean): Whether the modal is open or not.
 * - setOpen (function): A function to set the open state of the modal.
 * - record (object): The row of data to be edited. If null, the form is
 *   reset and the title of the modal is set to "Add Record". If not null,
 *   the form is populated with the values from the record and the title
 *   of the modal is set to "Edit Record".
 * - form (object): An instance of the Form component from the Ant Design
 *   library. The form is used to store the values of the form fields and
 *   to validate the form.
 *
 * The EditModal component returns a JSX element that contains the Modal
 * component, the Form component, and the fields of the form.
 */
const EditModal = ({ open, setOpen, record, form, onOk}) => {
  const onCancel = () => {
    setOpen(false);
  };


  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue(record);
      } else {
        form.resetFields();
      }
    }
  }, [record, open, form]);

  return (
    <Modal
      title={record ? "Edit Record" : "Add Record"}
      centered
      open={open}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onOk(values);
            form.resetFields();
          })
          .catch((info) => {
            console.log("Validate Failed:", info);
          });
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="age" label="Age" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;