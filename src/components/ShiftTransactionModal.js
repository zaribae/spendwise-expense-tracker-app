// src/components/ShiftTransactionModal.js
import React, { useEffect, useState } from 'react';

export default function ShiftTransactionModal({ transaction, onSave, onClose }) {
    const [formData, setFormData] = useState({ amount: '', type: 'IN', description: '' });

    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                type: transaction.type,
                description: transaction.description
            });
        }
    }, [transaction]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, amount: parseFloat(formData.amount) });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Edit Shift Transaction</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount (Rp)</label>
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md">
                                <option value="IN">Pemasukan</option>
                                <option value="OUT">Pengeluaran</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
