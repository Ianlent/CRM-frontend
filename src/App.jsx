import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router";
import "./App.css"

import NotFound from "./assets/pages/NotFound.jsx";
import LoginPage from "./assets/pages/Login/Login.jsx";

import AdminLayout from "./assets/layouts/admin/adminLayout.jsx";
import AdminDashboard from "./assets/pages/admin/Dashboard/Dashboard.jsx";
import EmployeeManagement from "./assets/pages/admin/EmployeeManagement/EmployeeManagement.jsx";
import CustomerManagement from "./assets/pages/admin/CustomerManagement/CustomerManagement.jsx";
import FinancialManagement from "./assets/pages/admin/FinancialManagement/FinancialManagement.jsx";
import OrderManagement from "./assets/pages/admin/OrderHistory/OrderHistory.jsx";

import EmployeeLayout from "./assets/layouts/employee/employeeLayout.jsx";






const App = () => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [userRole, setUserRole] = useState(null);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			setIsAuthenticated(true);
			setIsLoadingData(false);
			setUserRole(localStorage.getItem("userRole"));
		} else {
			setIsAuthenticated(false);
			setIsLoadingData(false);
			setUserRole(null);
		}
	}, []);

	return (
		<div className="page">
			<Routes>
				<Route path="/" element={<Navigate to="/login" />} />

				<Route
					path="/login"
					element={
						<LoginPage
							setIsAuthenticated={setIsAuthenticated}
							setUserRole={setUserRole}
						/>
					} />

				<Route
					path="/admin"
					element={
						<AdminLayout />
					}
				>
					<Route path="dashboard" element={<AdminDashboard />} />
					<Route path="employee-management" element={<EmployeeManagement />} />
					<Route path="customer-management" element={<CustomerManagement />} />
					<Route path="financial-management" element={<FinancialManagement />} />
					<Route path="order-management" element={<OrderManagement />} />
				</Route>

				<Route
					path="/employee"
					element={
						<EmployeeLayout />
					}
				/>

				<Route path="*" element={<NotFound />} />
			</Routes>
		</div>
	);
};

export default App;

