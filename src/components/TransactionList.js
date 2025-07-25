// src/components/TransactionList.js
import React, { useMemo, useState } from 'react';
import TransactionModal from './TransactionModal';

const toYMD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function TransactionList({ transactions, onAdd, onUpdate, onDelete }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate);
    };
    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate);
    };
    const handleGoToToday = () => setSelectedDate(new Date());

    const openAddModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleSave = (data, transactionId) => {
        if (transactionId) {
            onUpdate(data, transactionId);
        } else {
            onAdd(data);
        }
        closeModal();
    };

    // FIX: Removed window.confirm. Confirmation is now handled in the parent component.
    const handleDelete = (transactionId) => {
        onDelete(transactionId);
    };

    const filteredTransactions = useMemo(() => {
        const selectedDateString = toYMD(selectedDate);
        return transactions.filter(t => t.date === selectedDateString);
    }, [selectedDate, transactions]);

    const isToday = toYMD(selectedDate) === toYMD(new Date());

    return (
        <>
            {isModalOpen && (
                <TransactionModal
                    transaction={editingTransaction}
                    onSave={handleSave}
                    onClose={closeModal}
                    selectedDate={toYMD(selectedDate)}
                />
            )}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold text-gray-800">Daily Transactions</h3>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrevDay} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">‹ Prev</button>
                        {!isToday && <button onClick={handleGoToToday} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300">Today</button>}
                        <button onClick={handleNextDay} disabled={isToday} className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50">Next ›</button>
                        <button onClick={openAddModal} className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add Manually</button>
                    </div>
                </div>

                <h4 className="text-lg font-semibold text-center text-indigo-600 mb-4">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(selectedDate)}
                </h4>

                <div className="space-y-3">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(t => (
                            <div key={t.transactionId} className="flex justify-between items-center p-3 rounded-lg border border-gray-200">
                                <div>
                                    <p className="font-semibold text-gray-800">{t.description || t.category}</p>
                                    <p className="text-sm text-gray-500">{t.category}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'}Rp{new Intl.NumberFormat('id-ID').format(t.amount)}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button onClick={() => openEditModal(t)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(t.transactionId)} className="text-xs text-red-600 hover:underline">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No transactions for this day.</p>
                    )}
                </div>
            </div>
        </>
    );
}
