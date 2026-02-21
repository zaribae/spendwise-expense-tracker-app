// src/components/UserProfile.js
import { post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import Papa from 'papaparse'; // Import PapaParse for CSV export
import { useMemo, useState } from 'react';
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

    // Add this inside UserProfile component
    const handleConnectTelegram = async () => {
        try {
            const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
            const response = await post({
                apiName: 'ExpenseTrackerAPI',
                path: '/telegram/generate-code',
                options: { headers: { Authorization: authToken } }
            }).response;

            const data = await response.body.json();

            Swal.fire({
                title: 'Connect Telegram',
                html: `
                <p>Send this command to our Telegram Bot:</p>
                <h2 style="font-size: 2em; font-weight: bold; margin: 10px 0;">/start ${data.code}</h2>
                <a href="https://t.me/dompethub_bot" target="_blank">Open Bot</a>
            `,
                icon: 'info'
            });
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Could not generate code', 'error');
        }
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

            <div className="border-t border-slate-100 my-6"></div>

            {/* Telegram Connection Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">Integrations</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                        <p className="font-medium text-slate-800">Telegram Bot</p>
                        <p className="text-sm text-slate-500">Connect your account to log expenses via chat.</p>
                    </div>
                    <button
                        onClick={handleConnectTelegram}
                        className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="mr-2 -ml-1 h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.58-.35-.88.22-1.46.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.42-.01-1.22-.24-1.81-.44-.73-.24-1.3-.37-1.25-.78.03-.22.32-.44.89-.66 3.5-1.52 5.83-2.53 6.99-3.02 3.33-1.45 4.02-1.7 4.47-1.7.09 0 .32.02.46.12.12.08.15.19.17.27v.03z" />
                        </svg>
                        Connect Telegram
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
