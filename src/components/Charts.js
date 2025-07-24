// src/components/Charts.js
import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d', '#4ddbff', '#ffc61a'];

// Helper function to format numbers as IDR currency
const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

export function MonthlyStats({ stats }) {
    const { monthlySummary, categorySummary } = stats;

    if (!monthlySummary || monthlySummary.length === 0) {
        return <p className="text-center text-gray-500 p-8">No monthly data to display yet.</p>;
    }

    const chartData = monthlySummary.map(item => ({
        name: item.month,
        Income: item.income,
        Expenses: item.expenses,
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Income vs. Expenses by Month</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatIDR} />
                        <Tooltip formatter={formatIDR} />
                        <Legend />
                        <Bar dataKey="Income" fill="#22c55e" />
                        <Bar dataKey="Expenses" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Expense Breakdown (This Month)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={categorySummary} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                            {categorySummary.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        {/* This Tooltip now correctly formats the value as IDR */}
                        <Tooltip formatter={formatIDR} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function DailyStats({ stats }) {
    const { dailySummary } = stats;

    if (!dailySummary || dailySummary.length === 0) {
        return <p className="text-center text-gray-500 p-8">No daily expense data for this month.</p>;
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Expenses This Month (Daily)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailySummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={formatIDR} />
                    <Tooltip formatter={formatIDR} />
                    <Legend />
                    <Bar dataKey="expenses" name="Daily Expenses" fill="#ef4444" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
