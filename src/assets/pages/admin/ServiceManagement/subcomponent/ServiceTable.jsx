import React, { useState, useEffect } from 'react';
import { Table, Input, Button, message, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ServiceModal from './ServiceModal'; // Assuming ServiceModal is in the same directory
import DeleteConfirmationModal from '../../../../components/DeleteConfirmationModal'; // Adjust path if necessary
import axiosInstance from '../../../../../api/axiosInstance';
import useDebounce from '../../../../../hooks/useDebounce'; // Assuming the path to your useDebounce hook

const ServiceTable = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });

    const [searchServiceName, setSearchServiceName] = useState('');
    // Debounced version of the searchServiceName
    const debouncedSearchServiceName = useDebounce(searchServiceName, 200); // 500ms debounce delay

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingService, setEditingService] = useState(null); // Null for create, object for edit
    const [isSaving, setIsSaving] = useState(false); // For modal's loading state

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Function to fetch services, accepting a searchParams object
    const fetchServices = async (page = 1, limit = 10, searchParams = {}) => {
        setLoading(true);
        try {
            let url = `/api/services`;
            let params = { page, limit };

            // Apply the 'search' parameter for serviceName if provided and non-empty
            if (searchParams.search && String(searchParams.search).trim() !== '') {
                params.search = searchParams.search;
            }

            const response = await axiosInstance.get(url, { params });

            setServices(response.data.data || []);

            const responsePagination = response.data.pagination;

            setPagination({
                ...pagination,
                current: responsePagination?.page || page,
                pageSize: responsePagination?.limit || limit,
                total: responsePagination?.total_records || 0,
            });

        } catch (error) {
            console.error("Failed to fetch services:", error);
            setServices([]);
            setPagination({ current: 1, pageSize: 6, total: 0 });

            if (error.response && error.response.status === 404) {
                message.info("No services found matching your search criteria.");
            } else {
                message.error("Failed to fetch services. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Effect to fetch services on initial load and when pagination/debounced search params change
    useEffect(() => {
        const currentSearchParams = {};
        if (debouncedSearchServiceName.trim() !== '') {
            currentSearchParams.search = debouncedSearchServiceName;
        }
        // When debounced search term changes, reset to the first page of results
        fetchServices(1, pagination.pageSize, currentSearchParams);
        setPagination(prev => ({ ...prev, current: 1 })); // Explicitly reset pagination current to 1
    }, [debouncedSearchServiceName, pagination.pageSize]); // Dependency on debounced value and pageSize

    // Only update pagination.current when user manually changes page number
    const handleTableChange = (paginationConfig) => {
        // Prevent re-fetching if only filters/sorters change (which are not handled server-side here)
        if (pagination.current !== paginationConfig.current || pagination.pageSize !== paginationConfig.pageSize) {
            setPagination({
                ...pagination,
                current: paginationConfig.current,
                pageSize: paginationConfig.pageSize,
            });
            // Fetch data for the new page, preserving the current search term
            const currentSearchParams = {};
            if (debouncedSearchServiceName.trim() !== '') {
                currentSearchParams.search = debouncedSearchServiceName;
            }
            fetchServices(paginationConfig.current, paginationConfig.pageSize, currentSearchParams);
        }
    };

    const handleAdd = () => {
        setEditingService(null);
        setIsModalVisible(true);
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setIsModalVisible(true);
    };

    const handleSave = async (values) => {
        setIsSaving(true);
        try {
            if (editingService) {
                await axiosInstance.put(`/api/services/${editingService._id}`, values);
                message.success("Service updated successfully!");
            } else {
                await axiosInstance.post("/api/services", values);
                message.success("Service created successfully!");
            }
            setIsModalVisible(false); // Close modal
            // Re-fetch current page with current debounced search parameters to reflect changes
            fetchServices(pagination.current, pagination.pageSize, {
                search: debouncedSearchServiceName,
            });
        } catch (error) {
            console.error("Failed to save service:", error);
            message.error(error.response?.data?.message || "Failed to save service. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for "Delete" button click in table row
    const handleDeleteClick = (service) => {
        setServiceToDelete(service); // Set service to be deleted
        setIsDeleteModalVisible(true); // Open delete confirmation modal
    };

    // Handler for confirming delete operation
    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return; // Should not happen if modal is properly triggered

        try {
            await axiosInstance.delete(`/api/services/${serviceToDelete._id}`);
            message.success(`Service "${serviceToDelete.serviceName}" deleted successfully!`);
            setIsDeleteModalVisible(false); // Close confirmation modal
            setServiceToDelete(null); // Clear service to delete
            // Re-fetch current page with current debounced search parameters to reflect deletion
            fetchServices(pagination.current, pagination.pageSize, {
                search: debouncedSearchServiceName,
            });
        } catch (error) {
            console.error("Failed to delete service:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete service.";
            message.error(errorMessage);
        }
    };

    // Handler to cancel ServiceModal (Add/Edit)
    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingService(null); // Clear editing state
    };

    // Handler to cancel DeleteConfirmationModal
    const handleDeleteCancelModal = () => {
        setIsDeleteModalVisible(false);
        setServiceToDelete(null); // Clear service to delete
    };

    const columns = [
        {
            title: "Service Name",
            dataIndex: "serviceName",
            key: "serviceName",
        },
        {
            title: "Unit",
            dataIndex: "serviceUnit",
            key: "serviceUnit",
        },
        {
            title: "Price/Unit ($)",
            dataIndex: "servicePricePerUnit",
            key: "servicePricePerUnit",
            render: (price) => price ? `$${price.toFixed(2)}` : "",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="small">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        // Disable edit if soft deleted (assuming record.isDeleted exists)
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
            {/* Service Search & Add Button */}
            <div className='mt-2 flex justify-between items-center mb-4'>
                <Input
                    placeholder="Search by Service Name"
                    prefix={<SearchOutlined />}
                    value={searchServiceName}
                    onChange={(e) => setSearchServiceName(e.target.value)}
                    className="mr-2 w-1/5 rounded-md shadow-sm"
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    className="bg-blue-500 hover:bg-blue-700 rounded-md shadow-sm"
                >
                    Add Service
                </Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={services}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['6', '12', '24'], // Ensure these are strings
                }}
                onChange={handleTableChange}
            />

            {/* Create/Edit Service Modal */}
            <ServiceModal
                visible={isModalVisible}
                onCancel={handleCancelModal}
                onSave={handleSave}
                editingService={editingService}
                isLoading={isSaving}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                visible={isDeleteModalVisible}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancelModal}
                item={serviceToDelete?.serviceName}
            />
        </div>
    );
};

export default ServiceTable;
