// src/components/Charts.js
import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1'];
const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border border-slate-200 rounded-md shadow-lg">
                {/* For BarChart, show the month as a label. For PieChart, this will be empty. */}
                {label && <p className="label text-slate-800 font-semibold">{`${label}`}</p>}

                {payload.map((pld, index) => (
                    <div key={index} style={{ color: pld.color }}>
                        {/* Shows "Category: Value" for both chart types */}
                        {`${pld.name}: ${formatIDR(pld.value)}`}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function MonthlyStats({ stats }) {
    const { monthlySummary, categorySummary } = stats;
    const availableMonths = useMemo(() => Object.keys(categorySummary || {}).sort().reverse(), [categorySummary]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

    const handlePrevMonth = () => setCurrentMonthIndex(i => Math.min(i + 1, availableMonths.length - 1));
    const handleNextMonth = () => setCurrentMonthIndex(i => Math.max(i - 1, 0));

    const selectedMonthKey = availableMonths[currentMonthIndex];
    const pieData = categorySummary[selectedMonthKey] || [];
    const selectedMonthDate = new Date(selectedMonthKey + '-02');
    const monthLabel = selectedMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!monthlySummary || monthlySummary.length === 0) return <p className="text-center text-gray-500 p-8">No monthly data to display yet.</p>;

    const barChartData = monthlySummary.map(item => ({ name: item.month, Income: item.income, Expenses: item.expenses }));
    const tickColor = '#4B5563';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Income vs. Expenses</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
                        <YAxis tickFormatter={formatIDR} tick={{ fill: tickColor, fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: "14px", color: tickColor }} />
                        <Bar dataKey="Income" fill="#10B981" />
                        <Bar dataKey="Expenses" fill="#DC2626" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-700">Expense Breakdown</h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevMonth} disabled={currentMonthIndex >= availableMonths.length - 1} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors">‹ Prev</button>
                        <button onClick={handleNextMonth} disabled={currentMonthIndex === 0} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors">Next ›</button>
                    </div>
                </div>
                <p className="text-center font-semibold text-blue-500 mb-2">{monthLabel}</p>
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie data={pieData} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                            return percent > 0.05 ? <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12">{`${(percent * 100).toFixed(0)}%`}</text> : null;
                        }}>
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: "12px", color: tickColor }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function DailyStats({ stats }) {
    const { dailySummary } = stats;
    if (!dailySummary || dailySummary.length === 0) return <p className="text-center text-gray-500 p-8">No daily expense data for this month.</p>;
    const tickColor = '#4B5563';

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Expenses This Month (Daily)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySummary}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                    <XAxis dataKey="day" tick={{ fill: tickColor, fontSize: 12 }} />
                    <YAxis tickFormatter={formatIDR} tick={{ fill: tickColor, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: "14px", color: tickColor }} />
                    <Bar dataKey="expenses" name="Daily Expenses" fill="#DC2626" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
