import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, message, Tag } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import UserModal from './UserModal'; // Assuming UserModal is in the same directory
import DeleteConfirmationModal from '../../../../components/DeleteConfirmationModal'; // Adjusted path
import axiosInstance from '../../../../../api/axiosInstance'; // Adjusted path
import useDebounce from '../../../../../hooks/useDebounce'; // Adjusted path

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });

    // State for the external search input
    const [searchUsername, setSearchUsername] = useState('');
    // Debounced version of the search username
    const debouncedSearchUsername = useDebounce(searchUsername, 200);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Function to fetch users, now accepting a searchParams object
    const fetchUsers = async (page = 1, limit = 6, searchParams = {}) => {
        setLoading(true);
        try {
            let url = `/api/users`;
            let params = { page, limit };

            // **FIXED:** Map the 'username' from searchParams to the 'search' parameter expected by the backend
            if (searchParams.username && String(searchParams.username).trim() !== '') {
                params.search = searchParams.username;
            }

            const response = await axiosInstance.get(url, { params });
            setUsers(response.data.data || []);

            const responsePagination = response.data.pagination;
            setPagination({
                ...pagination,
                current: responsePagination?.page || page,
                pageSize: responsePagination?.limit || limit,
                total: responsePagination?.total_records || 0,
            });
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]); // Clear users on error
            setPagination({ current: 1, pageSize: 6, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    // Effect hook to trigger data fetching when pagination or debounced search changes
    useEffect(() => {
        const currentSearchParams = {};
        if (debouncedSearchUsername.trim() !== '') {
            currentSearchParams.username = debouncedSearchUsername;
        }
        // When debounced search term changes, reset to the first page of results
        fetchUsers(1, pagination.pageSize, currentSearchParams);
        setPagination(prev => ({ ...prev, current: 1 })); // Explicitly reset pagination current to 1
    }, [debouncedSearchUsername, pagination.pageSize]); // Removed pagination.current from dependencies to prevent infinite loop

    // Only update pagination.current when user manually changes page number
    const handleTableChange = (paginationConfig) => {
        if (pagination.current !== paginationConfig.current || pagination.pageSize !== paginationConfig.pageSize) {
            setPagination({
                ...pagination,
                current: paginationConfig.current,
                pageSize: paginationConfig.pageSize,
            });
            // Fetch data for the new page, preserving the current search term
            const currentSearchParams = {};
            if (debouncedSearchUsername.trim() !== '') {
                currentSearchParams.username = debouncedSearchUsername;
            }
            fetchUsers(paginationConfig.current, paginationConfig.pageSize, currentSearchParams);
        }
    };

    // Handler for "Add New User" button click
    const handleAdd = () => {
        setEditingUser(null); // Indicate we are creating a new user
        setIsModalVisible(true);
    };

    // Handler for "Edit" button click in table row
    const handleEdit = (user) => {
        setEditingUser(user); // Set the user object to be edited
        setIsModalVisible(true);
    };

    // Handler for form submission from UserModal (Create or Update)
    const handleSave = async (values) => {
        setIsSaving(true);
        try {
            if (editingUser) {
                const updatePayload = { ...values };
                // Remove password and confirm if they are empty strings during an update
                if (updatePayload.password === '') {
                    delete updatePayload.password;
                }
                if (updatePayload.confirm === '') {
                    delete updatePayload.confirm;
                }
                await axiosInstance.put(`/api/users/${editingUser._id}`, updatePayload);
                message.success('User updated successfully!');
            } else {
                await axiosInstance.post('/api/users', values);
                message.success('User created successfully!');
            }
            setIsModalVisible(false);
            // Re-fetch data to reflect changes, using current debounced search and pagination
            fetchUsers(pagination.current, pagination.pageSize, { username: debouncedSearchUsername });
        } catch (error) {
            console.error('Failed to save user:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save user.';
            message.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for "Delete" button click in table row
    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalVisible(true);
    };

    // Handler for confirming delete operation
    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            await axiosInstance.delete(`/api/users/${userToDelete._id}`);
            message.success(`User "${userToDelete.username}" deleted successfully!`);
            setIsDeleteModalVisible(false);
            setUserToDelete(null);
            // Re-fetch data to reflect deletion, using current debounced search and pagination
            fetchUsers(pagination.current, pagination.pageSize, { username: debouncedSearchUsername });
        } catch (error) {
            console.error('Failed to delete user:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete user.';
            message.error(errorMessage);
        }
    };

    // Handler to cancel UserModal (Add/Edit)
    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingUser(null);
    };

    // Handler to cancel DeleteConfirmationModal
    const handleCancelDeleteModal = () => {
        setIsDeleteModalVisible(false);
        setUserToDelete(null);
    };

    // Define table columns
    const columns = [
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Role',
            dataIndex: 'userRole',
            key: 'userRole',
        },
        {
            title: 'Status',
            dataIndex: 'userStatus',
            key: 'userStatus',
            render: (status) => {
                let color = status === 'active' ? 'green' : 'red';
                return (
                    <Tag color={color} key={status}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
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
            {/* External Search Bar and Add User Button */}
            <div className="mt-2 flex justify-between items-center mb-4">
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search Username"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="w-1/3 rounded-md shadow-sm"
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                    className="bg-blue-500 hover:bg-blue-700 rounded-md shadow-sm"
                >
                    Add User
                </Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['6', '12', '24'],
                }}
                onChange={handleTableChange}
            />

            {/* Create/Edit User Modal */}
            <UserModal
                visible={isModalVisible}
                onCancel={handleCancelModal}
                onSave={handleSave}
                editingUser={editingUser}
                isLoading={isSaving}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                visible={isDeleteModalVisible}
                onConfirm={handleDeleteConfirm}
                onCancel={handleCancelDeleteModal}
                item={userToDelete?.username}
            />
        </div>
    );
};

export default UserTable;