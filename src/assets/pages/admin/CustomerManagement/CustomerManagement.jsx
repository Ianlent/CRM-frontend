import { useState } from "react"
import EditableTable from "../../../components/EditableTable/table.jsx"
const columns = [
	{
		title: "ID",
		dataIndex: "customer_id",
		key: "customer_id",
		editable: false,
		render: (id) => `#${id}`,
	},
	{
		title: "First Name",
		dataIndex: "first_name",
		key: "first_name",
		editable: true,
		inputType: "text",
		width: "15%"
	},
	{
		title: "Last Name",
		dataIndex: "last_name",
		key: "last_name",
		editable: true,
		inputType: "text",
		width: "15%"
	},
	{
		title: "Phone Number",
		dataIndex: "phone_number",
		key: "phone_number",
		editable: true,
		inputType: "text",
		width: "15%"
	},
	{
		title: "Address",
		dataIndex: "user_address",
		key: "user_address",
		editable: true,
		inputType: "text",
		width: "25%"
	},
	{
		title: "Points",
		dataIndex: "points",
		key: "points",
		editable: true,
		inputType: "number",
		width: "10%"
	}
];

const infoLabel = "Customers"

const CustomerManagement = () => {
	const [data, setData] = useState([
		{
			customer_id: 1,
			first_name: "John",
			last_name: "Doe",
			phone_number: "123-456-7890",
			user_address: "123 Main St, Anytown, USA",
			points: 100
		},
		{
			customer_id: 2,
			first_name: "Jane",
			last_name: "Doe",
			phone_number: "098-765-4321",
			user_address: "456 Elm St, Othertown, USA",
			points: 200
		},
		{
			customer_id: 3,
			first_name: "Jimmy",
			last_name: "Smith",
			phone_number: "555-555-5555",
			user_address: "789 Oak St, Somewhere, USA",
			points: 300
		}
	]);
	return (
		<div>
			<p className="font-semibold text-2xl py-3">Manage Customers</p>
			<EditableTable sourceColumn={columns} sourceData={data} setSourceData={setData} rowKey={"customer_id"}/>
		</div>
	)
}

export default CustomerManagement