import React from "react";
import { Modal, Form, Input, Select } from "antd";
import { EditableProTable } from "@ant-design/pro-table";

const EditableTable = ({ columns, data, onChange }) => {
  const [form] = Form.useForm();

  const handleSave = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        onChange(newData);
      } else {
        newData.push(row);
        onChange(newData);
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columnsWithModalEdit = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "status" ? "select" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: true,
        form,
        onSave: (newData) => handleSave(record.key, newData),
      }),
    };
  });

  return (
    <EditableProTable
      columns={columnsWithModalEdit}
      rowKey="key"
      value={data}
      onChange={onChange}
      recordCreatorProps={{
        newRecordType: "dataSource",
        record: () => ({
          key: Date.now(),
        }),
      }}
      editable={{
        type: "modal",
        form,
        actionRender: (row, _, dom) => [dom.save, dom.cancel],
        onValuesChange: (record, recordList) => {
          onChange(recordList);
        },
      }}
    />
  );
};

export default EditableTable;
