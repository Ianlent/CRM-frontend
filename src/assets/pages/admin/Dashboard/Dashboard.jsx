import MetricCard from "./subcomponent/Card";
import DonutChart from "./subcomponent/PopularityDonut";
import RevenueLineChart from "./subcomponent/RevenueLineChart";
import OrderTrafficBarChart from "./subcomponent/OrderTraffic";
import RecentTransactionTable from "./subcomponent/RecentTransTable";
import { Divider, Select } from "antd";
import { useEffect, useState } from "react";
import DateSelection from "./subcomponent/DateSelector";

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'

import axiosInstance from "../../../../api/axiosInstance";

dayjs.extend(isBetween)






const AdminDashboard = () => {
	const [currentDateSelection, setCurrentDateSelection] = useState([dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]);
	const [popularityType, setPopularityType] = useState("quantity");
	const [financialSummary, setFinancialSummary] = useState(null);
	const [orderTraffic, setOrderTraffic] = useState(null);
	const [servicePopularity, setServicePopularity] = useState(null);
	const [todayAnalytic, setTodayAnalytic] = useState({});

	const handlePopularityTypeChange = (value) => {
		setPopularityType(value);
	}

	useEffect(() => {
		const { start, end } = currentDateSelection[0] ? { start: currentDateSelection[0], end: currentDateSelection[1] } : { start: dayjs().format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") };
		const fetchData = async () => {
			const financial = await axiosInstance.get(`/api/analytics/financial?start=${start}&end=${end}`);
			setFinancialSummary(financial.data.data);
			const orderTraffic = await axiosInstance.get(`/api/analytics/traffic?start=${start}&end=${end}`);
			setOrderTraffic(orderTraffic.data.data);
			if (start === dayjs().format("YYYY-MM-DD")) {
				setTodayAnalytic({
					...todayAnalytic,
					revenueToday: financial.data.data.overallTotals.totalRevenue,
					orderTrafficToday: orderTraffic.data.data.overallTotalVolume,
					ordersCompletedToday: orderTraffic.data.data.overallTotalCompletedVolume
				});
			}
		}
		fetchData();
	}, [currentDateSelection])

	useEffect(() => {
		const { start, end } = currentDateSelection[0] ? { start: currentDateSelection[0], end: currentDateSelection[1] } : { start: dayjs().format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") };
		const fetchData = async () => {
			const servicePopularity = await axiosInstance.get(`/api/analytics/service-popularity?type=${popularityType}&start=${start}&end=${end}`);
			setServicePopularity(servicePopularity.data);
			if (start === dayjs().format("YYYY-MM-DD")) {
				setTodayAnalytic({ ...todayAnalytic, servicePopularity: servicePopularity.data });
			}
		}
		fetchData();
	}, [currentDateSelection, popularityType])

	return (
		<>
			<div className="flex items-center justify-between w-full h-25 py-3">
				<div className="flex flex-col items-between justify-between">
					<p className="font-semibold text-4xl m-0 mt-2">Welcome back</p>
					<p className="text-base text-gray-600 mt-1">Track orders, manage customers, and stay on top of finances — all in one place.</p>
				</div>
				<div className="w-15%">
					<DateSelection onSelection={setCurrentDateSelection}></DateSelection>
				</div>
			</div>
			<div className="w-full">
				<Divider className="border-gray-600 m-0"></Divider>
			</div>


			<div className="grid grid-cols-3 grid-rows-1 divide-x divide-gray-500 mt-4">
				<MetricCard title={'Orders today'} stat={todayAnalytic.orderTrafficToday}></MetricCard>
				<MetricCard title={'Orders completed today'} stat={todayAnalytic.ordersCompletedToday}></MetricCard>
				<MetricCard title={'Revenue today'} stat={todayAnalytic.revenueToday}></MetricCard>
			</div>
			<div className="flex flex-row h-[27rem]">
				<div className="bg-white basis-1/3 mr-3 px-3 py-2 rounded-lg">
					<div className="flex flex-col items-center">
						<p className="font-semibold text-xl text-center m-0">Item Popularity by</p>
						<Select
							defaultValue="quantity"
							style={{ width: 120 }}
							onChange={handlePopularityTypeChange}
							options={[
								{ value: 'quantity', label: 'Quantity' },
								{ value: 'revenue', label: 'Revenue' },
							]}
						/>
					</div>
					<DonutChart data={servicePopularity} />
				</div>
				<div className="flex justify-between bg-white basis-2/3 p-2 rounded-lg">
					<OrderTrafficBarChart className="w-full flex flex-col items-center" data={orderTraffic}></OrderTrafficBarChart>
				</div>
			</div>
			<div className="w-full bg-white p-4 rounded-lg mt-4 h-[27rem]">
				<RevenueLineChart className="w-full flex flex-col items-center" data={financialSummary}></RevenueLineChart>
			</div>
			<div className="h-4"></div>
			{/* <div>
				<p className="mt-6 mb-1 font-semibold text-4xl">Recent Orders</p>
				<div className="w-full flex justify-center items-center">
					<div className="w-full my-3">
						<RecentTransactionTable data={[]}></RecentTransactionTable>
					</div>
				</div>
			</div> */}
		</>
	);
};

export default AdminDashboard;
