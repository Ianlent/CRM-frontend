import React from "react";
import CustomerTable from "./subcomponent/CustomerTable";

const CustomerManagementPage = () => {
    return (
        <div className="mt-4">
            <p className="font-semibold text-2xl m-0 mb-4">Customer Management</p>
            <CustomerTable />
        </div>
    );
};

export default CustomerManagementPage;