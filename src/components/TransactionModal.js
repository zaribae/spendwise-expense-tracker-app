import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';

const expenseCategories = ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Investment', 'Savings', 'Emergency Fund', 'Other'];

export default function TransactionModal({ transaction, onSave, onClose, selectedDate }) {
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        category: 'Food',
        description: '',
        date: selectedDate,
        assetId: '' // New field for asset selection
    });

    const [assets, setAssets] = useState([]);

    // Fetch assets when modal opens
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
                const response = await get({
                    apiName: 'ExpenseTrackerAPI',
                    path: '/assets',
                    options: { headers: { Authorization: authToken } }
                }).response;
                const data = await response.body.json();
                setAssets(data || []);
            } catch (error) {
                console.error("Error fetching assets:", error);
            }
        };
        fetchAssets();
    }, []);

    useEffect(() => {
        if (transaction) {
            setFormData({
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                description: transaction.description,
                date: transaction.date,
                assetId: transaction.assetId || '' // Load existing asset link if editing
            });
        } else {
            // If creating new, default to first asset if available
            setFormData(prev => ({
                ...prev,
                date: selectedDate,
                // Only set default asset if we have assets and it's a new transaction
                assetId: assets.length > 0 ? assets[0].assetId : ''
            }));
        }
    }, [transaction, selectedDate, assets]); // Added assets dependency

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            amount: parseFloat(formData.amount),
            // Ensure assetId is sent (or null if empty string)
            assetId: formData.assetId || null
        };
        onSave(dataToSave, transaction?.transactionId);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{transaction ? 'Edit' : 'Add'} Transaction</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Top Row: Type & Asset */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer">
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wallet / Account</label>
                            <select name="assetId" value={formData.assetId} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer">
                                <option value="">-- None --</option>
                                {assets.map(asset => (
                                    <option key={asset.assetId} value={asset.assetId}>
                                        {asset.name} ({asset.category})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (Rp)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-semibold">Rp</span>
                            <input name="amount" type="number" value={formData.amount} onChange={handleChange} className={`w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xl ${formData.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`} required placeholder="0" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required placeholder="What is this for?" />
                    </div>

                    {/* Bottom Row: Category & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" disabled={formData.type === 'income'}>
                                {formData.type === 'income' ? <option>Income</option> : expenseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer" required />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all font-bold">
                            {transaction ? 'Update Transaction' : 'Save Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}