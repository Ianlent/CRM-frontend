// src/components/CreateOrderModal.jsx
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
import useDebounce from "../../../../../hooks/useDebounce";

const { Option } = Select;

const vietnameseMobilePrefixes = [
    "032", "033", "034", "035", "036", "037", "038", "039", // Viettel (new)
    "070", "076", "077", "078", "079", // MobiFone (new)
    "081", "082", "083", "084", "085", // VinaPhone (new)
    "056", "058", // Vietnamobile (new)
    "059", // Gmobile (new)
    "090", "093", // MobiFone (old)
    "089", // MobiFone (old)
    "091", "094", // VinaPhone (old)
    "088", // VinaPhone (old)
    "092", // Vietnamobile (old)
    "099", // Gmobile (old)
    "096", "097", "098", // Viettel (old)
];

// Regex for Vietnamese phone numbers: starts with '0', followed by a valid prefix, then 7 more digits
const phoneNumberRegex = new RegExp(
    `^(0(${vietnameseMobilePrefixes.map(p => p.substring(1)).join("|")}))\\d{7}$`
);

const CreateOrderModal = ({ visible, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [services, setServices] = useState([]); // All fetched services, used for calculation and mapping
    const [serviceSearchOptions, setServiceSearchOptions] = useState([]); // Options for AutoComplete
    const [discounts, setDiscounts] = useState([]);
    const [handlers, setHandlers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customerSearchOptions, setCustomerSearchOptions] = useState([]);
    const [isNewCustomer, setIsNewCustomer] = useState(false); // State to toggle new/existing customer form

    const [customerSearchInput, setCustomerSearchInput] = useState('');
    const debouncedCustomerSearchInput = useDebounce(customerSearchInput, 500);

    const fetchDependencies = useCallback(async () => {
        setLoading(true);
        try {
            const [servicesRes, discountsRes, usersRes] = await Promise.all([
                axiosInstance.get("/api/services"),
                axiosInstance.get("/api/discounts"),
                axiosInstance.get("/api/users"),
            ]);
            setServices(servicesRes.data.data);
            setDiscounts(discountsRes.data.data);
            setHandlers(usersRes.data.data);
        } catch (error) {
            console.error("Failed to fetch dependencies:", error);
            message.error("Failed to load initial data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (visible) {
            fetchDependencies();
            form.resetFields();
            setIsNewCustomer(false);
            setSelectedCustomerId(null);
            setCustomerSearchInput('');
            setCustomerSearchOptions([]);
        }
    }, [visible, fetchDependencies, form]);

    useEffect(() => {
        const searchCustomers = async () => {
            // Only search if there's a debounced input and we're in "existing customer" mode
            if (debouncedCustomerSearchInput.length > 0 && !isNewCustomer) {
                setLoading(true);
                try {
                    const res = await axiosInstance.get(`/api/customers/search`, {
                        params: {
                            phoneNumber: debouncedCustomerSearchInput
                        }
                    });

                    const customersData = res.data.data;
                    setCustomers(customersData); // Update the main customers state if needed elsewhere
                    setCustomerSearchOptions(
                        customersData.map(customer => ({
                            value: customer._id,
                            label: `${customer.firstName} ${customer.lastName} (${customer.phoneNumber})`
                        }))
                    );
                } catch (error) {
                    console.error("Failed to search customers:", error);
                    setCustomerSearchOptions([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setCustomerSearchOptions([]);
                setCustomers([]);
            }
        };

        searchCustomers();
    }, [debouncedCustomerSearchInput, isNewCustomer]);

    const onSearchService = async (searchText) => {
        try {
            const response = await axiosInstance.get(
                `/api/services?search=${searchText}&limit=100` // Use search parameter
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
            const { services: rawNewServices, customerInfo, ...orderPayload } = values;

            // --- STEP 1: Aggregate services from the form using reduce() ---
            const aggregatedServicesMap = rawNewServices.reduce((acc, currentSvc) => {
                // Ensure serviceId exists and is valid, and numberOfUnit is a number
                if (currentSvc.serviceId && typeof currentSvc.numberOfUnit === 'number' && currentSvc.numberOfUnit > 0) {
                    const serviceDetails = services.find(s => s._id === currentSvc.serviceId); // Use the 'services' state here
                    if (serviceDetails) { // Ensure service details are found
                        if (acc.has(currentSvc.serviceId)) {
                            // If service already in accumulator, add to its numberOfUnit
                            const existingSvc = acc.get(currentSvc.serviceId);
                            existingSvc.numberOfUnit += currentSvc.numberOfUnit;
                            // Recalculate totalPrice for the aggregated service
                            existingSvc.totalPrice = existingSvc.numberOfUnit * existingSvc.pricePerUnit;
                            acc.set(currentSvc.serviceId, existingSvc);
                        } else {
                            // If new service, add it to the map
                            const totalPrice = currentSvc.numberOfUnit * serviceDetails.servicePricePerUnit;
                            acc.set(currentSvc.serviceId, {
                                serviceId: currentSvc.serviceId,
                                numberOfUnit: currentSvc.numberOfUnit,
                                serviceName: serviceDetails.serviceName,
                                serviceUnit: serviceDetails.serviceUnit,
                                pricePerUnit: serviceDetails.servicePricePerUnit,
                                totalPrice: totalPrice,
                            });
                        }
                    }
                }
                return acc;
            }, new Map());

            const finalServicesForCreation = Array.from(aggregatedServicesMap.values());
            // --- END STEP 1 ---

            // --- STEP 2: Handle Customer creation/selection ---
            let selectedCustomerIdToSend = selectedCustomerId;
            let customerInfoToSend = customerInfo;

            if (isNewCustomer) {
                // Create new customer
                const newCustomerRes = await axiosInstance.post('/api/customers', customerInfo);
                selectedCustomerIdToSend = newCustomerRes.data.data._id;
                // Use the data returned from the new customer creation for customerInfoToSend
                customerInfoToSend = newCustomerRes.data.data;
            } else if (selectedCustomerId) {
                // Fetch existing customer info to embed it
                const existingCustomerRes = await axiosInstance.get(`/api/customers/${selectedCustomerId}`);
                customerInfoToSend = existingCustomerRes.data.data;
            } else {
                // This case should ideally be prevented by form validation (customer is required)
                throw new Error("No customer selected or created.");
            }
            // --- END STEP 2 ---

            // Ensure orderDate is correctly formatted for the backend
            const formattedOrderDate = orderPayload.orderDate ? orderPayload.orderDate.toISOString() : undefined;

            // Construct the final payload for the backend
            const finalPayload = {
                customerId: selectedCustomerIdToSend, // Use the actual customer ID
                customerInfo: { // Ensure all required fields are passed for embedded customerInfo
                    firstName: customerInfoToSend.firstName,
                    lastName: customerInfoToSend.lastName,
                    phoneNumber: customerInfoToSend.phoneNumber,
                    address: customerInfoToSend.address,
                },
                orderDate: formattedOrderDate,
                handlerId: orderPayload.handlerId || undefined, // Send if selected, otherwise undefined
                discountId: orderPayload.discountId || undefined, // Send if selected, otherwise undefined
                services: finalServicesForCreation, // Use the aggregated services
            };

            // Remove handlerId/discountId if they are explicitly null/undefined (e.g., if Select allows clear)
            if (finalPayload.handlerId === null) delete finalPayload.handlerId;
            if (finalPayload.discountId === null) delete finalPayload.discountId;


            const res = await axiosInstance.post("/api/orders", finalPayload);

            message.success(res.data.message || "Order created successfully!");
            onSuccess(); // Trigger parent component to refresh data
            onCancel(); // Close the modal
        } catch (error) {
            console.error("Failed to create order:", error);
            message.error(
                error.response?.data?.details || "Failed to create order."
            );
        } finally {
            setLoading(false);
        }
    };

    // Calculate total price for a service line item
    const calculateServiceTotalPrice = (serviceId, numberOfUnit) => {
        const service = services.find(s => s._id === serviceId); // Find service from the `services` state (all fetched services)
        return service && numberOfUnit ? service.servicePricePerUnit * numberOfUnit : 0; // Use servicePricePerUnit
    };

    return (
        <Modal
            title="Create New Order"
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true} // Ensures form resets on close
        >
            <Spin spinning={loading}>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item label="Order Date" name="orderDate" initialValue={dayjs()} rules={[{ required: true, message: 'Please select an order date!' }]}>
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
                    </Form.Item>

                    {/* Customer Selection/Creation Section */}
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Customer Details</h3>
                    <Form.Item label="Customer Type">
                        <Select
                            value={isNewCustomer ? "new" : "existing"}
                            onChange={(value) => {
                                setIsNewCustomer(value === "new");
                                form.resetFields(['customerInfo', 'customerId']);
                                setSelectedCustomerId(null);
                                setCustomerSearchInput('');
                                setCustomerSearchOptions([]);
                            }}
                        >
                            <Option value="existing">Existing Customer</Option>
                            <Option value="new">New Customer</Option>
                        </Select>
                    </Form.Item>

                    {isNewCustomer ? (
                        // ... New Customer Form Fields ...
                        <>
                            <Form.Item
                                label="First Name"
                                name={['customerInfo', 'firstName']}
                                rules={[
                                    { required: true, message: 'First name is required' },
                                    { min: 2, message: 'First name must be at least 2 characters' },
                                    { max: 32, message: 'First name cannot exceed 32 characters' },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Last Name"
                                name={['customerInfo', 'lastName']}
                                rules={[
                                    { required: true, message: 'Last name is required' },
                                    { min: 2, message: 'Last name must be at least 2 characters' },
                                    { max: 32, message: 'Last name cannot exceed 32 characters' },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Phone Number"
                                name={['customerInfo', 'phoneNumber']}
                                rules={[
                                    { required: true, message: 'Phone number is required.' },
                                    { len: 10, message: 'Phone number must be exactly 10 digits long.' },
                                    {
                                        pattern: phoneNumberRegex,
                                        message: 'Invalid Vietnamese phone number format. It must be a 10-digit number starting with a valid mobile carrier prefix (e.g., 090, 032, 079).',
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Address"
                                name={['customerInfo', 'address']}
                                rules={[
                                    { required: true, message: 'Address is required' },
                                    { min: 5, message: 'Address must be at least 5 characters' },
                                    { max: 128, message: 'Address cannot exceed 128 characters' },
                                ]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                        </>
                    ) : (
                        <Form.Item label="Search Customer" name="customerId" rules={[{ required: true, message: 'Please select a customer!' }]}>
                            <AutoComplete
                                options={customerSearchOptions}
                                onSearch={(value) => {
                                    setCustomerSearchInput(value);
                                    // No need to manually call searchCustomers here, debounced effect will handle it
                                }}
                                onSelect={(value, option) => {
                                    setSelectedCustomerId(value);
                                    form.setFieldsValue({ customerId: value });
                                }}
                                placeholder="Search by phone number"
                                allowClear
                                value={customerSearchInput} // Controlled component: display current input or selected label
                                onChange={(value) => {
                                    setCustomerSearchInput(value);
                                    // Clear selected ID if the user types again after selecting
                                    if (selectedCustomerId && value !== customers.find(c => c._id === selectedCustomerId)?.firstName + ' ' + customers.find(c => c._id === selectedCustomerId)?.lastName + ' (' + customers.find(c => c._id === selectedCustomerId)?.phoneNumber + ')') {
                                        setSelectedCustomerId(null);
                                        form.setFieldsValue({ customerId: undefined }); // Clear form value too
                                    }
                                }}
                            />
                        </Form.Item>
                    )}

                    <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-700">Services</h3>
                    <Form.List name="services" rules={[{ required: true, message: "Please add at least one service!" }]}>
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
                                                {/* AutoComplete for services */}
                                                <AutoComplete
                                                    options={serviceSearchOptions}
                                                    onSearch={onSearchService}
                                                    placeholder="Type to search services..."
                                                    filterOption={(inputValue, option) =>
                                                        option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                                    }
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

                    <Form.Item className="mt-6">
                        <Button type="primary" htmlType="submit" loading={loading} className="w-full">
                            Create Order
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default CreateOrderModal;