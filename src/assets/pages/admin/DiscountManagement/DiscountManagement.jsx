import DiscountTable from "./subcomponent/DiscountTable";

const DiscountManagementPage = () => {
    return (
        <div className="mt-4">
            <p className="text-2xl font-bold mb-4">User Management</p>
            <DiscountTable />
        </div>
    );
};

export default DiscountManagementPage;