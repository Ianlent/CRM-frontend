import { useState } from "react";
import EditableTable from "../../../components/EditableTable";
import { Tag } from "antd";


const columns = [
    { title: "Order ID", dataIndex: "key", key: "orderID", editable: false, render: (id) => `#${id}`, },
    { title: "Time", dataIndex: "time", key: "time", editable:true, inputType: "time"},
    { title: "Customer Name", dataIndex: "customerName", key: "customerName", editable: true, inputType: "text" },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      editable: true,
      inputType: "select",
      options: ["Completed", "Pending", "Canceled"],
      render: (status) => {
        const color = status === "Completed" ? "green" : status === "Pending" ? "orange" : status === "Canceled" ? "red" : "blue";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { title: "Total Price ($)", dataIndex: "totalPrice", key: "totalPrice", render: (price) => price ? `$${price.toFixed(2)}`:"", editable: true, inputType: "number" },
  ];

const infoLabel = "Orders"

const OrderManagement = () => {
    const [data, setData] = useState(localStorage.getItem(infoLabel) ? 
      JSON.parse(localStorage.getItem(infoLabel)) :
      []);

    return(
        <div>
            <p className="font-semibold text-2xl py-3">Manage Orders</p>
            <EditableTable columns={columns} data={data} setData={setData} tableLabel={infoLabel}></EditableTable>
        </div>
    )
}

export default OrderManagement