// src/components/AllOrdersTable.jsx
import React, { useState, useEffect } from "react";
import { Table, Spin, Alert, DatePicker, Pagination, Button, message, Popconfirm, Space, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axiosInstance"; // Adjust the import path as needed

// Import the new modal components
import CreateOrderModal from "./subcomponents/CreateOrderModal";
import UpdateOrderModal from "./subcomponents/UpdateOrderModal";

const AllOrdersTable = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [selectedDate, setSelectedDate] = useState(dayjs()); // Default to current date
	const [pagination, setPagination] = useState({
		total_records: 0,
		page: 1,
		limit: 6,
		total_pages: 1,
	});

	// State for modals
	const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
	const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
	const [currentOrderToUpdate, setCurrentOrderToUpdate] = useState(null);

	const fetchOrders = async (date, currentPage, currentLimit) => {
		setLoading(true);
		setError(null);
		try {
			const formattedDate = date.format("YYYY-MM-DD");
			const response = await axiosInstance.get(
				`/api/orders?date=${formattedDate}&page=${currentPage}&limit=${currentLimit}`
			);

			if (response.data.data && response.data.data.length > 0) {
				setOrders(response.data.data[0].orders);
				setPagination(response.data.pagination);
			} else {
				setOrders([]);
				setPagination({
					total_records: 0,
					page: currentPage,
					limit: currentLimit,
					total_pages: 0,
				});
			}
		} catch (err) {
			console.error("Error fetching orders:", err);
			setError("Failed to fetch orders. Please try again.");
			setOrders([]); // Clear orders on error
			setPagination({ // Reset pagination on error
				total_records: 0,
				page: currentPage,
				limit: currentLimit,
				total_pages: 0,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders(selectedDate, pagination.page, pagination.limit);
	}, [selectedDate, pagination.page, pagination.limit]);

	const handleDateChange = (date) => {
		if (date) {
			setSelectedDate(date);
			setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on date change
		}
	};

	const handleTableChange = (page, pageSize) => {
		setPagination((prev) => ({
			...prev,
			page,
			limit: pageSize,
		}));
	};

	const handleCreateOrder = () => {
		setIsCreateModalVisible(true);
	};

	const handleEditOrder = (order) => {
		setCurrentOrderToUpdate(order);
		setIsUpdateModalVisible(true);
	};

	const handleDeleteOrder = async (orderId) => {
		setLoading(true); // Indicate loading while deleting
		try {
			await axiosInstance.delete(`/api/orders/${orderId}`);
			message.success("Order deleted successfully!");
			// Re-fetch orders to update the table
			fetchOrders(selectedDate, pagination.page, pagination.limit);
		} catch (error) {
			console.error("Error deleting order:", error);
			message.error(
				"Failed to delete order: " +
				(error.response?.data?.message || error.message)
			);
		} finally {
			setLoading(false);
		}
	};

	// --- NEW: Columns for the nested services table ---
	const serviceColumns = [
		{
			title: 'Service Name',
			dataIndex: 'serviceName',
			key: 'serviceName',
		},
		{
			title: 'Units',
			dataIndex: 'numberOfUnit',
			key: 'numberOfUnit',
			align: 'center',
		},
		{
			title: 'Price Per Unit',
			dataIndex: 'pricePerUnit',
			key: 'pricePerUnit',
			render: (text) => `${text}$`,
			align: 'right',
		},
		{
			title: 'Total Service Price',
			dataIndex: 'totalPrice',
			key: 'totalPrice',
			render: (text) => `${text}$`,
			align: 'right',
		},
	];

	const expandedRowRender = (record) => {
		return (
			<Card size="small" className="w-full bg-gray-200">
				<div className="flex flex-row justify-between items-center">
					<p className="mb-4 font-semibold text-lg">Services:</p>
					<p>Net Price: {record.total_order_price}$</p>
				</div>
				<Table
					columns={serviceColumns}
					dataSource={record.services}
					pagination={false}
					rowKey="serviceId"
					size="small"
					bordered
				/>
			</Card>
		);
	};

	const handleModalSuccess = () => {
		// Re-fetch orders after successful creation or update
		fetchOrders(selectedDate, pagination.page, pagination.limit);
	};

	const orderColumns = [
		{
			title: "Order ID",
			dataIndex: "orderId",
			key: "orderId",
			render: (text) => (
				<span className="text-blue-600 font-medium">{text}</span>
			),
			width: 150, // Fixed width
		},
		{
			title: "Customer Name",
			key: "customerName",
			render: (_, record) =>
				`${record.customerInfo.firstName} ${record.customerInfo.lastName}`,
			width: 150,
		},
		{
			title: "Customer Phone",
			dataIndex: "customerInfo",
			key: "customerPhone",
			render: (customerInfo) => customerInfo.phoneNumber,
			width: 100,
		},
		{
			title: "Order Date",
			dataIndex: "orderDate",
			key: "orderDate",
			render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm"),
			width: 150,
		},
		{
			title: "Handler",
			key: "handler",
			render: (_, record) =>
				record.handlerInfo ? record.handlerInfo.username : "N/A",
			width: 100,
		},
		{
			title: "Status",
			dataIndex: "orderStatus",
			key: "orderStatus",
			render: (status) => (
				<span
					className={`px-2 py-1 rounded-full text-xs font-semibold ${status === "pending"
						? "bg-yellow-100 text-yellow-800"
						: status === "completed"
							? "bg-green-100 text-green-800"
							: status === "cancelled"
								? "bg-red-100 text-red-800"
								: "bg-gray-100 text-gray-800"
						}`}
				>
					{status}
				</span>
			),
			width: 100,
		},
		{
			title: "Discount",
			key: "discount",
			render: (_, record) =>
				record.discountInfo
					? `${record.discountInfo.amount}${record.discountInfo.discountType === "percent" ? "%" : "$"
					} (${record.discountInfo.discountName})`
					: "None",
			width: 120,
		},
		{
			title: "Total Price",
			dataIndex: "total_order_price",
			key: "total_order_price",
			render: (price, record) => {
				if (record.discountInfo) {
					const discountAmount =
						record.discountInfo.discountType === "percent"
							? (price * record.discountInfo.amount) / 100
							: record.discountInfo.amount;
					return `$${(price - discountAmount).toFixed(2)}`;
				} else {
					return `$${price.toFixed(2)}`;
				}
			},
			width: 100,
		},
		{
			title: "Actions",
			key: "actions",
			render: (_, record) => (
				<Space size="middle">
					<Button
						icon={<EditOutlined />}
						onClick={() => handleEditOrder(record)}
						className="text-blue-500 hover:text-blue-700"
						type="text"
					>
					</Button>
					<Popconfirm
						title="Are you sure to delete this order?"
						onConfirm={() => handleDeleteOrder(record.orderId)}
						okText="Yes"
						cancelText="No"
					>
						<Button
							icon={<DeleteOutlined />}
							danger
							type="text"
						>
						</Button>
					</Popconfirm>
				</Space>
			),
			fixed: 'center', // Fix actions column to the right
		},
	];

	return (
		<div>
			<div className="flex flex-row justify-between items-center my-4">
				<h2 className="text-2xl font-bold m-0 text-gray-800">Order Details</h2>

				<div className="m-0 flex items-center justify-between space-x-4">
					<div className="flex items-center space-x-4">
						<label htmlFor="order-date" className="font-medium text-gray-700">
							Select Date:
						</label>
						<DatePicker
							id="order-date"
							value={selectedDate}
							onChange={handleDateChange}
							format="YYYY-MM-DD"
							className="w-48"
							disabledDate={(current) => current && current > dayjs().endOf('day')}
						/>
					</div>

				</div>
			</div>
			<Button
				type="primary"
				icon={<PlusOutlined />}
				onClick={handleCreateOrder}
				className="mb-4"
			>
				Create New Order
			</Button>

			{error && (
				<Alert message="Error" description={error} type="error" showIcon className="mb-4" />
			)}

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Spin size="large" tip="Loading Orders..." />
				</div>
			) : (
				<div className="py-0 bg-white shadow overflow-hidden rounded-lg">
					<Table
						columns={orderColumns}
						dataSource={orders}
						rowKey="orderId"
						pagination={false}
						bordered
						className="w-full"
						scroll={{ x: 'max-content' }}
						expandable={{
							expandedRowRender,
						}}
					/>
					<div className="my-4 mr-4 flex justify-end">
						<Pagination
							current={pagination.page}
							pageSize={pagination.limit}
							total={pagination.total_records}
							onChange={handleTableChange}
							showSizeChanger
							pageSizeOptions={[6, 12]}
							showTotal={(total) => `Total ${total} items`}
						/>
					</div>
				</div>
			)}

			<CreateOrderModal
				visible={isCreateModalVisible}
				onCancel={() => setIsCreateModalVisible(false)}
				onSuccess={handleModalSuccess}
			/>

			<UpdateOrderModal
				visible={isUpdateModalVisible}
				onCancel={() => {
					setIsUpdateModalVisible(false);
					setCurrentOrderToUpdate(null);
				}}
				onSuccess={handleModalSuccess}
				orderData={currentOrderToUpdate}
			/>
		</div>
	);
};

export default AllOrdersTable;