// src/assets/pages/Unauthorized/UnauthorizedPage.jsx
import React from 'react';
import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const UnauthorizedPage = () => {
    const navigate = useNavigate();

    const handleGoToLogin = () => {
        navigate('/login', { replace: true });
    };

    const handleGoBack = () => {
        navigate(-1); // Go back one step in history
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Result
                status="403"
                title="403 - Access Denied"
                subTitle="Sorry, you don't have permission to access this page."
                extra={
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Button type="default" onClick={handleGoBack} className="w-full sm:w-auto">
                            Go Back
                        </Button>
                        <Button type="primary" onClick={handleGoToLogin} className="w-full sm:w-auto">
                            Go to Login
                        </Button>
                    </div>
                }
            >
                <div className="text-center">
                    <Paragraph className="text-gray-600">
                        It looks like your current role does not have the necessary privileges to view this content.
                    </Paragraph>
                    <Paragraph className="text-gray-600">
                        If you believe this is an error, please contact your administrator.
                    </Paragraph>
                </div>
            </Result>
        </div>
    );
};

export default UnauthorizedPage;