import { useState } from "react"
import EditableTable from "../../../components/EditableTable"
const columns = [
    {
        title: "ID",
        dataIndex: "key",
        key: "id",
        editable: false,
        render: (id) => `#${id}`,
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        editable: true,
        inputType: "text",
        width: "10%"
    },
    {
        title: "Address",
        dataIndex: "address",
        key: "address",
        editable: true,
        inputType: "text",
        width: "20%"
    },
    {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        editable: true,
        inputType: "text",
        width: "10%"
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        editable: true,
        inputType: "select",
        options: ["VIP", "Normal"],
        width: "7%"
    },
    {
        title: "Notes",
        dataIndex: "notes",
        key: "notes",
        editable: true,
        inputType: "text",
        width: "40%"
    }
];

const infoLabel = "Customers"

const CustomerManagement = () => {
    const [data, setData] = useState(localStorage.getItem(infoLabel) ? 
        JSON.parse(localStorage.getItem(infoLabel)) :
        [])
    return(
        <div>
            <p className="font-semibold text-2xl py-3">Manage Customers</p>
            <EditableTable columns={columns} data={data} setData={setData} tableLabel={infoLabel}></EditableTable>
        </div>
    )
}

export default CustomerManagement