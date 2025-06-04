import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import dayjs from 'dayjs';
import { useState } from 'react';

const RevenueLineChart = ({ className, data }) => {
    const [activeLines, setActiveLines] = useState({
        revenue: true,
        expenses: true,
        profit: true
    });

    const dailySummary = data?.dailySummary || [];
    const overallTotals = data?.overallTotals || { totalRevenue: 0, totalExpenses: 0, totalProfit: 0, totalProfitMargin: 0 };

    const handleLegendClick = (e) => {
        const { dataKey } = e;
        setActiveLines(prev => ({
            ...prev,
            [dataKey]: !prev[dataKey]
        }));
    };

    const CustomLegendContent = (props) => {
        const { payload } = props; // 'payload' contains the data for each legend item (name, color, dataKey, etc.)

        return (
            <ul className="flex justify-center mt-2"> {/* Tailwind classes for layout */}
                {
                    payload.map((entry, index) => {
                        const { dataKey, color, value } = entry;
                        // Check if the line associated with this legend item is active
                        const isActive = activeLines[dataKey];

                        return (
                            <li
                                key={`item-${index}`}
                                className={`flex items-center mr-4 cursor-pointer select-none ${isActive ? '' : 'opacity-50'}`} // Apply cursor-pointer and opacity toggle
                                onClick={() => handleLegendClick({ dataKey: dataKey })} // Re-attach the click handler
                            >
                                {/* The colored square/circle icon */}
                                <span
                                    className="inline-block w-3 h-3 rounded-full mr-1"
                                    style={{ backgroundColor: color }}
                                ></span>
                                {/* The legend text (e.g., "Revenue", "Expenses") */}
                                <span className="text-sm">{value}</span>
                            </li>
                        );
                    })
                }
            </ul>
        );
    };

    return (
        <div className={`${className} flex flex-col`}> {/* Add flex-col for better layout */}
            <div className='w-full flex justify-between items-center mb-4 px-7'> {/* Flex container for title and totals */}
                <div className='flex flex-col'>
                    <p className='font-semibold text-2xl m-0'>Financial Summary</p>
                    <p className='font-light text-base m-0'>Profit Margin: <b className='text-blue-600'>{overallTotals.totalProfitMargin.toFixed(2)}%</b></p>
                </div>
                <div className='flex flex-col text-right'> {/* Overall totals on the right */}
                    <p className='text-lg font-medium m-0'>Total Revenue: <b className='text-[#8884d8]'>${overallTotals.totalRevenue.toFixed(2)}</b></p>
                    <p className='text-lg font-medium m-0'>Total Expenses: <b className='text-[#82ca9d]'>${overallTotals.totalExpenses.toFixed(2)}</b></p>
                    <p className='text-lg font-medium m-0'>Total Profit: <b className='text-[#ff7300]'>${overallTotals.totalProfit.toFixed(2)}</b></p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}> {/* Give it a fixed height or set to 100% and manage parent height */}
                <LineChart data={dailySummary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM DD')} />
                    <YAxis allowDecimals={false} />
                    <ReferenceLine y={0} stroke="red" strokeWidth={1} strokeDasharray="5 5" />
                    <Tooltip />
                    {/* The Recharts Legend component here is for toggling lines */}
                    <Legend content={<CustomLegendContent />} />
                    <Line type="monotone" dataKey="revenue" strokeWidth={2} stroke="#8884d8" strokeOpacity={activeLines.revenue ? 1 : 0.2} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" strokeWidth={2} stroke="#82ca9d" strokeOpacity={activeLines.expenses ? 1 : 0.2} name="Expenses" />
                    <Line type="monotone" dataKey="profit" strokeWidth={2} stroke="#ff7300" activeDot={{ r: 8 }} strokeOpacity={activeLines.profit ? 1 : 0.2} name="Profit" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueLineChart;