import React, { cloneElement, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";
import dayjs from "dayjs";

const { Option } = Select;

const EditableTable = ({ columns, data, setData, tableLabel, rowKey }) => {
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const openModal = (record = null) => {
    setIsEditMode(!!record);
    const initialValues = record
      ? {
          ...record,
          date: record.date ? dayjs(record.date) : null,
          time: record.time ? dayjs(record.time) : null,
        }
      : columns.reduce((acc, col) => {
          if (col.dataIndex === "date") {
            acc[col.dataIndex] = dayjs();
          } else if (col.dataIndex === "time") {
            acc[col.dataIndex] = dayjs();
          } else {
            acc[col.dataIndex] = "";
          }
          return acc;
        }, {});

    form.setFieldsValue(initialValues);
    setEditingRecord(record);
    setIsModalOpen(true);
  };

  const handleDelete = (key) => {
    const newData = data.filter((item) => item[rowKey] !== key);
    setData(newData);
    localStorage.setItem(tableLabel, JSON.stringify(newData));
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (values.date) {
        values.date = values.date.format("YYYY-MM-DD");
      }
      if (values.time) {
        values.time = values.time.format("YYYY-MM-DD HH:mm:ss");
      }

      const key = editingRecord ? editingRecord[rowKey] : Date.now();
      const newData = isEditMode
        ? data.map((item) => (item[rowKey] === key ? { ...item, ...values } : item))
        : [...data, { ...values, [rowKey]: key }];

      const sortedData = newData.sort((a, b) => {
        if (a.date && b.date) return dayjs(b.date).diff(dayjs(a.date));
        if (a.time && b.time) return dayjs(b.time).diff(dayjs(a.time));
        return 0;
      });

      setData(sortedData);
      localStorage.setItem(tableLabel, JSON.stringify(sortedData));
      setIsModalOpen(false);
      setEditingRecord(null);
      if (!isEditMode) {
        setCurrentPage(Math.ceil(sortedData.length / 4));
      }
    } catch (err) {
      console.log("Validation Failed:", err);
    }
  };

  const renderInput = (col) => {
    switch (col.inputType) {
      case "number":
        return <InputNumber />;
      case "date":
        return <DatePicker format="YYYY-MM-DD" />;
      case "time":
        return <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />;
      case "select":
        return (
          <Select>
            {col.options?.map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
        );
      default:
        return <Input />;
    }
  };

  const extendedColumns = [
    ...columns,
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record[rowKey])}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4">
        <Button
          onClick={() => openModal()}
          type="primary"
          icon={<PlusOutlined />}
        >
          Add {tableLabel}
        </Button>
      </div>

      <Table
		rowKey={rowKey}
        bordered
        dataSource={data}
        columns={extendedColumns}
        pagination={{
          pageSize: 4,
          current: currentPage,
          onChange: (page) => setCurrentPage(page),
        }}
        locale={{
          emptyText: (
            <div className="min-h-48 text-gray-500 text-lg">No data available...</div>
          ),
        }}
      />

      <Modal
        title={isEditMode ? `Edit ${tableLabel}` : `Add ${tableLabel}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        onOk={handleSave}
        okText={<FontAwesomeIcon icon={faCheck} />}
        cancelText={<FontAwesomeIcon icon={faXmark} />}
        okButtonProps={{ className: "border-green-500" }}
        cancelButtonProps={{ className: "border-red-500" }}
      >
        <Form form={form} layout="vertical">
          {columns.map((col) => (
            <Form.Item
              key={col.dataIndex}
              name={col.dataIndex}
              label={col.title}
              rules={[{ required: true, message: `Please input ${col.title}` }]}
            >
              	{React.cloneElement(renderInput(col), {
					disabled: col.dataIndex === rowKey
				})}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
};

export default EditableTable;
