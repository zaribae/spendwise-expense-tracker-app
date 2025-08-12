// src/components/UserProfile.js
import Papa from 'papaparse'; // Import PapaParse for CSV export
import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function UserProfile({ user, transactions }) {
    // State to track the selected month for export, default to the current month
    const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));

    const handleExport = () => {
        // Filter transactions to get only the ones from the selected month
        const dataToExport = transactions
            .filter(t => t.date.startsWith(exportMonth))
            .map(({ date, description, category, type, amount }) => ({
                // FIX: Prepend the date with `=` and wrap in quotes to force Excel
                // to treat it as a string formula, preventing auto-formatting issues.
                Date: `="${date}"`,
                Description: description,
                Category: category,
                Type: type,
                Amount: amount
            }));

        // Check if there is any data to export
        if (dataToExport.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Data',
                text: `There are no transactions to export for ${exportMonth}.`
            });
            return;
        }

        // Convert the JSON data to a CSV string
        const csv = Papa.unparse(dataToExport);

        // Create a Blob to hold the CSV data
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        // Create a temporary link to trigger the download
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `spendwise_export_${exportMonth}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Export Transactions</h2>
                <p className="text-gray-600 mb-4">Select a month to download your transaction history as a CSV file.</p>
                <div className="flex items-center space-x-4">
                    <input
                        type="month"
                        value={exportMonth}
                        onChange={e => setExportMonth(e.target.value)}
                        className="p-2 border border-slate-300 rounded-md bg-slate-50"
                    />
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                        Export to CSV
                    </button>
                </div>
            </div>
        </div>
    );
}
