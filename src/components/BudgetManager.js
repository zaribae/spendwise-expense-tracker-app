// src/components/BudgetManager.js
import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const expenseCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Investment', 'Savings', 'Emergency Fund', 'Other'];
const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

export default function BudgetManager({ budgets, transactions, onSetBudget, onDeleteBudget, user }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const payday = parseInt(user['custom:payday'] || '1', 10);

    const { cycleStartDate, cycleEndDate, cycleMonthString } = useMemo(() => {
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();

        // Determine the correct start and end dates for the cycle
        let startDate, endDate;
        if (currentDate.getDate() >= payday) {
            startDate = new Date(year, month, payday);
            endDate = new Date(year, month + 1, payday - 1);
        } else {
            startDate = new Date(year, month - 1, payday);
            endDate = new Date(year, month, payday - 1);
        }

        const yyyymm = startDate.toISOString().slice(0, 7);

        return {
            cycleStartDate: startDate,
            cycleEndDate: endDate,
            cycleMonthString: yyyymm
        };
    }, [currentDate, payday]);

    const monthlyExpenses = useMemo(() => {
        const expenses = {};
        transactions
            .filter(t => {
                const transactionDate = new Date(t.date + 'T00:00:00Z'); // Treat date as UTC
                return t.type === 'expense' && transactionDate >= cycleStartDate && transactionDate <= cycleEndDate;
            })
            .forEach(t => {
                expenses[t.category] = (expenses[t.category] || 0) + t.amount;
            });
        return expenses;
    }, [transactions, cycleStartDate, cycleEndDate]);

    const handlePrevCycle = () => {
        setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()));
    };

    const handleNextCycle = () => {
        setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()));
    };

    const handleSetBudget = (category) => {
        Swal.fire({
            title: `Set Budget for ${category}`,
            input: 'number',
            inputLabel: `Amount in IDR for cycle starting ${cycleStartDate.toLocaleDateString()}`,
            inputValue: budgets.find(b => b.monthCategory === `${cycleMonthString}-${category}`)?.amount || '',
            showCancelButton: true,
            confirmButtonText: 'Save',
            inputValidator: (value) => !value || value < 0 ? 'Please enter a valid amount' : null
        }).then((result) => {
            if (result.isConfirmed) {
                onSetBudget({
                    month: cycleMonthString,
                    category: category,
                    amount: parseFloat(result.value)
                });
            }
        });
    };

    const handleResetBudget = (category) => {
        const monthCategory = `${cycleMonthString}-${category}`;
        Swal.fire({
            title: 'Reset Budget?',
            text: `This will remove the budget for ${category} for this cycle.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, reset it!',
            confirmButtonColor: '#DC2626',
        }).then((result) => {
            if (result.isConfirmed) {
                onDeleteBudget(monthCategory);
            }
        });
    };

    const formatDateRange = (start, end) => {
        const startDay = start.getDate();
        const startMonth = start.toLocaleString('default', { month: 'short' });
        const endDay = end.getDate();
        const endMonth = end.toLocaleString('default', { month: 'short' });
        const year = start.getFullYear();
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Budgeting</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevCycle} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">‹ Prev</button>
                    <button onClick={handleNextCycle} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">Next ›</button>
                </div>
            </div>
            <p className="text-center font-semibold text-blue-500 mb-4">
                {formatDateRange(cycleStartDate, cycleEndDate)}
            </p>
            <div className="space-y-4">
                {expenseCategories.map(category => {
                    const budget = budgets.find(b => b.monthCategory === `${cycleMonthString}-${category}`);
                    const spent = monthlyExpenses[category] || 0;
                    const percentage = budget ? Math.min((spent / budget.amount) * 100, 100) : 0;
                    const remaining = budget ? budget.amount - spent : 0;

                    let progressBarColor = 'bg-blue-500';
                    if (percentage > 75) progressBarColor = 'bg-yellow-500';
                    if (percentage >= 100) progressBarColor = 'bg-red-600';

                    return (
                        <div key={category}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-slate-700">{category}</span>
                                <span className="text-sm text-gray-500">
                                    {formatIDR(spent)} / {budget ? formatIDR(budget.amount) : 'Not Set'}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-5 relative">
                                <div className={`${progressBarColor} h-5 rounded-full flex items-center justify-center`} style={{ width: `${percentage}%` }}>
                                    {percentage > 10 && (
                                        <span className="text-xs font-bold text-white">
                                            {Math.round(percentage)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className={`text-xs ${remaining < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                    {remaining < 0 ? `Overspent by ${formatIDR(Math.abs(remaining))}` : `${formatIDR(remaining)} remaining`}
                                </span>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleSetBudget(category)} className="text-xs text-blue-600 hover:underline">
                                        {budget ? 'Edit' : 'Set Budget'}
                                    </button>
                                    {budget && (
                                        <button onClick={() => handleResetBudget(category)} className="text-xs text-red-600 hover:underline">
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
