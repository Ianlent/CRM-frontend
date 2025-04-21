import { useState } from "react";
import { Tag } from "antd";

const columns = [
  {
    title: "ID",
    dataIndex: "key",
    key: "id",
    editable: false,
    render: (id) => `#${id}`,
    width: "15%",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    editable: true,
    inputType: "text",
    width: "22%"
  },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    editable: true,
    inputType: "select",
    options: ["Cashier", "Manager"],
    width: "15%",
  },
  {
    title: "Phone",
    dataIndex: "phone",
    key: "phone",
    editable: true,
    inputType: "text",
    width: "16%"
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    editable: true,
    inputType: "select",
    options: ["Active", "Inactive"],
    width: "8%",
    render: (status) => {
      const color = status === "Active" ? "green" : "red";
      return <Tag color={color}>{status}</Tag>;
    }
  },
];

const infoLabel = "Employee"
  
const EmployeeManagement = () => {
  const [data, setData] = useState(localStorage.getItem(infoLabel) ? JSON.parse(localStorage.getItem(infoLabel)) :
[])



  return(
    <div>
      <p className="font-semibold text-2xl py-3">Manage Employees</p>
    </div>
  )
}

export default EmployeeManagement