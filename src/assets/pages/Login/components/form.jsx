import { Button, Checkbox, Form, Input } from 'antd';

const LoginForm = ({ onFinish, onFinishFailed, loading }) => {
	return (
		<Form
			className='w-[85%]'
			name="basic"
			labelCol={{
				span: 8,
			}}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			wrapperCol={{
				span: 16,
			}}
			initialValues={{
				remember: true,
			}}
			autoComplete="off"
		>
			<Form.Item
				label="Email"
				name="email"
				rules={[
					{
						required: true,
						message: 'Please input your email!',
					},
					{
						type: "email",
						message: "Invalid email format!"
					}
				]}
			>
				<Input />
			</Form.Item>

			<Form.Item
				label="Password"
				name="password"
				rules={[
					{
						required: true,
						message: 'Please input your password!',
					},
				]}
			>
				<Input.Password />
			</Form.Item>

			<Form.Item name="remember" valuePropName="checked" label={null}>
				<Checkbox>Remember me</Checkbox>
			</Form.Item>

			<Form.Item label={null}>
				<Button loading={loading} type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	)
}

export default LoginForm