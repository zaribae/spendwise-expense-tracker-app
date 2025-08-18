/// src/components/CashierMode.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import ShiftHistory from './ShiftHistory'; // Import ShiftHistory
import ShiftTransactionModal from './ShiftTransactionModal';

const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

export default function CashierMode({ onApiCall }) {
    const [activeShift, setActiveShift] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState('active'); // 'active' or 'history'

    const fetchActiveShift = useCallback(async () => {
        setIsLoading(true);
        const data = await onApiCall('GET', '/shifts/active');
        setActiveShift(data);
        setIsLoading(false);
    }, [onApiCall]);

    useEffect(() => {
        if (view === 'active') {
            fetchActiveShift();
        }
    }, [view, fetchActiveShift]);

    const handleStartShift = async () => {
        const { value: startingCash } = await Swal.fire({
            title: 'Mulai Sesi Baru',
            input: 'number',
            inputLabel: 'Modal Awal (Rp)',
            showCancelButton: true,
            confirmButtonText: 'Mulai'
        });
        if (startingCash) {
            await onApiCall('POST', '/shifts', { startingCash: parseFloat(startingCash) });
            fetchActiveShift();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-end space-x-2">
                <button onClick={() => setView('active')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Sesi Aktif</button>
                <button onClick={() => setView('history')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Riwayat Sesi</button>
            </div>

            {view === 'active' && (
                isLoading ? <p>Loading cashier session...</p> :
                    !activeShift ? <StartShiftScreen onStart={handleStartShift} /> :
                        <ActiveShiftDashboard shift={activeShift} onApiCall={onApiCall} onRefresh={fetchActiveShift} />
            )}
            {view === 'history' && <ShiftHistory onApiCall={onApiCall} />}
        </div>
    );
}

// Screen to show when no shift is active
const StartShiftScreen = ({ onStart }) => (
    <div className="text-center bg-white p-8 rounded-xl shadow-md border">
        <h2 className="text-2xl font-bold text-slate-800">Tidak Ada Sesi Aktif</h2>
        <p className="text-gray-600 mt-2 mb-6">Mulai sesi baru untuk mulai mencatat transaksi kasir.</p>
        <button onClick={onStart} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
            Mulai Sesi Baru
        </button>
    </div>
);

// Dashboard for the active shift
const ActiveShiftDashboard = ({ shift, onApiCall, onRefresh }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [editingTransaction, setEditingTransaction] = useState(null);

    const summary = useMemo(() => {
        const cashIn = shift.transactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
        const cashOut = shift.transactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
        const expectedBalance = shift.startingCash + cashIn - cashOut;
        return { cashIn, cashOut, expectedBalance };
    }, [shift]);

    const handleAddTransaction = async (type) => {
        if (!amount || !description) return;
        await onApiCall('POST', `/shifts/${shift.shiftId}/transactions`, {
            amount: parseFloat(amount),
            type,
            description
        });
        setDescription('');
        setAmount('');
        onRefresh();
    };

    const handleSaveEdit = async (formData) => {
        await onApiCall('PUT', `/shifts/${shift.shiftId}/transactions/${editingTransaction.transactionId}`, formData);
        setEditingTransaction(null);
        onRefresh();
    };

    const handleDelete = (transactionId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                await onApiCall('DELETE', `/shifts/${shift.shiftId}/transactions/${transactionId}`);
                onRefresh();
                Swal.fire('Deleted!', 'Transaction has been deleted.', 'success');
            }
        });
    };


    const handleCloseShift = async () => {
        const { value: physicalCashStr } = await Swal.fire({
            title: 'Tutup Sesi & Rekonsiliasi',
            input: 'number',
            inputLabel: 'Jumlah Uang Fisik di Laci (Rp)',
            inputPlaceholder: 'Hitung dan masukkan jumlah akhir',
            showCancelButton: true,
            confirmButtonText: 'Konfirmasi & Tutup',
            inputValidator: (v) => !v && 'Anda harus memasukkan jumlah fisik!'
        });

        if (physicalCashStr) {
            const physicalCash = parseFloat(physicalCashStr);
            const difference = physicalCash - summary.expectedBalance;

            await onApiCall('PUT', `/shifts/${shift.shiftId}/close`, {
                physicalCash,
                expectedBalance: summary.expectedBalance,
                difference
            });

            Swal.fire({
                title: 'Sesi Ditutup!',
                html: `Saldo Seharusnya: <b>${formatIDR(summary.expectedBalance)}</b><br/>
                       Uang Fisik: <b>${formatIDR(physicalCash)}</b><br/>
                       Selisih: <b class="${difference === 0 ? 'text-emerald-500' : 'text-red-600'}">${formatIDR(difference)}</b>`,
                icon: difference === 0 ? 'success' : 'warning'
            });
            onRefresh();
        }
    };

    return (
        <>
            {editingTransaction && (
                <ShiftTransactionModal
                    transaction={editingTransaction}
                    onSave={handleSaveEdit}
                    onClose={() => setEditingTransaction(null)}
                />
            )}
            <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                    <SummaryCard title="Modal Awal" value={formatIDR(shift.startingCash)} />
                    <SummaryCard title="Total Pemasukan" value={formatIDR(summary.cashIn)} color="emerald" />
                    <SummaryCard title="Total Pengeluaran" value={formatIDR(summary.cashOut)} color="red" />
                    <SummaryCard title="Saldo Seharusnya" value={formatIDR(summary.expectedBalance)} color="blue" isLarge />
                </div>

                {/* Quick Entry Form */}
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h3 className="font-bold text-lg mb-4">Pencatatan Cepat</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="Jumlah (Rp)" className="p-2 border rounded-md flex-1" />
                        <input value={description} onChange={e => setDescription(e.target.value)} type="text" placeholder="Keterangan" className="p-2 border rounded-md flex-1" />
                        <div className="flex gap-4">
                            <button onClick={() => handleAddTransaction('IN')} className="flex-1 p-2 bg-emerald-500 text-white font-bold rounded-md hover:bg-emerald-600">[+] Pemasukan</button>
                            <button onClick={() => handleAddTransaction('OUT')} className="flex-1 p-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700">[-] Pengeluaran</button>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white p-6 rounded-xl shadow-md border">
                    <h3 className="font-bold text-lg mb-4">Transaksi Sesi Ini</h3>
                    <div className="space-y-2">
                        {shift.transactions.slice().reverse().map(t => (
                            <div key={t.transactionId} className="flex justify-between items-center p-2 border-b">
                                <span className="text-gray-700">{t.description}</span>
                                <div className="flex items-center space-x-4">
                                    <span className={`font-semibold ${t.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>{formatIDR(t.amount)}</span>
                                    <div className="flex space-x-2">
                                        <button onClick={() => setEditingTransaction(t)} className="text-xs text-blue-600 hover:underline">Edit</button>
                                        <button onClick={() => handleDelete(t.transactionId)} className="text-xs text-red-600 hover:underline">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={handleCloseShift} className="px-6 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-900">
                        Tutup Sesi & Rekonsiliasi
                    </button>
                </div>
            </div>
        </>
    );
};

const SummaryCard = ({ title, value, color = 'gray', isLarge = false }) => {
    const colorClasses = {
        gray: 'bg-gray-100 text-gray-800',
        emerald: 'bg-emerald-100 text-emerald-800',
        red: 'bg-red-100 text-red-800',
        blue: 'bg-blue-100 text-blue-800',
    };
    return (
        <div className={`${colorClasses[color]} p-4 rounded-lg shadow-sm`}>
            <p className="text-sm font-semibold opacity-70">{title}</p>
            <p className={`${isLarge ? 'text-3xl' : 'text-2xl'} font-bold`}>{value}</p>
        </div>
    );
};
