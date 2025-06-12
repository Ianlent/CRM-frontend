import React, { useState, useEffect, useCallback } from "react";
import { Table, Card, Button, Modal, Form, message } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../../api/axiosInstance"; // Adjust the path as needed
import DateSelection from "./subcomponent/DateSelector"; // Import the DateSelection component
import ExpenseModal from "./subcomponent/expenseModal";

const FinancialManagement = () => {
	const [revenueData, setRevenueData] = useState([]);
	const [expenseData, setExpenseData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [editingExpense, setEditingExpense] = useState(null);
	const [form] = Form.useForm();

	// State for the selected date range, initialized to a default or today's date
	// Using today's date for a practical example, adjust if you need a specific initial range.
	const [dateRange, setDateRange] = useState([
		dayjs().format("YYYY-MM-DD"), // Start date (e.g., 7 days ago)
		dayjs().format("YYYY-MM-DD"), // End date (today)
	]);

	// Pagination states for Revenue Table
	const [revenuePagination, setRevenuePagination] = useState({
		current: 1,
		pageSize: 6,
		total: 0,
	});

	// Pagination states for Expense Table
	const [expensePagination, setExpensePagination] = useState({
		current: 1,
		pageSize: 6,
		total: 0,
	});

	// Handler for date range selection changes
	const handleDateSelection = (newDateStrings) => {
		setDateRange(newDateStrings);
		// Reset pagination to page 1 when the date range changes
		setRevenuePagination((prev) => ({ ...prev, current: 1 }));
		setExpensePagination((prev) => ({ ...prev, current: 1 }));
	};

	// Fetch data function, memoized with useCallback
	const fetchData = useCallback(async () => {
		setLoading(true);
		try {
			const [startDate, endDate] = dateRange; // Use dates from the state

			const [revenueRes, expenseRes] = await Promise.all([
				axiosInstance.get(
					`/api/orders/analytics/daily?start=${startDate}&end=${endDate}&page=${revenuePagination.current}&limit=${revenuePagination.pageSize}`
				),
				axiosInstance.get(
					`/api/expenses?start=${startDate}&end=${endDate}&page=${expensePagination.current}&limit=${expensePagination.pageSize}`
				),
			]);

			if (revenueRes.data.success) {
				setRevenueData(revenueRes.data.data);
				setRevenuePagination((prev) => ({
					...prev,
					total: revenueRes.data.totalCount,
				}));
			}
			if (expenseRes.data.success) {
				setExpenseData(expenseRes.data.data);
				setExpensePagination((prev) => ({
					...prev,
					total: expenseRes.data.totalCount,
				}));
			}
		} catch (error) {
			console.error("Error fetching analytics data:", error);
			message.error("Failed to fetch analytics data.");
		} finally {
			setLoading(false);
		}
	}, [
		dateRange, // Add dateRange as a dependency
		revenuePagination.current,
		revenuePagination.pageSize,
		expensePagination.current,
		expensePagination.pageSize,
	]);

	// useEffect to call fetchData on component mount and when relevant states change
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Handlers for pagination changes (unchanged)
	const handleRevenuePageChange = (page, pageSize) => {
		setRevenuePagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
	};

	const handleExpensePageChange = (page, pageSize) => {
		setExpensePagination((prev) => ({ ...prev, current: page, pageSize: pageSize }));
	};

	// Revenue Table Columns (unchanged)
	const revenueColumns = [
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (text) => dayjs(text).format("YYYY-MM-DD"),
		},
		{
			title: "Daily Revenue ($)",
			dataIndex: "revenue",
			key: "revenue",
			sorter: (a, b) => a.revenue - b.revenue,
		},
	];

	// Expanded Row for Revenue (unchanged)
	const expandedRevenueRowRender = (record) => {
		const columns = [
			{
				title: "Order ID",
				dataIndex: "_id",
				key: "_id",
			},
			{
				title: "Customer Name",
				dataIndex: "customerInfo",
				key: "customerName",
				render: (customerInfo) =>
					`${customerInfo.firstName} ${customerInfo.lastName}`,
			},
			{
				title: "Address",
				dataIndex: "customerInfo",
				key: "address",
				render: (customerInfo) => customerInfo.address,
			},
			{
				title: "Phone Number",
				dataIndex: "customerInfo",
				key: "phoneNumber",
				render: (customerInfo) => customerInfo.phoneNumber,
			},
			{
				title: "Net Total ($)",
				dataIndex: "netTotal",
				key: "netTotal",
				sorter: (a, b) => a.netTotal - b.netTotal,
			},
		];

		return (
			<Table
				columns={columns}
				dataSource={record.orders}
				pagination={false}
				rowKey="_id"
			/>
		);
	};

	// Expense Table Columns (unchanged)
	const expenseColumns = [
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			render: (text) => dayjs(text).format("YYYY-MM-DD"),
		},
		{
			title: "Total Expenses ($)",
			dataIndex: "totalExpenses",
			key: "totalExpenses",
			sorter: (a, b) => a.totalExpenses - b.totalExpenses,
		},
		{
			title: "Actions",
			key: "actions",
			render: (text, record) => (
				<Button
					onClick={() => showAddExpenseModal(record.date)}
					type="primary"
					className="bg-blue-500 hover:bg-blue-700"
				>
					Add Expense for this Day
				</Button>
			),
		},
	];

	// Expanded Row for Expenses (unchanged)
	const expandedExpenseRowRender = (record) => {
		const columns = [
			{
				title: "Expense ID",
				dataIndex: "_id",
				key: "_id",
			},
			{
				title: "Description",
				dataIndex: "expenseDescription",
				key: "expenseDescription",
			},
			{
				title: "Amount ($)",
				dataIndex: "amount",
				key: "amount",
				sorter: (a, b) => a.amount - b.amount,
			},
			{
				title: "Actions",
				key: "actions",
				render: (text, expense) => (
					<div className="flex space-x-2">
						<Button
							onClick={() => showEditExpenseModal(expense, record.date)}
							type="default"
						>
							Edit
						</Button>
						<Button
							onClick={() => handleDeleteExpense(expense._id)}
							danger
							type="default"
						>
							Delete
						</Button>
					</div>
				),
			},
		];

		return (
			<Table
				columns={columns}
				dataSource={record.expenses}
				pagination={false}
				rowKey="_id"
			/>
		);
	};

	// CRUD functions (unchanged)
	const showAddExpenseModal = (date) => {
		setEditingExpense(null);
		form.resetFields();
		form.setFieldsValue({
			expenseDate: dayjs(date),
		});
		setIsModalVisible(true);
	};

	const showEditExpenseModal = (expense, date) => {
		setEditingExpense(expense);
		form.resetFields();
		form.setFieldsValue({
			amount: expense.amount,
			expenseDescription: expense.expenseDescription,
			expenseDate: dayjs(date),
		});
		setIsModalVisible(true);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setEditingExpense(null);
		form.resetFields();
	};

	const handleSaveExpense = async (values) => {
		try {
			const expenseDate = values.expenseDate.format("YYYY-MM-DD");
			if (editingExpense) {
				await axiosInstance.put(`/api/expenses/${editingExpense._id}`, {
					...values,
					expenseDate,
				});
				message.success("Expense updated successfully!");
			} else {
				await axiosInstance.post("/api/expenses", { ...values, expenseDate });
				message.success("Expense added successfully!");
			}
			setIsModalVisible(false);
			setEditingExpense(null);
			form.resetFields();
			fetchData(); // Refresh data
		} catch (error) {
			console.error("Error saving expense:", error);
			message.error(
				`Failed to save expense: ${error.response?.data?.message || error.message
				}`
			);
		}
	};

	const handleDeleteExpense = async (id) => {
		Modal.confirm({
			title: "Are you sure you want to delete this expense?",
			onOk: async () => {
				try {
					await axiosInstance.delete(`/api/expenses/${id}`);
					message.success("Expense deleted successfully!");
					fetchData(); // Refresh data
				} catch (error) {
					console.error("Error deleting expense:", error);
					message.error(
						`Failed to delete expense: ${error.response?.data?.message || error.message
						}`
					);
				}
			},
		});
	};

	return (
		<div>
			<div className="flex items-center justify-between my-4">
				<h1 className="text-3xl m-0 font-bold text-gray-800">Daily Analytics</h1>

				<div className="flex items-center space-x-2">
					<span className="font-medium text-gray-700">From:</span>
					<DateSelection onSelection={handleDateSelection} value={dateRange} />
				</div>
			</div>


			<Card
				title="Daily Revenue"
				className="shadow-lg rounded-lg mb-8"
				styles={{ header: { backgroundColor: "#3B82F6", color: "white" } }}
			>
				<Table
					columns={revenueColumns}
					dataSource={revenueData}
					loading={loading}
					rowKey="date"
					expandable={{
						expandedRowRender: expandedRevenueRowRender,
						rowExpandable: (record) =>
							record.orders && record.orders.length > 0,
					}}
					pagination={{
						current: revenuePagination.current,
						pageSize: revenuePagination.pageSize,
						total: revenuePagination.total,
						onChange: handleRevenuePageChange,
						showSizeChanger: true,
						pageSizeOptions: [6, 12],
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} of ${total} items`,
					}}
					className="w-full"
					scroll={{ x: "max-content" }}
				/>
			</Card>

			<Card
				title="Daily Expenses"
				className="shadow-lg rounded-lg"
				styles={{ header: { backgroundColor: "#F56565", color: "white" } }}
			>
				<Table
					columns={expenseColumns}
					dataSource={expenseData}
					loading={loading}
					rowKey="date"
					expandable={{
						expandedRowRender: expandedExpenseRowRender,
						rowExpandable: (record) =>
							record.expenses && record.expenses.length > 0,
					}}
					pagination={{
						current: expensePagination.current,
						pageSize: expensePagination.pageSize,
						total: expensePagination.total,
						onChange: handleExpensePageChange,
						showSizeChanger: true,
						pageSizeOptions: ["6", "10", "20", "50"],
						showTotal: (total, range) =>
							`${range[0]}-${range[1]} of ${total} items`,
					}}
					className="w-full"
					scroll={{ x: "max-content" }}
				/>
			</Card>

			<ExpenseModal editingExpense={editingExpense} isModalVisible={isModalVisible} handleCancel={handleCancel} form={form} handleSaveExpense={handleSaveExpense} />
		</div>
	);
};

export default FinancialManagement;