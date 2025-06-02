// src/assets/pages/Login/Login.jsx
import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/authSlice'; // Adjust path as needed

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select relevant state from Redux store
  const { isAuthenticated, status, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // If login is successful and auth status is 'succeeded', navigate to dashboard
    if (isAuthenticated && status === 'succeeded') {
      // The RedirectIfAuthenticated component might also handle this,
      // but this ensures immediate navigation after login.
      navigate('/admin/dashboard', { replace: true }); // Assuming admin is default post-login
    }
  }, [isAuthenticated, status, navigate]);

  const onFinish = async (values) => {
    // Dispatch the async thunk
    dispatch(loginUser({ username: values.username, password: values.password }));
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
  };

  // The RedirectIfAuthenticated component wrapped around LoginPage in App.js
  // should prevent rendering this if already authenticated.
  // This check is mainly for development if accessing LoginPage directly, or if there's a race condition.
  if (isAuthenticated && status !== 'loading') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4" style={{ backgroundImage: 'url(/background.jpg)', backgroundSize: 'cover' }}>
      <Card
        className="w-full max-w-md shadow-lg rounded-lg"
        style={{ padding: '2rem' }}
      >
        <div className="text-center mb-6">
          <Title level={2} className="text-gray-800">
            Welcome Back!
          </Title>
          <Text className="text-gray-500">
            Sign in to your account to continue.
          </Text>
        </div>

        {error && (
          <Alert
            message="Login Error"
            description={error}
            type="error"
            showIcon
            closable
            // You might add a 'clearError' action in your slice if you want to clear this on close
            className="mb-4"
          />
        )}

        {status === 'succeeded' && (
          <Alert
            message="Login Success"
            description="You have successfully logged in!"
            type="success"
            showIcon
            className="mb-4"
          />
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical" // Stack labels above inputs
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
            ]}
            className="mb-4"
          >
            <Input
              size="large"
              placeholder="Enter your username"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
            className="mb-6"
          >
            <Input.Password
              size="large"
              placeholder="Enter your password"
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" className="mb-6">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={status === 'loading'}
              className="w-full rounded-md py-2 text-lg font-semibold"
            >
              Log in
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            <a href="#" className="text-blue-500 hover:text-blue-700">
              Forgot password?
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;