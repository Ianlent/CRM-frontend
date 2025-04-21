import { useState } from "react";
import { Tag } from "antd";

const columns = [
	{
		title: "Date",
		dataIndex: "date",
		key: "date",
		editable: true,
		inputType: "date",
	},
	{
		title: "Transaction ID",
		dataIndex: "key",
		key: "transactionId",
		editable: false,
		render: (id) => `#${id}`,
	},
	{
		title: "Type",
		dataIndex: "type",
		key: "type",
		editable: true,
		inputType: "select",
		options: ["Rent", "Wage", "Revenue", "Other"]
	},
	{
		title: "Category",
		dataIndex: "category",
		key: "category",
		editable: true,
		inputType: "select",
		options: ["Revenue", "Expense"],
		render: (status) => {
			const color = status === "Revenue" ? "green" : "red";
			return <Tag color={color}>{status}</Tag>;
		}
	},
	{
		title: "Amount ($)",
		dataIndex: "amount",
		key: "amount",
		render: (price) => price ? `$${price.toFixed(2)}` : "",
		editable: true,
		inputType: "number"
	},
];
const infoLabel = "Finances"

const FinancialManagement = () => {
	const [data, setData] = useState(localStorage.getItem(infoLabel) ?
		JSON.parse(localStorage.getItem(infoLabel)) :
		[]);

	return (
		<div>
			<p className="font-semibold text-2xl py-3">Manage Finances</p>
		</div>
	)
}

export default FinancialManagement