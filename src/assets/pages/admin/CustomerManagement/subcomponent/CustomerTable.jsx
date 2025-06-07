import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Space, Tag } from 'antd'; // Added Tag for status display
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import CustomerModal from './CustomerModal'; // Assuming CustomerModal is in the same directory
import DeleteConfirmationModal from '../../../../components/DeleteConfirmationModal'; // Adjust path if necessary
import axiosInstance from '../../../../../api/axiosInstance';
import useDebounce from '../../../../../hooks/useDebounce';

const CustomerTable = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });

    // States for specific search inputs
    const [searchPhoneNumber, setSearchPhoneNumber] = useState('');
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchLastName, setSearchLastName] = useState('');

    // Debounced search states
    const debouncedSearchPhoneNumber = useDebounce(searchPhoneNumber, 200);
    const debouncedSearchFirstName = useDebounce(searchFirstName, 200);
    const debouncedSearchLastName = useDebounce(searchLastName, 200);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null); // Null for create, object for edit
    const [isSaving, setIsSaving] = useState(false); // For modal's loading state

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);

    // Function to fetch customers, accepting a searchParams object
    const fetchCustomers = async (page = 1, limit = 10, searchParams = {}) => {
        setLoading(true);
        try {
            let url = `/api/customers`; // Default endpoint for fetching all (or paginated)
            let params = { page, limit };

            // Determine if any specific search parameters are provided (phoneNumber, firstName, lastName)
            const hasSearchParams = Object.keys(searchParams).some(key => {
                const value = searchParams[key];
                return value !== null && String(value).trim() !== '';
            });

            if (hasSearchParams) {
                url = `/api/customers/search`; // Use the dedicated search endpoint
                params = { ...params, ...searchParams };
            }

            const response = await axiosInstance.get(url, { params });

            setCustomers(response.data.data || []);

            const responsePagination = response.data.pagination;

            setPagination({
                ...pagination,
                current: responsePagination?.page || page,
                pageSize: responsePagination?.limit || limit,
                total: responsePagination?.total_records || 0,
            });

        } catch (error) {
            console.error("Failed to fetch customers:", error);
            setCustomers([]);
            setPagination({ current: 1, pageSize: 6, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch customers on initial load and when pagination/debounced search params change
    useEffect(() => {
        const currentSearchParams = {};

        // Only include debounced search parameters if they are non-empty strings after trimming
        if (debouncedSearchPhoneNumber.trim() !== '') {
            currentSearchParams.phoneNumber = debouncedSearchPhoneNumber;
        }
        if (debouncedSearchFirstName.trim() !== '') {
            currentSearchParams.firstName = debouncedSearchFirstName;
        }
        if (debouncedSearchLastName.trim() !== '') {
            currentSearchParams.lastName = debouncedSearchLastName;
        }

        fetchCustomers(pagination.current, pagination.pageSize, currentSearchParams);
    }, [
        pagination.current,
        pagination.pageSize,
        debouncedSearchPhoneNumber,
        debouncedSearchFirstName,
        debouncedSearchLastName,
    ]);

    const handleTableChange = (paginationConfig) => {
        setPagination({
            ...pagination,
            current: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        });
    };

    // Handler for "Add New Customer" button click
    const handleAdd = () => {
        setEditingCustomer(null); // Indicate we are creating a new customer
        setIsModalVisible(true);
    };

    // Handler for "Edit" button click in table row
    const handleEdit = (customer) => {
        setEditingCustomer(customer); // Set the customer object to be edited
        setIsModalVisible(true);
    };

    // Handler for form submission from CustomerModal (Create or Update)
    const handleSave = async (values) => {
        setIsSaving(true); // Indicate saving process
        try {
            if (editingCustomer) {
                // Update existing customer
                await axiosInstance.put(`/api/customers/${editingCustomer._id}`, values);
                message.success("Customer updated successfully!");
            } else {
                // Create new customer
                await axiosInstance.post("/api/customers", values);
                message.success("Customer created successfully!");
            }
            setIsModalVisible(false); // Close modal
            // Re-fetch current page with current search parameters to reflect changes
            fetchCustomers(pagination.current, pagination.pageSize, {
                phoneNumber: debouncedSearchPhoneNumber,
                firstName: debouncedSearchFirstName,
                lastName: debouncedSearchLastName,
            });
        } catch (error) {
            console.error("Failed to save customer:", error);
            message.error(error.response?.data?.message || "Failed to save customer. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for "Delete" button click in table row
    const handleDeleteClick = (customer) => {
        setCustomerToDelete(customer); // Set customer to be deleted
        setIsDeleteModalVisible(true); // Open delete confirmation modal
    };

    // Handler for confirming delete operation
    const handleDeleteConfirm = async () => {
        if (!customerToDelete) return; // Should not happen if modal is properly triggered

        try {
            await axiosInstance.delete(`/api/customers/${customerToDelete._id}`);
            message.success(`Customer "${customerToDelete.firstName} ${customerToDelete.lastName}" deleted successfully!`);
            setIsDeleteModalVisible(false); // Close confirmation modal
            setCustomerToDelete(null); // Clear customer to delete
            // Re-fetch current page with current search parameters to reflect deletion
            fetchCustomers(pagination.current, pagination.pageSize, {
                phoneNumber: debouncedSearchPhoneNumber,
                firstName: debouncedSearchFirstName,
                lastName: debouncedSearchLastName,
            });
        } catch (error) {
            console.error("Failed to delete customer:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete customer.";
            message.error(errorMessage);
        }
    };

    // Handler to cancel CustomerModal (Add/Edit)
    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingCustomer(null); // Clear editing state
    };

    // Handler to cancel DeleteConfirmationModal
    const handleDeleteCancelModal = () => {
        setIsDeleteModalVisible(false);
        setCustomerToDelete(null); // Clear customer to delete
    };

    const columns = [
        { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
        { title: 'Last Name', dataIndex: 'lastName', key: 'lastName' },
        { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
        { title: 'Address', dataIndex: 'address', key: 'address' },
        { title: 'Points', dataIndex: 'points', key: 'points' },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        // Disable edit if soft deleted (assuming record.isDeleted exists and indicates soft deletion)
                        disabled={record.isDeleted}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDeleteClick(record)}
                        aria-label="Delete"
                        disabled={record.isDeleted} // Disable delete if already soft deleted
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Admin Customer Management Search & Add Button */}
            <div className='mt-2 flex justify-between items-center mb-4'> {/* Added margin-bottom */}
                <div className='flex space-x-2'> {/* Added space-x for input spacing */}
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="First Name"
                        value={searchFirstName}
                        onChange={e => setSearchFirstName(e.target.value)}
                        className='w-1/4'
                    />
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Last Name"
                        value={searchLastName}
                        onChange={e => setSearchLastName(e.target.value)}
                        className='w-1/4'
                    />
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Phone Number"
                        value={searchPhoneNumber}
                        onChange={e => setSearchPhoneNumber(e.target.value)}
                        className='w-1/4'
                    />
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    className="bg-blue-500 hover:bg-blue-700"
                >
                    Add Customer
                </Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={customers}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['6', '12', '24', '50'], // Ensure these are strings
                    showQuickJumper: true,
                }}
                onChange={handleTableChange}
            />

            {/* Create/Edit Customer Modal */}
            <CustomerModal
                visible={isModalVisible}
                onCancel={handleCancelModal}
                onSave={handleSave}
                editingCustomer={editingCustomer}
                isLoading={isSaving}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                visible={isDeleteModalVisible}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancelModal}
                item={customerToDelete?.firstName + ' ' + customerToDelete?.lastName}
            />
        </div>
    );
};

export default CustomerTable;