// src/components/TransactionModal.js
import React, { useEffect, useState } from 'react';

const expenseCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Investment', 'Savings', 'Emergency Fund', 'Other'];

export default function TransactionModal({ transaction, onSave, onClose, selectedDate }) {
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        category: 'Food',
        description: '',
        date: selectedDate
    });

    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                description: transaction.description,
                date: transaction.date
            });
        } else {
            setFormData(prev => ({ ...prev, date: selectedDate }));
        }
    }, [transaction, selectedDate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData, amount: parseFloat(formData.amount) };
        onSave(dataToSave, transaction?.transactionId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md border border-slate-200">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">{transaction ? 'Edit' : 'Add'} Transaction</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-gray-700">
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Amount (Rp)</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-gray-700" required />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-gray-700" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-gray-700" disabled={formData.type === 'income'}>
                                {formData.type === 'income' ? <option>Income</option> : expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-md bg-slate-50 text-gray-700" required />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
