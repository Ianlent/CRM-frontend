import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Tag } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import DiscountModal from './DiscountModal'; // Assuming UserModal is in the same directory
import DeleteConfirmationModal from '../../../../components/DeleteConfirmationModal'; // Adjusted path
import axiosInstance from '../../../../../api/axiosInstance'; // Adjusted path

const DiscountTable = () => {
    const [discount, setDiscount] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);

    // Function to fetch Discount, now accepting a searchParams object
    const fetchDiscount = async (page = 1, limit = 6) => {
        setLoading(true);
        try {
            let url = `/api/discounts`;
            let params = { page, limit };

            const response = await axiosInstance.get(url, { params });
            setDiscount(response.data.data || []);

            const responsePagination = response.data.pagination;
            setPagination({
                ...pagination,
                current: responsePagination?.page || page,
                pageSize: responsePagination?.limit || limit,
                total: responsePagination?.total_records || 0,
            });
        } catch (error) {
            console.error('Failed to fetch discount:', error);
            setDiscount([]); // Clear Discount on error
            setPagination({ current: 1, pageSize: 6, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscount(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    // Only update pagination.current when user manually changes page number
    const handleTableChange = (paginationConfig) => {
        if (pagination.current !== paginationConfig.current || pagination.pageSize !== paginationConfig.pageSize) {
            setPagination({
                ...pagination,
                current: paginationConfig.current,
                pageSize: paginationConfig.pageSize,
            });
        }
    };

    // Handler for "Add New User" button click
    const handleAdd = () => {
        setEditingDiscount(null); // Indicate we are creating a new user
        setIsModalVisible(true);
    };

    // Handler for "Edit" button click in table row
    const handleEdit = (discount) => {
        setEditingDiscount(discount); // Set the user object to be edited
        setIsModalVisible(true);
    };

    // Handler for form submission from UserModal (Create or Update)
    const handleSave = async (values) => {
        setIsSaving(true);
        try {
            if (editingDiscount) {
                const updatePayload = { ...values };
                await axiosInstance.put(`/api/discounts/${editingDiscount._id}`, updatePayload);
                message.success('Discount updated successfully!');
            } else {
                await axiosInstance.post('/api/discounts', values);
                message.success('Discount created successfully!');
            }
            setIsModalVisible(false);
            // Re-fetch data to reflect changes, using current debounced search and pagination
            fetchDiscount(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Failed to save discount:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save discount.';
            message.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for "Delete" button click in table row
    const handleDeleteClick = (discount) => {
        setDiscountToDelete(discount);
        setIsDeleteModalVisible(true);
    };

    // Handler for confirming delete operation
    const handleDeleteConfirm = async () => {
        if (!discountToDelete) return;

        try {
            await axiosInstance.delete(`/api/discounts/${discountToDelete._id}`);
            message.success(`Discount "${discountToDelete.discountName}" deleted successfully!`);
            setIsDeleteModalVisible(false);
            setDiscountToDelete(null);
            // Re-fetch data to reflect deletion, using current debounced search and pagination
            fetchDiscount(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error('Failed to delete discount:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete discount.';
            message.error(errorMessage);
        }
    };

    // Handler to cancel UserModal (Add/Edit)
    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingDiscount(null);
    };

    // Handler to cancel DeleteConfirmationModal
    const handleCancelDeleteModal = () => {
        setIsDeleteModalVisible(false);
        setDiscountToDelete(null);
    };

    // Define table columns
    const columns = [
        {
            title: 'Discount',
            dataIndex: 'discountName',
            key: 'discountName',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => {
                if (record.discountType === 'fixed') {
                    return `$${amount.toFixed(2)}`;
                } else if (record.discountType === 'percent') {
                    return `${amount}%`;
                }
                return amount;
            },
        },
        {
            title: 'Points Required',
            dataIndex: 'requiredPoints',
            key: 'requiredPoints',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        aria-label="Edit"
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDeleteClick(record)}
                        aria-label="Delete"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                className="bg-blue-500 hover:bg-blue-700 rounded-md shadow-sm mb-4"
            >
                Add Discount
            </Button>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={discount}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: [6, 12, 24],
                }}
                onChange={handleTableChange}
            />

            {/* Create/Edit User Modal */}
            <DiscountModal
                visible={isModalVisible}
                onCancel={handleCancelModal}
                onSave={handleSave}
                editingDiscount={editingDiscount}
                isLoading={isSaving}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                visible={isDeleteModalVisible}
                onConfirm={handleDeleteConfirm}
                onCancel={handleCancelDeleteModal}
                item={discountToDelete?.discountName}
            />
        </div>
    );
};

export default DiscountTable;