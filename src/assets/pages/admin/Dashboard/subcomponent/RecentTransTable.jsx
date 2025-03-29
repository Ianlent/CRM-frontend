import { Table, Tag } from "antd";

  
  const columns = [
    { title: "Order ID", dataIndex: "key", key: "key" },
    { title: "Customer Name", dataIndex: "customerName", key: "customerName" },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      render: (status) => {
        const color = status === "Completed" ? "green" : status === "Pending" ? "orange" : status === "Canceled" ? "red" : "blue";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    { title: "Time", dataIndex: "time", key: "time"},
    { title: "Total Price ($)", dataIndex: "totalPrice", key: "totalPrice", render: (price) => `$${price.toFixed(2)}` },
  ];

const RecentTransactionTable = ({ data }) => {
    return <Table columns={columns} dataSource={data} rowKey="key" pagination={{ pageSize: 5 }} />;
}

export default RecentTransactionTable