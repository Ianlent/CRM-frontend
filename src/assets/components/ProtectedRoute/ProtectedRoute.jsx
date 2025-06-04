import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const ProtectedRoute = ({ allowedRoles, children }) => {
	const { isAuthenticated, user, status } = useSelector((state) => state.auth);

	// If the global auth status is still verifying, show a loading spinner.
	// This covers direct access to protected routes while token is being checked.
	if (status === 'loading' || status === 'verifying') {
		return (
			<div className="flex justify-center items-center h-screen">
				<Spin size="large" tip="Checking authentication..." />
			</div>
		);
	}

	if (!isAuthenticated) {
		// User is not authenticated (either no token or verification failed)
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