// src/components/BudgetManager.js
import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const expenseCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Other'];
const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

export default function BudgetManager({ budgets, transactions, onSetBudget, onDeleteBudget }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const monthlyExpenses = useMemo(() => {
        const expenses = {};
        transactions
            .filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense')
            .forEach(t => {
                expenses[t.category] = (expenses[t.category] || 0) + t.amount;
            });
        return expenses;
    }, [transactions, selectedMonth]);

    const handleSetBudget = (category) => {
        Swal.fire({
            title: `Set Budget for ${category}`,
            input: 'number',
            inputLabel: `Amount in IDR for ${selectedMonth}`,
            inputValue: budgets.find(b => b.monthCategory === `${selectedMonth}-${category}`)?.amount || '',
            showCancelButton: true,
            confirmButtonText: 'Save',
            inputValidator: (value) => {
                if (!value || value < 0) {
                    return 'Please enter a valid amount';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                onSetBudget({
                    month: selectedMonth,
                    category: category,
                    amount: parseFloat(result.value)
                });
            }
        });
    };

    const handleResetBudget = (category) => {
        const monthCategory = `${selectedMonth}-${category}`;
        Swal.fire({
            title: 'Reset Budget?',
            text: `This will remove the budget for ${category} for this month.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, reset it!',
            confirmButtonColor: '#DC2626', // Red
        }).then((result) => {
            if (result.isConfirmed) {
                onDeleteBudget(monthCategory);
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">Budgeting</h2>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="p-2 border border-slate-300 rounded-md bg-slate-50"
                />
            </div>
            <div className="space-y-4">
                {expenseCategories.map(category => {
                    const budget = budgets.find(b => b.monthCategory === `${selectedMonth}-${category}`);
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
