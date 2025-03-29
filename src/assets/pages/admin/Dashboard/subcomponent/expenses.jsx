import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6666"];

const ExpenseDonutChart = ({data}) => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    return (
        <ResponsiveContainer width="100%" height="90%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value, name) => {
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [`${name}: ${value}VND (${percentage}%)`]; // Format: "1200 (40.0%)"
                    }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpenseDonutChart;