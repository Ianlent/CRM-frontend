import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';

const ProtectedRoute = ({ allowedRoles, children }) => {
	const { isAuthenticated, user, status, loggingIn } = useSelector((state) => state.auth);
	// If the global auth status is still verifying, show a loading spinner.
	// This covers direct access to protected routes while token is being checked.
	// logginIn is false and set to true only while waiting for authentication server response.
	if (status === 'loading') {
		return (
			<div className="flex justify-center items-center h-screen">
				<Spin size="large">
					<p className='text-2xl bg-[#e0e2f5]'>Verifying session...</p>
				</Spin>
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