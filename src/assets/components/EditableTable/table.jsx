import React, { useState } from "react";
import { Table, Button, Form } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import EditModal from "./modal";

/**
 * EditableTable is a React component that displays a table with editable rows.
 * It is a compound component that includes a Table, an EditModal, and a Button.
 * The Table displays the data, the EditModal is used to edit the data, and the
 * Button is used to add new data.
 *
 * The EditableTable uses the useState hook to keep track of the state of the
 * modal and the selected row. The useImperativeHandle hook is used to get a
 * reference to the Form component from the EditModal component.
 *
 * The EditableTable component also defines two functions: handleAdd and
 * handleEdit. The handleAdd function is used to add a new row of data to the
 * table, and the handleEdit function is used to edit an existing row of data.
 *
 * The EditableTable component returns a JSX element that contains the Table,
 * the EditModal, and the Button.
 */
const EditableTable = () => {
	const [open, setOpen] = useState(false);
	const [editingRecord, setEditingRecord] = useState(null);
	const [dataSource, setDataSource] = useState([
		{ key: '1', name: 'Mike', age: 32, address: '10 Downing Street' },
		{ key: '2', name: 'John', age: 42, address: '10 Downing Street' },
	]);
	const [mode, setMode] = useState(null);

	const [form] = Form.useForm();


	/**
	 * Prepares the form and modal for adding a new record by resetting the form fields,
	 * setting the mode to "add", and opening the modal.
	 */

	const handleAddClick = () => {
		setEditingRecord(null);
		form.resetFields();
		setMode("add");
		setOpen(true);
	};


	/**
	 * Prepares the form and modal for editing an existing record by setting the
	 * form fields to the values of the selected record, setting the mode to
	 * "edit", and opening the modal.
	 * @param {Object} record the record to edit
	*/
	const handleEdit = (record) => {
		setEditingRecord(record);
		form.setFieldsValue(record);
		setMode("edit");
		setOpen(true);
	};

	/**
	 * Adds a new record to the data source by concatenating the values with a
	 * new key and adding it to the START of the data source.
	 * @param {Object} values The values of the new record to be added.
	*/
	const handleAdd = (values) => {
		setDataSource((prev) => [{ key: `${prev.length + 1}`, ...values }, ...prev]);
	};

	/**
	 * Updates the data source with the updated values and resets the editing record to null.
	 * @param {Object} updatedValues The updated values of the record to be saved.
	*/
	const handleSave = (updatedValues) => {
		setDataSource((prev) =>
			prev.map((item) =>
				item.key === editingRecord.key ? { ...item, ...updatedValues } : item
			))
		setEditingRecord(null);
	}

	const handleDelete = (record) => {
		const key = record.key;
		setDataSource((prev) => prev.filter((item) => item.key !== key));
	};


	const onOk = (values) => {
		console.log("OK", values);
		if (mode === "add") {
			console.log("adding", values);
			handleAdd(values);
		} else if (mode === "edit") {
			handleSave(values);
		}
		setOpen(false);
		setMode(null);
	};



	const columns = [
		{ title: 'Name', dataIndex: 'name', key: 'name' },
		{ title: 'Age', dataIndex: 'age', key: 'age' },
		{ title: 'Address', dataIndex: 'address', key: 'address' },
		{
			title: 'Action',
			key: 'operation',
			render: (_, record) => (
				<div className="flex justify-center gap-3">
					<Button className="px-2.5" type="primary" onClick={() => handleEdit(record)}><EditOutlined /></Button>
					<Button className="px-2.5" danger onClick={() => handleDelete(record)}><DeleteOutlined /></Button>
				</div>
			),
			width: "10%",
		},
	];

	return (
		<div>
			<Button className="text-base my-4 px-5 py-5 ps-3" type="primary" onClick={handleAddClick}>
				<PlusOutlined className="m-0"/> Add
			</Button>
			<Table bordered dataSource={dataSource} columns={columns} pagination={{ pageSize: 6 }}/>
			<EditModal open={open} setOpen={setOpen} record={editingRecord} form={form} onOk={onOk} />
		</div>
	);
};

export default EditableTable;
