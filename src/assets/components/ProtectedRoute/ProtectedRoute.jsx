// src/assets/components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd'; // For a loading indicator

const ProtectedRoute = ({ allowedRoles, children }) => {
  // Select isAuthenticated, user, and status from the Redux store
  const { isAuthenticated, user, status } = useSelector((state) => state.auth);

  // Show loading indicator while authentication status is being determined (e.g., from localStorage)
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.userRole)) {
    // User is authenticated but does not have the required role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role (if specified), render the children
  return <>{children}</>;
};

export default ProtectedRoute;