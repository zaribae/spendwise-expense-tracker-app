// src/components/Charts.js
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1'];
const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 border border-slate-200 rounded-md shadow-lg">
                {label && <p className="label text-slate-800 font-semibold">{`${label}`}</p>}
                {payload.map((pld, index) => (
                    <div key={index} style={{ color: pld.color }}>
                        {`${pld.name}: ${formatIDR(pld.value)}`}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// The component is renamed to reflect its new function
export function MonthlyStats({ stats }) {
    // It now uses cycleSummaries instead of monthlySummary and categorySummary
    const cycleSummaries = stats?.cycleSummaries || [];

    const [currentCycleIndex, setCurrentCycleIndex] = useState(0);

    const handlePrevCycle = () => {
        if (currentCycleIndex < cycleSummaries.length - 1) {
            setCurrentCycleIndex(currentCycleIndex + 1);
        }
    };

    const handleNextCycle = () => {
        if (currentCycleIndex > 0) {
            setCurrentCycleIndex(currentCycleIndex - 1);
        }
    };

    const formatDateRange = (startStr, endStr) => {
        const start = new Date(startStr + 'T00:00:00Z');
        const end = new Date(endStr + 'T00:00:00Z');
        return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    };

    const selectedCycle = cycleSummaries[currentCycleIndex];
    const pieData = selectedCycle?.categoryBreakdown || [];
    const cycleLabel = selectedCycle ? formatDateRange(selectedCycle.startDate, selectedCycle.endDate) : 'No Data';

    if (cycleSummaries.length === 0) {
        return <p className="text-center text-gray-500 p-8">No transaction data to display charts.</p>;
    }

    // Data for Bar Chart is now created from cycle summaries
    const barChartData = cycleSummaries.map(cycle => ({
        name: `${new Date(cycle.startDate + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
        Income: cycle.income,
        Expenses: cycle.expenses
    })).reverse(); // Reverse to show oldest cycle first

    const tickColor = '#4B5563';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Income vs. Expenses per Cycle</h3>
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
                        <button onClick={handlePrevCycle} disabled={currentCycleIndex >= cycleSummaries.length - 1} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">‹ Prev</button>
                        <button onClick={handleNextCycle} disabled={currentCycleIndex === 0} className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Next ›</button>
                    </div>
                </div>
                <p className="text-center font-semibold text-blue-500 mb-2 text-sm">{cycleLabel}</p>
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
