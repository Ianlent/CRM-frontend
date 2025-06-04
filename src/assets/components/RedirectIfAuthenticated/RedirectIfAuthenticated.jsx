import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const RedirectIfAuthenticated = ({ children }) => {
    const { isAuthenticated, user, status, loggingIn } = useSelector((state) => state.auth);

    // If the global auth status is still verifying, show a loading spinner.
    // This is important for landing on / or /login when a token exists but is being checked.
    // logginIn is false and set to true only while waiting for authentication server response.
    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Checking session..." />
            </div>
        );
    }

    // If authenticated (and token verified by App.jsx's logic)
    if (isAuthenticated && user) {
        let redirectPath = '/';
        if (user.userRole === 'admin') {
            redirectPath = '/admin/dashboard';
        } else if (user.userRole === 'employee' || user.userRole === 'manager') {
            redirectPath = '/employee/dashboard';
        }

        console.log(`User is authenticated as ${user.userRole}. Redirecting to ${redirectPath}`);
        return <Navigate to={redirectPath} replace />;
    }

    // If not authenticated (or token verification failed), render the children (e.g., LoginPage)
    return <>{children}</>;
};

export default RedirectIfAuthenticated;