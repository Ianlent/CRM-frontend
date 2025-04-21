import MetricCard from "./subcomponent/card";
import ExpenseDonutChart from "./subcomponent/expenses";
import RevenueLineChart from "./subcomponent/revenue";
import RecentTransactionTable from "./subcomponent/RecentTransTable";
import { Divider } from "antd";
import { useEffect, useState } from "react";
import DateSelection from "./subcomponent/dateSelector";

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)






const AdminDashboard = () => {

	const [currentDateSelection, setCurrentDateSelection] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);

	return (
		<>
			<div className="flex flex-col items-center pt-3">
				<div className="flex items-center justify-between w-full">
					<div className="flex flex-col items-start">
						<p className="font-semibold text-4xl">Welcome back</p>
						<p className="text-base text-gray-600 mt-1">Track orders, manage customers, and stay on top of finances — all in one place.</p>
					</div>        
					<div className="w-15%">
						<DateSelection onSelection={setCurrentDateSelection}></DateSelection>
					</div>
				</div>
				<div className="w-full">
					<Divider className="border-gray-600"></Divider>
				</div>
			</div>
			
			
			<div className="grid grid-cols-3 grid-rows-1 divide-x divide-gray-500">
					<MetricCard title={'Orders completed today'} stat={0}></MetricCard>
					<MetricCard title={'Revenue today'} stat={0}></MetricCard>
					<MetricCard title={'Active Employees'} stat={0}></MetricCard>
			</div>
			<div className="flex flex-row h-[50vh]">
				<div className="bg-white basis-1/3 mr-3 px-3 py-2 rounded-lg">
					<p className="font-semibold text-xl text-center m-0">Expenses</p>
					<ExpenseDonutChart data={[]}/>
				</div>
				<div className="flex justify-between bg-white basis-2/3 p-2 rounded-lg">
					<RevenueLineChart className="w-full flex flex-col items-center" data={[]}></RevenueLineChart>
				</div>
			</div>
			<div>
				<p className="mt-6 mb-1 font-semibold text-4xl">Recent Orders</p>
				<div className="w-full flex justify-center items-center">
					<div className="w-full my-3">
						<RecentTransactionTable data={[]}></RecentTransactionTable>
					</div>
				</div>
			</div>      
		</>
	);
};

export default AdminDashboard;
