import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import dayjs from 'dayjs';
import { useState } from 'react';

const RevenueLineChart = ({ className, data }) => {
    const [activeLines, setActiveLines] = useState({
        revenue: true,
        expenses: true,
        profit: true
    });

    const profitMargin = (data) => {
        const totalRevenue = data.reduce((sum, entry) => sum + entry.revenue, 0);
        const totalProfit = data.reduce((sum, entry) => sum + entry.profit, 0);
        return totalRevenue !== 0 ? (totalProfit / totalRevenue) * 100 : 0;
    };

    const handleLegendClick = (e) => {
        const { dataKey } = e;
        setActiveLines(prev => ({
            ...prev,
            [dataKey]: !prev[dataKey]  // Toggle visibility
        }));
    };

    return (
        <div className={className}>
            <p className='font-semibold text-xl m-0 mt-1'>Financial Summary</p>
            <p className='font-light text-sm m-0'>Profit Margin: <b>{profitMargin(data).toFixed(2)}%</b></p>
            <ResponsiveContainer height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM DD')} />
                    <YAxis allowDecimals={false} />
                    <ReferenceLine y={0} stroke="red" strokeWidth={1} strokeDasharray="5 5" />
                    <Tooltip />
                    <Legend onClick={handleLegendClick} />
                    <Line type="monotone" dataKey="revenue" strokeWidth={2} stroke="#8884d8" strokeOpacity={activeLines.revenue ? 1 : 0.2} />
                    <Line type="monotone" dataKey="expenses" strokeWidth={2} stroke="#82ca9d" strokeOpacity={activeLines.expenses ? 1 : 0.2} />
                    <Line type="monotone" dataKey="profit" strokeWidth={2} stroke="#ff7300" activeDot={{ r: 8 }} strokeOpacity={activeLines.profit ? 1 : 0.2} />
                </LineChart>
            </ResponsiveContainer>
        </div>

    );
};

export default RevenueLineChart;