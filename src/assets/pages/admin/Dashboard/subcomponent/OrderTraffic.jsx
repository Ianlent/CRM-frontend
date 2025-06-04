import React from 'react';
// Import BarChart and Bar components
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const OrderTrafficBarChart = ({ className, data }) => {
    // Extract dailyVolume and overallTotalVolume from the incoming data prop
    const dailyVolume = data?.dailyVolume || [];
    const overallTotalVolume = data?.overallTotalVolume || 0;

    return (
        <div className={className}>
            <p className='font-semibold text-xl m-0 mt-1'>Order Traffic Summary</p>
            {/* Display overall total volume */}
            <p className='font-light text-sm m-0'>Total Orders: <b className='text-blue-600'>{overallTotalVolume}</b></p>
            <ResponsiveContainer height="100%">
                {/* Changed from LineChart to BarChart */}
                <BarChart data={dailyVolume} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM DD')} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {/* Changed from Line to Bar */}
                    {/* dataKey 'count' matches your API response */}
                    <Bar dataKey="count" fill="#4CAF50" name="Daily Orders" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrderTrafficBarChart;