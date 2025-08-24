// src/components/UserProfile.js
import Papa from 'papaparse'; // Import PapaParse for CSV export
import React, { useMemo, useState } from 'react';
import Swal from 'sweetalert2';

export default function UserProfile({ user, transactions, onUpdateSettings }) {
    // State to track the selected month for export, default to the current month
    // Initialize payday from user attributes, default to 1
    const [payday, setPayday] = useState(user['custom:payday'] || '1');

    // Calculate the start and end dates of the current budget cycle
    const { cycleStartDate, cycleEndDate } = useMemo(() => {
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();

        let startDate, endDate;
        if (now.getDate() >= payday) {
            startDate = new Date(year, month, payday);
            endDate = new Date(year, month + 1, payday - 1);
        } else {
            startDate = new Date(year, month - 1, payday);
            endDate = new Date(year, month, payday - 1);
        }
        return { cycleStartDate: startDate, cycleEndDate: endDate };
    }, [payday]);

    const handleExport = () => {
        // Filter transactions to get only the ones from the current cycle
        const dataToExport = transactions
            .filter(t => {
                const transactionDate = new Date(t.date + 'T00:00:00Z');
                return transactionDate >= cycleStartDate && transactionDate <= cycleEndDate;
            })
            .map(({ date, description, category, type, amount }) => ({
                Date: `="${date}"`,
                Description: description,
                Category: category,
                Type: type,
                Amount: amount
            }));

        if (dataToExport.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Data',
                text: 'There are no transactions in the current cycle to export.'
            });
            return;
        }

        const csv = Papa.unparse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        // Create a descriptive filename based on the cycle dates
        const fileName = `dompethub_export_${cycleStartDate.toISOString().slice(0, 10)}_to_${cycleEndDate.toISOString().slice(0, 10)}.csv`;

        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleSaveSettings = () => {
        onUpdateSettings({ payday: parseInt(payday, 10) });
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">User Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Full Name</label>
                        <p className="mt-1 text-lg text-slate-800">{user.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <p className="mt-1 text-lg text-slate-800">{user.email}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Financial Settings</h2>
                <p className="text-gray-600 mb-4">Set the day your financial month starts (e.g., your payday).</p>
                <div className="flex items-center space-x-4">
                    <label className="font-medium text-gray-700">Budget Cycle Start Day:</label>
                    <input
                        type="number"
                        min="1"
                        max="31"
                        value={payday}
                        onChange={e => setPayday(e.target.value)}
                        className="w-24 p-2 border border-slate-300 rounded-md bg-slate-50"
                    />
                    <button
                        onClick={handleSaveSettings}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Export Transactions</h2>
                <p className="text-gray-600 mb-4">Download your transaction history for the current budget cycle.</p>
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm"
                >
                    Export Current Cycle to CSV
                </button>
                <p className="text-xs text-gray-500 mt-2">
                    Cycle Range: {formatDate(cycleStartDate)} - {formatDate(cycleEndDate)}
                </p>
            </div>
        </div>
    );
}
