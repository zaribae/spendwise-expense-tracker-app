// src/components/MonthlySummary.js
import React, { useMemo } from 'react';

const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

// Icons for the summary cards
const IncomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0-6H9.401M14.599 12H12m0 0L9.401 16m5.198-4L12 8m0 0L9.401 4M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>;
const ExpenseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0-6H9.401M14.599 12H12m0 0L9.401 16m5.198-4L12 8m0 0L9.401 4M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>;
const BalanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>;

export default function MonthlySummary({ transactions }) {
    const summary = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
        const income = monthlyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = monthlyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expenses;
        return { income, expenses, balance };
    }, [transactions]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">This Month's Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-100 p-4 rounded-lg shadow-sm border border-emerald-200 flex items-center">
                    <div className="mr-4"><IncomeIcon /></div>
                    <div>
                        <p className="text-sm text-emerald-700 font-semibold">Income</p>
                        <p className="text-2xl font-bold text-emerald-800">{formatIDR(summary.income)}</p>
                    </div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg shadow-sm border border-red-200 flex items-center">
                    <div className="mr-4"><ExpenseIcon /></div>
                    <div>
                        <p className="text-sm text-red-700 font-semibold">Expenses</p>
                        <p className="text-2xl font-bold text-red-800">{formatIDR(summary.expenses)}</p>
                    </div>
                </div>
                <div className="bg-blue-100 p-4 rounded-lg shadow-sm border border-blue-200 flex items-center">
                    <div className="mr-4"><BalanceIcon /></div>
                    <div>
                        <p className="text-sm text-blue-700 font-semibold">Balance</p>
                        <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                            {formatIDR(summary.balance)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
