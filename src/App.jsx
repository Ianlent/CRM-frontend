// src/App.jsx
import { useEffect } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { useSelector } from "react-redux"; // For getting user role in AdminRedirect (if used)
import "./App.css" // Your global CSS

// Import your page components
import NotFound from "./assets/pages/NotFound.jsx";
import LoginPage from "./assets/pages/Login.jsx"; // Modified to use Redux
import UnauthorizedPage from "./assets/pages/Unauthorized.jsx";
// Layouts
import AdminLayout from "./assets/layouts/admin/adminLayout.jsx"; // Modified for layout rendering and history
import EmployeeLayout from "./assets/layouts/employee/employeeLayout.jsx"; // Placeholder

// Protected Route Components
import ProtectedRoute from "./assets/components/ProtectedRoute/ProtectedRoute.jsx"; // Modified to render children
import RedirectIfAuthenticated from "./assets/components/RedirectIfAuthenticated/RedirectIfAuthenticated.jsx"; // Modified to use Redux state

// Axios Interceptor Setup
import { setAxiosInterceptorNavigator } from "./api/axiosInstance.js";



// Import your admin specific dashboard components
import AdminDashboard from "./assets/pages/admin/Dashboard/Dashboard.jsx";
import EmployeeManagement from "./assets/pages/admin/EmployeeManagement/EmployeeManagement.jsx";
import CustomerManagement from "./assets/pages/admin/CustomerManagement/CustomerManagement.jsx";
import FinancialManagement from "./assets/pages/admin/FinancialManagement/FinancialManagement.jsx";
import OrderManagement from "./assets/pages/admin/OrderHistory/OrderHistory.jsx";

const App = () => {
	const navigate = useNavigate();

	// Set the navigate function for the axios interceptor on component mount
	useEffect(() => {
		setAxiosInterceptorNavigator(navigate);
	}, [navigate]);

	return (
		<Routes>
			{/* Public Routes - redirect authenticated users */}
			<Route
				path="/"
				element={
					<RedirectIfAuthenticated>
						<LoginPage />
					</RedirectIfAuthenticated>
				}
			/>
			<Route
				path="/login"
				element={
					<RedirectIfAuthenticated>
						<LoginPage />
					</RedirectIfAuthenticated>
				}
			/>

			{/* Admin Routes - Protected and Role-Based */}
			<Route
				path="/admin"
				element={
					<ProtectedRoute allowedRoles={['admin']}>
						<AdminLayout /> {/* AdminLayout will render Navbar, Sidebar, and its own Outlet */}
					</ProtectedRoute>
				}
			>
				{/* Index Route for /admin: Redirects directly to /admin/dashboard */}
				<Route index element={<Navigate to="dashboard" replace />} />
				<Route path="dashboard" element={<AdminDashboard />} />
				<Route path="employee-management" element={<EmployeeManagement />} />
				<Route path="customer-management" element={<CustomerManagement />} />
				<Route path="financial-management" element={<FinancialManagement />} />
				<Route path="order-management" element={<OrderManagement />} />
			</Route>

			{/* Employee Routes - Protected and Role-Based */}
			<Route
				path="/employee"
				element={
					<ProtectedRoute allowedRoles={['employee', 'manager', 'admin']}>
						<EmployeeLayout /> {/* EmployeeLayout will render its own layout and Outlet */}
					</ProtectedRoute>
				}
			>
				{/* Example: Default dashboard for employees */}
				<Route index element={<Navigate to="dashboard" replace />} />
				{/* You would add employee-specific routes here, e.g.: */}
				{/* <Route path="dashboard" element={<EmployeeDashboard />} /> */}
				{/* <Route path="service-entry" element={<ServiceEntryPage />} /> */}
			</Route>

			<Route path="/unauthorized" element={<UnauthorizedPage />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	);
};

export default App;