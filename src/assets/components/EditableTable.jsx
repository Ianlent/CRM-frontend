import { useState , useEffect } from "react";

import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Table,
  Button,
  Space,
} from "antd";

import { EditOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

import dayjs from "dayjs";


const { Option } = Select;

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  options,
  record,
  children,
  ...restProps
}) => {
  let inputNode;
  switch (inputType) {
    case "number":
      inputNode = <InputNumber />;
      break;
    case "date":
      inputNode = <DatePicker format="YYYY-MM-DD" />;
      break;
    case "time":
      inputNode = <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
      break;
    case "select":
      inputNode = (
        <Select>
          {options.map((option) => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      );
      break;
    default:
      inputNode = <Input />;
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          className="m-0"
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = ({ columns , data , setData, tableLabel }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const isEditing = (record) => record.key === editingKey;
  
  //detects if a row is being edited with editingKey for adding row and delete. 
  //If editingKey != null then disable them. 

  const edit = (record) => {
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date, "YYYY-MM-DD") : null,
      time: record.time ? dayjs(record.time, "YYYY-MM-DD HH:mm:ss") : null,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    const fields = form.getFieldsValue();
    const ignoredFields = ["date", "time"]
    const isEmpty = Object.entries(fields)
      .filter(([key, value]) => !ignoredFields.includes(key)) // Exclude DatePicker fields
      .every(([_, value]) => 
        value === "" || 
        value === undefined || 
        value === null || 
        value === dayjs().format('YYYY-MM-DD') ||
        value === dayjs().format('YYYY-MM-DD HH:mm:ss')
    );
    if (isEmpty) {
      setData(prevData => prevData.filter(item => item.key !== editingKey));
      localStorage.setItem(tableLabel, JSON.stringify(data.filter(item => item.key !== editingKey)));
    }
    setEditingKey(null);
  };


  // save data to row after edit
  const save = async (key) => {
    let sortFunc;
    try {
      const row = await form.validateFields();
      if (row.date) {
        row.date = dayjs.isDayjs(row.date) ? row.date.format("YYYY-MM-DD") : row.date;
        sortFunc = (a,b)=> dayjs(b.date).diff(dayjs(a.date));
      } else if (row.time) {
        row.time = dayjs.isDayjs(row.time) ? row.time.format("YYYY-MM-DD HH:mm:ss") : row.time;
        sortFunc = (a,b)=> dayjs(b.time).diff(dayjs(a.time));
      }
      const newData = data.map((item) => (item.key === key ? { ...item, ...row } : item)).sort(sortFunc);
      setData(newData);
      localStorage.setItem(tableLabel, JSON.stringify(newData))


      setEditingKey(null);
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const addRow = () => {
    const template = columns.reduce((acc, col) => {
      if (col.dataIndex === "date") {
        acc[col.dataIndex] = dayjs().format('YYYY-MM-DD')
      } else if (col.dataIndex === "time") {
        acc[col.dataIndex] = dayjs().format('YYYY-MM-DD HH:mm:ss')
      } else {
        acc[col.dataIndex] = "";
      }
      return acc;
    }, {}); 
    const newRow = {
      ...template,
      key: Date.now(),
      
    };
    const newData = [...data, newRow]
    setData(newData);
    localStorage.setItem(tableLabel, JSON.stringify(newData))
    edit(newRow);

    const totalPages = Math.ceil(newData.length / 4);
    setCurrentPage(totalPages)
  };

  const deleteRow = (key) => {
    const newData = data.filter((item) => item.key !== key)
    setData(newData);
    localStorage.setItem(tableLabel, JSON.stringify(newData))

    if (editingKey === key) cancel();
  };

  const newColumns = [
    ...columns,
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button color="green" icon={<FontAwesomeIcon icon={faCheck} />} variant="filled" className="px-3 border-green-500" onClick={() => save(record.key)} />
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button color="danger" icon={<FontAwesomeIcon icon={faXmark}/>} variant="filled" className="px-3 border-red-500"/>
            </Popconfirm>
          </Space>
        ) : (
          <Space>
            <Button type="link" icon={<EditOutlined/>} disabled={editingKey} onClick={() => edit(record)} />
            <Popconfirm title="Sure to delete?" onConfirm={() => deleteRow(record.key)}>
              <Button icon={<DeleteOutlined />} danger/>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const mergedColumns = newColumns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.inputType,
        options: col.options || [],
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  

  
  return (
    <>
      <div className="mb-4">
        <Button
          onClick={addRow}
          type="primary"
          disabled={editingKey}
          icon={<PlusOutlined />}
        >          
          Add {tableLabel}
        </Button>
      </div>
      
      <Form form={form} component={false}>
        <Table
          className="divide-black"
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          locale={{
            emptyText: (
              <div className="min-h-48 text-gray-500 text-lg">
                No data available...
              </div>
            ),
          }}
          rowClassName="editable-row"
          pagination={{
            pageSize:4,
            current: currentPage,
            onChange: (page) => {
              cancel();
              setCurrentPage(page);
            },
          }}
        />
      </Form>
    </>
  );
};

export default EditableTable;
