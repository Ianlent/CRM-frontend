import UserTable from "./subcomponents/UserTable";

const UserManagementPage = () => {
  return (
    <div className="mt-4">
      <p className="text-2xl font-bold mb-4">User Management</p>
      <UserTable />
    </div>
  );
};

export default UserManagementPage;