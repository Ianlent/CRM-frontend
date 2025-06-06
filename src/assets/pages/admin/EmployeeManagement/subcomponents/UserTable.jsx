import { useState, useEffect } from "react";
import { Table, Button, Space, Input, message, Tag } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import UserModal from "./UserModal";
import DeleteConfirmationModal from "../../../../components/DeleteConfirmationModal";
import axiosInstance from "../../../../../api/axiosInstance";

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6,
        total: 0,
    });
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchUsers = async (page = 1, limit = 6, search = "") => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(
                `/api/users?page=${page}&limit=${limit}&search=${search}`
            );
            setUsers(response.data.data);
            setPagination({
                ...pagination,
                current: response.data.pagination.page,
                pageSize: response.data.pagination.limit,
                total: response.data.pagination.total_records,
            });
        } catch (error) {
            console.error("Failed to fetch users:", error);
            message.error("Failed to fetch users. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(pagination.current, pagination.pageSize, searchText);
    }, [pagination.current, pagination.pageSize, searchText]);

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
        setSearchedColumn("");
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            filterDropdownProps,
        }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: "block" }}
                    id={`searchInput-${dataIndex}`}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex]
                    .toString()
                    .toLowerCase()
                    .includes(value.toLowerCase())
                : "",
        filterDropdownProps: {
            onOpenChange: (visible) => {
                if (visible) {
                    setTimeout(() => {
                        const input = document.getElementById(`searchInput-${dataIndex}`);
                        if (input) {
                            input.select();
                        }
                    }, 100);
                }
            },
        },
    });

    const columns = [
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
            ...getColumnSearchProps("username"),
            sorter: (a, b) => a.username.localeCompare(b.username),
        },
        {
            title: "Role",
            dataIndex: "userRole",
            key: "userRole",
            filters: [
                { text: "Admin", value: "admin" },
                { text: "Manager", value: "manager" },
                { text: "Employee", value: "employee" },
            ],
            onFilter: (value, record) => record.userRole.indexOf(value) === 0,
        },
        {
            title: "Status",
            dataIndex: "userStatus",
            key: "userStatus",
            filters: [
                { text: "Active", value: "active" },
                { text: "Suspended", value: "suspended" },
            ],
            onFilter: (value, record) => record.userStatus.indexOf(value) === 0,
            render: (status) => {
                let color = status === "active" ? "green" : "red";
                return (
                    <Tag color={color} key={status}>
                        {status.toUpperCase()}
                    </Tag>
                );
            },
        },
        {
            title: "Phone Number",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
        },
        {
            title: "Actions",
            key: "actions",
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

    const handleAdd = () => {
        setEditingUser(null);
        setIsModalVisible(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalVisible(true);
    };

    const handleSave = async (values) => {
        setIsSaving(true);
        try {
            if (editingUser) {
                // For updates, create an object with only the fields that were provided/changed
                const updatePayload = { ...values };
                // If password and confirm are empty strings, remove them from the payload
                // to avoid sending empty password to backend for update
                if (updatePayload.password === "") {
                    delete updatePayload.password;
                }
                if (updatePayload.confirm === "") { // Also remove confirm if password isn't being updated
                    delete updatePayload.confirm;
                }
                await axiosInstance.put(`/api/users/${editingUser._id}`, updatePayload);
                message.success("User updated successfully!");
            } else {
                await axiosInstance.post("/api/users", values);
                message.success("User created successfully!");
            }
            setIsModalVisible(false);
            fetchUsers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error("Failed to save user:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to save user.";
            message.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            await axiosInstance.delete(`/api/users/${userToDelete._id}`);
            message.success(`User "${userToDelete.username}" deleted successfully!`);
            setIsDeleteModalVisible(false);
            setUserToDelete(null);
            fetchUsers(pagination.current, pagination.pageSize, searchText);
        } catch (error) {
            console.error("Failed to delete user:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to delete user.";
            message.error(errorMessage);
        }
    };

    const handleCancelModal = () => {
        setIsModalVisible(false);
        setEditingUser(null);
    };

    const handleCancelDeleteModal = () => {
        setIsDeleteModalVisible(false);
        setUserToDelete(null);
    };

    return (
        <div>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                className="mb-4 bg-blue-500 hover:bg-blue-700"
            >
                Add User
            </Button>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: [6, 12, 24],
                }}
                onChange={handleTableChange}
            />

            <UserModal
                visible={isModalVisible}
                onCancel={handleCancelModal}
                onSave={handleSave}
                editingUser={editingUser}
                isLoading={isSaving}
            />

            <DeleteConfirmationModal
                visible={isDeleteModalVisible}
                onConfirm={handleDeleteConfirm}
                onCancel={handleCancelDeleteModal}
                userName={userToDelete?.username}
            />
        </div>
    );
};

export default UserTable;