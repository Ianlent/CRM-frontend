import ServiceTable from "./subcomponent/ServiceTable";

const ServiceManagementPage = () => {
    return (
        <div className="mt-4">
            <p className="text-2xl font-bold mb-4">Service Management</p>
            <ServiceTable />
        </div>
    );
};

export default ServiceManagementPage;