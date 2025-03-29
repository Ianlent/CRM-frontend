import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Route, Routes, Navigate } from "react-router";
import ProtectedRoute from "./assets/components/ProtectedRoute.jsx";
import "./App.css"

import NotFound from "./assets/pages/NotFound.jsx";
import LoginPage from "./assets/pages/Login/Login.jsx";

import AdminLayout from "./assets/layouts/admin/adminLayout.jsx";
import AdminDashboard from "./assets/pages/admin/Dashboard/Dashboard.jsx";
import EmployeeManagement from "./assets/pages/admin/EmployeeManagement/EmployeeManagement.jsx";
import CustomerManagement from "./assets/pages/admin/CustomerManagement/CustomerManagement.jsx";
import FinancialManagement from "./assets/pages/admin/FinancialManagement/FinancialManagement.jsx";
import OrderManagement from "./assets/pages/admin/OrderHistory/OrderHistory.jsx";
import { getUserRole } from "./assets/services/authService.js";
import EmployeeLayout from "./assets/layouts/employee/employeeLayout.jsx";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const auth = getAuth();
  
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoadingData(true);
        try {
          // Fetch role from Firestore instead of localStorage
          const role = await getUserRole(user.uid);
          if (role) {
            setUserRole(role);
            setIsAuthenticated(true);
          } else {
            setUserRole(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
  
      setIsLoadingData(false);
    });
  
    return () => unsubscribe();
  }, []);

  return (
    <div className="page">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/login"
          element={
            isAuthenticated ? (
              userRole === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/employee" />
              )
            ) : (
              <LoginPage setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoadingData={isLoadingData}
              currentRole={userRole}
              allowedRoles={["admin"]}
            >
              <AdminLayout />
            </ProtectedRoute>
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
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              isLoadingData={isLoadingData}
              currentRole={userRole}
              allowedRoles={["employee"]}
            >
              <EmployeeLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
