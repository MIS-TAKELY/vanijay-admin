'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { name: 'Jan', sales: 4000 },
    { name: 'Feb', sales: 3000 },
    { name: 'Mar', sales: 2000 },
    { name: 'Apr', sales: 2780 },
    { name: 'May', sales: 1890 },
    { name: 'Jun', sales: 2390 },
    { name: 'Jul', sales: 3490 },
];

export default function SalesChart() {
    return (
        <div className="h-[300px] w-full rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Sales Overview</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#8884d8"
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
