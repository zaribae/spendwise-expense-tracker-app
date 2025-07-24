// src/components/MonthlySummary.js
import React, { useMemo } from 'react';

// Helper function to format numbers as IDR currency
const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

export default function MonthlySummary({ transactions }) {
    // useMemo will only recalculate the summary when the list of transactions changes
    const summary = useMemo(() => {
        const now = new Date();
        // Get the current month in 'YYYY-MM' format
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');

        // Filter transactions to only include those from the current month
        const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

        // Calculate total income
        const income = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        // Calculate total expenses
        const expenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        return { income, expenses, balance };
    }, [transactions]);

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">This Month's Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-green-100 p-4 rounded-lg shadow">
                    <p className="text-sm text-green-700 font-semibold">Income</p>
                    <p className="text-2xl font-bold text-green-800">{formatIDR(summary.income)}</p>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow">
                    <p className="text-sm text-red-700 font-semibold">Expenses</p>
                    <p className="text-2xl font-bold text-red-800">{formatIDR(summary.expenses)}</p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-lg shadow">
                    <p className="text-sm text-indigo-700 font-semibold">Balance</p>
                    <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-indigo-800' : 'text-red-800'}`}>
                        {formatIDR(summary.balance)}
                    </p>
                </div>
            </div>
        </div>
    );
}
