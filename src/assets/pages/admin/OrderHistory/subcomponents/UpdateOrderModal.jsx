// src/components/UpdateOrderModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
	Modal,
	Form,
	Input,
	Button,
	Select,
	InputNumber,
	message,
	DatePicker,
	Spin,
	Space,
	Card,
	Popconfirm,
	AutoComplete,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axiosInstance from "../../../../../api/axiosInstance";

const { Option } = Select;

const UpdateOrderModal = ({ visible, onCancel, onSuccess, orderData }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [services, setServices] = useState([]); // All fetched services, used for calculation and mapping
	const [serviceSearchOptions, setServiceSearchOptions] = useState([]); // Options for AutoComplete
	const [discounts, setDiscounts] = useState([]);
	const [handlers, setHandlers] = useState([]);

	// Store the original services to compare with the new services after form submission
	const [originalServices, setOriginalServices] = useState([]);

	const fetchDependencies = useCallback(async () => {
		setLoading(true);
		try {
			const [servicesRes, discountsRes, usersRes] = await Promise.all([
				axiosInstance.get("/api/services?limit=100"), // Fetch all services by default
				axiosInstance.get("/api/discounts?limit=100"),
				axiosInstance.get("/api/users?limit=100"),
			]);

			setServices(servicesRes.data.data);
			setServiceSearchOptions(
				servicesRes.data.data.map((service) => ({
					value: service._id,
					label: `${service.serviceName} ($${service.servicePricePerUnit}/${service.serviceUnit})`,
				}))
			);
			setDiscounts(discountsRes.data.data);
			setHandlers(usersRes.data.data.filter((user) => user.userRole !== "customer" && user.userStatus === "active"));
		} catch (error) {
			message.error("Failed to load dependencies: " + error.message);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (visible && orderData) {
			// Set the initial form values
			form.setFieldsValue({
				orderDate: dayjs(orderData.orderDate),
				handlerId: orderData.handlerId,
				discountId: orderData.discountId,
				customerInfo: {
					firstName: orderData.customerInfo?.firstName,
					lastName: orderData.customerInfo?.lastName,
					phoneNumber: orderData.customerInfo?.phoneNumber,
					address: orderData.customerInfo?.address,
				},
				orderStatus: orderData.orderStatus,
				// Map the services for the Form.List
				services: orderData.services.map(svc => ({
					serviceId: svc.serviceId,
					numberOfUnit: svc.numberOfUnit,
					// We don't set totalPrice here as it's computed
				})),
			});
			// Store a deep copy of original services for comparison later
			setOriginalServices(JSON.parse(JSON.stringify(orderData.services)));
			fetchDependencies();
		}
	}, [visible, orderData, form, fetchDependencies]);

	const onSearchService = async (searchText) => {
		try {
			const response = await axiosInstance.get(
				`/api/services?search=${searchText}&limit=100`
			);
			setServices(response.data.data); // Update the services state with filtered results
			setServiceSearchOptions(
				response.data.data.map((service) => ({
					value: service._id,
					label: `${service.serviceName} ($${service.servicePricePerUnit}/${service.serviceUnit})`,
				}))
			);
		} catch (error) {
			console.error("Service search error:", error);
			message.error("Failed to search services.");
			setServiceSearchOptions([]);
		}
	};


	const onFinish = async (values) => {
		setLoading(true);
		try {
			const { services: rawNewServices, ...mainOrderDetails } = values;
			const orderId = orderData.orderId;
			// --- STEP 1: Aggregate new services from the form using reduce() ---
			const aggregatedNewServicesMap = rawNewServices.reduce((acc, currentSvc) => {
				// Ensure serviceId exists and is valid, and numberOfUnit is a number
				if (currentSvc.serviceId && typeof currentSvc.numberOfUnit === 'number' && currentSvc.numberOfUnit > 0) {
					if (acc.has(currentSvc.serviceId)) {
						// If service already in accumulator, add to its numberOfUnit
						const existingSvc = acc.get(currentSvc.serviceId);
						existingSvc.numberOfUnit += currentSvc.numberOfUnit;
						acc.set(currentSvc.serviceId, existingSvc);
					} else {
						// If new service, add it to the map (deep copy to avoid mutation issues)
						acc.set(currentSvc.serviceId, { ...currentSvc });
					}
				}
				return acc;
			}, new Map()); // Initialize accumulator as a new Map

			// --- END STEP 1 ---

			// --- STEP 2: Prepare original services for comparison ---
			// Create a map for quick lookups of original services by serviceId
			const originalServicesMap = new Map();
			originalServices.forEach((svc) => {
				originalServicesMap.set(svc.serviceId.toString(), { ...svc }); // Convert ObjectId to string
			});
			// --- END STEP 2 ---

			const updatePromises = [];

			// Promise for main order details update
			updatePromises.push(
				axiosInstance.put(`/api/orders/${orderId}`, {
					...mainOrderDetails,
					// Ensure customerInfo is correctly structured for the backend
					customerInfo: {
						firstName: mainOrderDetails.customerInfo.firstName,
						lastName: mainOrderDetails.customerInfo.lastName,
						phoneNumber: mainOrderDetails.customerInfo.phoneNumber,
						address: mainOrderDetails.customerInfo.address,
					},
					orderDate: mainOrderDetails.orderDate.toISOString(), // Ensure date is ISO string
				})
			);

			// --- STEP 3: Determine and queue service-specific updates ---

			// A. Identify and queue DELETE requests for removed services
			for (const [serviceId, originalSvc] of originalServicesMap.entries()) {
				if (!aggregatedNewServicesMap.has(serviceId)) {
					// Service was in original list but not in the new aggregated list, so it was removed
					updatePromises.push(
						axiosInstance.delete(`/api/orders/${orderId}/services/${serviceId}`)
					);
				}
			}

			// B. Identify and queue POST/PUT requests for added or updated services
			for (const [serviceId, newSvc] of aggregatedNewServicesMap.entries()) {
				const originalSvc = originalServicesMap.get(serviceId);

				if (!originalSvc) {
					updatePromises.push(
						axiosInstance.post(`/api/orders/${orderId}/services`, {
							serviceId: newSvc.serviceId,
							numberOfUnit: newSvc.numberOfUnit,
						})
					);
				} else if (originalSvc.numberOfUnit !== newSvc.numberOfUnit) {
					// Service existed and its quantity changed, so update it
					// This is a direct quantity update for an existing service line item
					updatePromises.push(
						axiosInstance.put(`/api/orders/${orderId}/services/${serviceId}`, {
							numberOfUnit: newSvc.numberOfUnit,
						})
					);
				}
				// If service exists and numberOfUnit is the same, no action needed for this service
			}
			// --- END STEP 3 ---

			// --- STEP 4: Execute all accumulated promises concurrently ---
			await Promise.all(updatePromises);

			message.success("Order updated successfully!");
			onSuccess(); // Trigger parent component to refresh data
			onCancel(); // Close the modal
		} catch (error) {
			console.error("Failed to update order:", error.response?.data?.details || error.message);
			message.error(
				error.response?.data?.details || "Failed to update order."
			);
		} finally {
			setLoading(false);
		}
	};

	const calculateServiceTotalPrice = (serviceId, numberOfUnit) => {
		const service = services.find(s => s._id === serviceId);
		return service && numberOfUnit ? service.servicePricePerUnit * numberOfUnit : 0;
	};

	return (
		<Modal
			title="Update Order"
			visible={visible}
			onCancel={onCancel}
			footer={null}
			width={800}
			destroyOnClose={true}
		>
			<Spin spinning={loading}>
				<Form form={form} layout="vertical" onFinish={onFinish}>
					<Form.Item label="Order Date" name="orderDate" rules={[{ required: true, message: 'Please select an order date!' }]}>
						<DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
					</Form.Item>

					<h3 className="text-lg font-semibold mb-2 mt-4 text-gray-700">Customer Information</h3>
					<Card className="mb-4 bg-gray-50 border border-gray-200">
						<Form.Item label="First Name" name={["customerInfo", "firstName"]} rules={[{ required: true, message: 'Please input customer first name!' }]}>
							<Input />
						</Form.Item>
						<Form.Item label="Last Name" name={["customerInfo", "lastName"]}>
							<Input />
						</Form.Item>
						<Form.Item label="Phone Number" name={["customerInfo", "phoneNumber"]} rules={[{ required: true, message: 'Please input customer phone number!' }]}>
							<Input />
						</Form.Item>
						<Form.Item label="Address" name={["customerInfo", "address"]}>
							<Input.TextArea />
						</Form.Item>
					</Card>


					<h3 className="text-lg font-semibold mb-2 mt-4 text-gray-700">Services</h3>
					<Form.List name="services">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, fieldKey, ...restField }) => (
									<Card key={key} size="small" className="mb-2 bg-blue-50 border border-blue-200">
										<Space align="baseline" className="w-full justify-between">
											<Form.Item
												{...restField}
												name={[name, "serviceId"]}
												fieldKey={[fieldKey, "serviceId"]}
												rules={[{ required: true, message: "Missing service" }]}
												className="flex-grow min-w-[200px]"
											>
												<AutoComplete
													options={serviceSearchOptions}
													onSearch={onSearchService}
													placeholder="Type to search services..."
													filterOption={(inputValue, option) =>
														option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
													}
													allowClear
												/>
											</Form.Item>
											<Form.Item
												{...restField}
												name={[name, "numberOfUnit"]}
												fieldKey={[fieldKey, "numberOfUnit"]}
												rules={[{ required: true, message: "Missing quantity" }]}
												className="w-[120px]"
											>
												<InputNumber min={1} placeholder="Quantity" />
											</Form.Item>
											<Form.Item
												noStyle
												shouldUpdate={(prevValues, curValues) =>
													prevValues.services?.[name]?.serviceId !== curValues.services?.[name]?.serviceId ||
													prevValues.services?.[name]?.numberOfUnit !== curValues.services?.[name]?.numberOfUnit
												}
											>
												{({ getFieldValue }) => {
													const serviceId = getFieldValue(["services", name, "serviceId"]);
													const numberOfUnit = getFieldValue(["services", name, "numberOfUnit"]);
													const totalPrice = calculateServiceTotalPrice(serviceId, numberOfUnit);
													return (
														<span className="font-semibold text-lg text-green-700 w-[100px] text-right">
															${totalPrice.toFixed(2)}
														</span>
													);
												}}
											</Form.Item>
											<Button onClick={() => remove(name)} danger icon={<DeleteOutlined />} />
										</Space>
									</Card>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										Add Service
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>

					<h3 className="text-lg font-semibold mb-2 mt-4 text-gray-700">Other Details</h3>
					<Form.Item label="Handler" name="handlerId">
						<Select placeholder="Select a handler" allowClear>
							{handlers.map((handler) => (
								<Option key={handler._id} value={handler._id}>
									{handler.username}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item label="Discount" name="discountId">
						<Select placeholder="Select a discount" allowClear>
							{discounts.map((discount) => (
								<Option key={discount._id} value={discount._id}>
									{discount.discountName} ({discount.amount}
									{discount.discountType === "percent" ? "%" : "$"})
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item label="Status" name="orderStatus">
						<Select placeholder="Change order status" allowClear>
							<Option value="completed">Completed</Option>
							<Option value="confirmed">In Progress</Option>
							<Option value="pending">Pending</Option>
							<Option value="cancelled">Cancelled</Option>
						</Select>
					</Form.Item>

					<Form.Item className="mt-6">
						<Button type="primary" htmlType="submit" loading={loading} className="w-full">
							Update Order
						</Button>
					</Form.Item>
				</Form>
			</Spin>
		</Modal>
	);
};

export default UpdateOrderModal;