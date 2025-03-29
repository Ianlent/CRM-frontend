import { Spin } from "antd";
import { Navigate } from "react-router";

const ProtectedRoute = ({ isAuthenticated, isLoadingData, currentRole, allowedRoles, children }) => {
  if (isLoadingData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
