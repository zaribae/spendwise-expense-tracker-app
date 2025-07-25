// src/components/Dashboard.js
import { del, get, post, put } from 'aws-amplify/api';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2

import AddTransactionForm from './AddTransactionForm';
import { DailyStats, MonthlyStats } from './Charts';
import Footer from './Footer';
import Header from './Header';
import MonthlySummary from './MonthlySummary';
import TransactionList from './TransactionList';

export default function Dashboard({ user }) {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('monthly');

    const handleSignOut = async () => {
        try {
            await signOut();
            // Show a sign-out success message
            Swal.fire({
                icon: 'success',
                title: 'Signed Out',
                text: 'You have been successfully signed out.',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.reload();
            });
        } catch (error) {
            console.error('Error signing out: ', error);
            Swal.fire('Error!', 'Could not sign out.', 'error');
        }
    };

    const getAuthToken = async () => {
        const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
        if (!authToken) throw new Error("User ID token not found.");
        return authToken;
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const authToken = await getAuthToken();
            const requestOptions = { headers: { Authorization: authToken } };

            const [transData, statsData] = await Promise.all([
                get({ apiName: 'ExpenseTrackerAPI', path: '/transactions', options: requestOptions }).response.then(r => r.body.json()),
                get({ apiName: 'ExpenseTrackerAPI', path: '/stats', options: requestOptions }).response.then(r => r.body.json())
            ]);

            if (Array.isArray(transData)) {
                setTransactions(transData.sort((a, b) => new Date(b.date) - new Date(a.date)));
            } else { setTransactions([]); }
            if (statsData && typeof statsData === 'object') {
                setStats(statsData);
            } else { setStats(null); }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- CRUD Functions with Notifications ---
    const handleAddTransaction = async (transactionData) => {
        try {
            const authToken = await getAuthToken();
            await post({
                apiName: 'ExpenseTrackerAPI',
                path: '/transactions',
                options: { headers: { Authorization: authToken }, body: transactionData }
            }).response;
            fetchData();
            Swal.fire('Added!', 'Your transaction has been added.', 'success');
        } catch (error) {
            console.error("Error adding transaction:", error);
            Swal.fire('Error!', 'Could not add transaction.', 'error');
        }
    };

    const handleUpdateTransaction = async (transactionData, transactionId) => {
        try {
            const authToken = await getAuthToken();
            await put({
                apiName: 'ExpenseTrackerAPI',
                path: `/transactions/${transactionId}`,
                options: { headers: { Authorization: authToken }, body: transactionData }
            }).response;
            fetchData();
            Swal.fire('Updated!', 'Your transaction has been updated.', 'success');
        } catch (error) {
            console.error("Error updating transaction:", error);
            Swal.fire('Error!', 'Could not update transaction.', 'error');
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        // Use SweetAlert for confirmation
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const authToken = await getAuthToken();
                    await del({
                        apiName: 'ExpenseTrackerAPI',
                        path: `/transactions/${transactionId}`,
                        options: { headers: { Authorization: authToken } }
                    }).response;
                    fetchData();
                    Swal.fire('Deleted!', 'Your transaction has been deleted.', 'success');
                } catch (error) {
                    console.error("Error deleting transaction:", error);
                    Swal.fire('Error!', 'Could not delete transaction.', 'error');
                }
            }
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header user={user} onSignOut={handleSignOut} />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <AddTransactionForm onTransactionAdded={fetchData} />
                    <div className="mt-8">
                        <MonthlySummary transactions={transactions} />
                    </div>
                    <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Financial Overview</h2>
                            <div className="flex space-x-2">
                                <button onClick={() => setView('monthly')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'monthly' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Monthly</button>
                                <button onClick={() => setView('daily')} className={`px-4 py-2 text-sm font-medium rounded-lg ${view === 'daily' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Daily</button>
                            </div>
                        </div>
                        {loading ? <p>Loading stats...</p> : !stats ? <p>No data available.</p> : (
                            <div>
                                {view === 'monthly' && <MonthlyStats stats={stats} />}
                                {view === 'daily' && <DailyStats stats={stats} />}
                            </div>
                        )}
                    </div>
                    <div className="mt-8">
                        <TransactionList
                            transactions={transactions}
                            onAdd={handleAddTransaction}
                            onUpdate={handleUpdateTransaction}
                            onDelete={handleDeleteTransaction}
                        />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
