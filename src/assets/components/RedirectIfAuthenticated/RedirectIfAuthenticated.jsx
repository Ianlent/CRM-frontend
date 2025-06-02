// src/assets/components/RedirectIfAuthenticated/RedirectIfAuthenticated.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd'; // Ant Design Spin for loading indicator

const RedirectIfAuthenticated = ({ children }) => {
    // Get auth state from Redux store
    const { isAuthenticated, user, status } = useSelector((state) => state.auth);

    // If auth state is still 'loading' (e.g., from initial localStorage check)
    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Checking session..." />
            </div>
        );
    }

    // If authenticated, determine redirect path based on user role
    if (isAuthenticated && user) {
        let redirectPath = '/dashboard'; // Default dashboard for any authenticated user

        // Use user.userRole to determine the specific dashboard
        if (user.userRole === 'admin') {
            redirectPath = '/admin/dashboard';
        } else if (user.userRole === 'employee' || user.userRole === 'manager') {
            redirectPath = '/employee/dashboard'; // Assuming managers use employee layout for now
        }
        // Add more role-based redirection paths as needed

        console.log(`User is authenticated as ${user.userRole}. Redirecting to ${redirectPath}`);
        return <Navigate to={redirectPath} replace />;
    }

    // If not authenticated, render the children (e.g., LoginPage)
    return <>{children}</>;
};

export default RedirectIfAuthenticated;