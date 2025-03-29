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
  // const financialData = {
  //   revenueData: [
  //       { name: "Monday", revenue: 900, expenses: 400, profit: 500 },
  //       { name: "Tuesday", revenue: 1100, expenses: 500, profit: 600 },
  //     ],
  //   expensesData: {
  //     weeklyExpenses: [
  //       { "name": "Rent & Utilities",
  //          "value": 700 },
  //       { "name": "Salaries & Wages", "value": 1300 },
  //       { "name": "Supplies & Inventory", "value": 830 },
  //       { "name": "Marketing & Ads", "value": 340 },
  //       { "name": "Miscellaneous", "value": 230 },]
  //   },
  // }
  

  const [currentDateSelection, setCurrentDateSelection] = useState([dayjs().startOf("day"), dayjs().endOf("day")]);
  const [expenses, setExpenses] = useState([]);
  const [revenue, setRevenue] = useState([]);

  const orderData = localStorage.getItem("Orders") ? JSON.parse(localStorage.getItem("Orders")) : [];

  const recentOrder = orderData.filter((record) => {
    return dayjs(record.time).isSame(dayjs(), "day"); //[{key: 1742530477699, time: "2025-03-21 11:14:37", customerName: "aaaa", status: "Completed", totalPrice: 11}]
  });

  const activeEmployees = localStorage.getItem("Employee") ? JSON.parse(localStorage.getItem("Employee")).filter((employee) => {
    return employee.status === "Active";
  }) : [];

  const financialData = localStorage.getItem("Finances") ? JSON.parse(localStorage.getItem("Finances")) : [];

  const revenueToday = financialData
    .filter((record) => {
      return dayjs(record.date).isSame(dayjs(), "day") && record.category === "Revenue"
    })
    .reduce((total, record) => total+record.amount, 0) + 
    recentOrder
    .filter((record) => {
      return record.status === "Completed"
    })
    .reduce((total, record) => total+record.totalPrice, 0)
    //OrderData record
    //{key: 1743272956806, time: "2025-03-30 01:29:16", customerName: "bbbbb", status: "Completed", totalPrice: 35}
  useEffect(() => {
    // {date: "2025-03-19", key: 1742391640724, type: "Rent", category: "Expense", amount: 10} Record format
  
    const currentExpenses = Object.values(
      financialData
        .filter(record => 
          record.category === "Expense" &&
          dayjs(record.date).isBetween(currentDateSelection[0], currentDateSelection[1], null, "[]")
        )
        .reduce((acc, record) => {
          // Use type as the key
          const key = record.type;
    
          // If the key doesn't exist, initialize it
          if (!acc[key]) {
            acc[key] = { name: key, value: 0 };
          }
    
          // Add the amount to the total
          acc[key].value += record.amount;
    
          return acc;
        }, {})
    );

    const currentRevenue = Object.values(
      [...financialData, ...orderData.filter((record)=>record.status==="Completed").map(({ time, totalPrice }) => ({
          date: dayjs(time).format("YYYY-MM-DD"), // Normalize order date format
          category: "Revenue", // Treat orders as revenue
          amount: totalPrice
        }))]
      .filter((record) => 
        dayjs(record.date).isBetween(currentDateSelection[0], currentDateSelection[1], null, "[]"))
      .reduce((acc, { date, category, amount }) => {
        acc[date] = acc[date] || { date: date, revenue: 0, expenses: 0, profit: 0 };
    
        if (category === "Revenue") acc[date].revenue += amount;
        if (category === "Expense") acc[date].expenses += amount;
    
        acc[date].profit = acc[date].revenue - acc[date].expenses;
        return acc;
      }, {})
    ).sort((a, b) => dayjs(a.date).unix() - dayjs(b.date).unix());

    setRevenue(currentRevenue)
    setExpenses(currentExpenses);
  }, [currentDateSelection])






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
          <MetricCard title={'Orders completed today'} stat={recentOrder.filter((record)=>record.status==="Completed").length}></MetricCard>
          <MetricCard title={'Revenue today'} stat={revenueToday}></MetricCard>
          <MetricCard title={'Active Employees'} stat={activeEmployees.length}></MetricCard>
      </div>
      <div className="flex flex-row h-[50vh]">
        <div className="bg-white basis-1/3 mr-3 px-3 py-2 rounded-lg">
          <p className="font-semibold text-xl text-center m-0">Expenses</p>
          <ExpenseDonutChart data={expenses}/>
        </div>
        <div className="flex justify-between bg-white basis-2/3 p-2 rounded-lg">
          <RevenueLineChart className="w-full flex flex-col items-center" data={revenue}></RevenueLineChart>
        </div>
      </div>
      <div>
        <p className="mt-6 mb-1 font-semibold text-4xl">Recent Orders</p>
        <div className="w-full flex justify-center items-center">
          <div className="w-full my-3">
            <RecentTransactionTable data={recentOrder}></RecentTransactionTable>
          </div>
        </div>
      </div>      
    </>
  );
};

export default AdminDashboard;
