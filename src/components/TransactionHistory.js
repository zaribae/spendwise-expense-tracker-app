// src/components/TransactionHistory.js
import React, { useMemo, useState } from 'react';
import TransactionModal from './TransactionModal'; // Import the modal component

const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
const ITEMS_PER_PAGE = 10;

const expenseCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Investment', 'Savings', 'Emergency Fund', 'Other'];

export default function TransactionHistory({ transactions, onUpdate, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // State for the edit modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => filterMonth ? t.date.startsWith(filterMonth) : true)
            .filter(t => filterType === 'all' ? true : t.type === filterType)
            .filter(t => filterCategory ? t.category === filterCategory : true)
            .filter(t =>
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [transactions, searchTerm, filterType, filterMonth, filterCategory]);

    // New: Calculate summary stats based on the filtered transactions
    const summaryStats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return { income, expense, count: filteredTransactions.length };
    }, [filteredTransactions]);

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSave = (data, transactionId) => {
        onUpdate(data, transactionId);
        closeModal();
    };

    const FilterButton = ({ type, children }) => (
        <button
            onClick={() => { setFilterType(type); setCurrentPage(1); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterType === type ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
            {children}
        </button>
    );

    return (
        <>
            {isModalOpen && (
                <TransactionModal
                    transaction={editingTransaction}
                    onSave={handleSave}
                    onClose={closeModal}
                    selectedDate={editingTransaction?.date}
                />
            )}
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Transaction History</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by description or category..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="month"
                            value={filterMonth}
                            onChange={e => { setFilterMonth(e.target.value); setCurrentPage(1); }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                        />
                        <select
                            value={filterCategory}
                            onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                            className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                        >
                            <option value="">All Categories</option>
                            {expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <button
                            onClick={() => { setFilterMonth(''); setCurrentPage(1); }}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Show All Months
                        </button>
                    </div>
                </div>
                <div className="flex justify-center space-x-2 mb-6">
                    <FilterButton type="all">All</FilterButton>
                    <FilterButton type="income">Income</FilterButton>
                    <FilterButton type="expense">Expense</FilterButton>
                </div>

                {/* New: Summary Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6 p-4 bg-slate-50 rounded-lg border">
                    <div>
                        <p className="text-sm text-gray-600 font-semibold">Total Transactions</p>
                        <p className="text-2xl font-bold text-slate-800">{summaryStats.count}</p>
                    </div>
                    <div >
                        <p className="text-sm text-emerald-700 font-semibold">Total Income</p>
                        <p className="text-2xl font-bold text-emerald-600">{formatIDR(summaryStats.income)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-red-700 font-semibold">Total Expense</p>
                        <p className="text-2xl font-bold text-red-600">{formatIDR(summaryStats.expense)}</p>
                    </div>
                </div>


                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedTransactions.length > 0 ? paginatedTransactions.map(t => (
                                <tr key={t.transactionId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.category}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-600'}`}>
                                        {formatIDR(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                        <button onClick={() => openEditModal(t)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                        <button onClick={() => onDelete(t.transactionId)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">No transactions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
