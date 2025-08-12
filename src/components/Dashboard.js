// src/components/Dashboard.js
import { del, get, post, put } from 'aws-amplify/api';
import { fetchAuthSession, signOut } from 'aws-amplify/auth';
import React, { useCallback, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

import AddTransactionForm from './AddTransactionForm';
import BudgetManager from './BudgetManager';
import { MonthlyStats } from './Charts';
import Footer from './Footer';
import Header from './Header';
import MonthlySummary from './MonthlySummary';
import TransactionHistory from './TransactionHistory';
import TransactionList from './TransactionList';
import UserProfile from './UserProfile';

// Icons for navigation
const OverviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BudgetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 4h4m5 6H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z" /></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

export default function Dashboard({ user }) {
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const handleSignOut = async () => {
        try {
            await signOut();
            Swal.fire({ icon: 'success', title: 'Signed Out', timer: 2000, showConfirmButton: false })
                .then(() => window.location.reload());
        } catch (error) {
            console.error('Error signing out: ', error);
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
            const [transData, statsData, budgetData] = await Promise.all([
                get({ apiName: 'ExpenseTrackerAPI', path: '/transactions', options: requestOptions }).response.then(r => r.body.json()),
                get({ apiName: 'ExpenseTrackerAPI', path: '/stats', options: requestOptions }).response.then(r => r.body.json()),
                get({ apiName: 'ExpenseTrackerAPI', path: '/budgets', options: requestOptions }).response.then(r => r.body.json())
            ]);
            if (Array.isArray(transData)) setTransactions(transData.sort((a, b) => new Date(b.date) - new Date(a.date)));
            else setTransactions([]);
            if (statsData && typeof statsData === 'object') setStats(statsData);
            else setStats(null);
            if (Array.isArray(budgetData)) setBudgets(budgetData);
            else setBudgets([]);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddTransaction = async (transactionData) => {
        try {
            const authToken = await getAuthToken();
            await post({ apiName: 'ExpenseTrackerAPI', path: '/transactions', options: { headers: { Authorization: authToken }, body: transactionData } }).response;
            fetchData();
            Swal.fire('Added!', 'Your transaction has been added.', 'success');
        } catch (error) {
            Swal.fire('Error!', 'Could not add transaction.', 'error');
        }
    };

    const handleUpdateTransaction = async (transactionData, transactionId) => {
        try {
            const authToken = await getAuthToken();
            await put({ apiName: 'ExpenseTrackerAPI', path: `/transactions/${transactionId}`, options: { headers: { Authorization: authToken }, body: transactionData } }).response;
            fetchData();
            Swal.fire('Updated!', 'Your transaction has been updated.', 'success');
        } catch (error) {
            Swal.fire('Error!', 'Could not update transaction.', 'error');
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3B82F6',
            cancelButtonColor: '#DC2626',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const authToken = await getAuthToken();
                    await del({ apiName: 'ExpenseTrackerAPI', path: `/transactions/${transactionId}`, options: { headers: { Authorization: authToken } } }).response;
                    fetchData();
                    Swal.fire('Deleted!', 'Your transaction has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Could not delete transaction.', 'error');
                }
            }
        });
    };

    const handleSetBudget = async (budgetData) => {
        try {
            const authToken = await getAuthToken();
            await post({
                apiName: 'ExpenseTrackerAPI',
                path: '/budgets',
                options: { headers: { Authorization: authToken }, body: budgetData }
            }).response;
            fetchData();
            Swal.fire('Budget Saved!', '', 'success');
        } catch (error) {
            console.error("Error setting budget:", error);
            Swal.fire('Error!', 'Could not save budget.', 'error');
        }
    };

    const NavButton = ({ tabName, icon, children }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === tabName ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-100'}`}
        >
            {icon} {children}
        </button>
    );

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Header user={user} onSignOut={handleSignOut} />
            <div className="max-w-7xl w-full mx-auto flex-grow p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <aside className="md:col-span-1">
                        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 space-y-2">
                            <NavButton tabName="overview" icon={<OverviewIcon />}>Overview</NavButton>
                            <NavButton tabName="history" icon={<HistoryIcon />}>History</NavButton>
                            <NavButton tabName="budget" icon={<BudgetIcon />}>Budgeting</NavButton>
                            <NavButton tabName="profile" icon={<ProfileIcon />}>Profile</NavButton>
                        </div>
                    </aside>
                    <main className="md:col-span-3">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <AddTransactionForm onTransactionAdded={fetchData} />
                                <MonthlySummary transactions={transactions} />
                                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Financial Charts</h2>
                                    {loading ? <p>Loading charts...</p> : !stats ? <p>No data.</p> : <MonthlyStats stats={stats} />}
                                </div>
                                <TransactionList
                                    transactions={transactions}
                                    onAdd={handleAddTransaction}
                                    onUpdate={handleUpdateTransaction}
                                    onDelete={handleDeleteTransaction}
                                />
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <TransactionHistory
                                transactions={transactions}
                                onUpdate={handleUpdateTransaction}
                                onDelete={handleDeleteTransaction}
                            />
                        )}
                        {activeTab === 'budget' && (
                            <BudgetManager
                                budgets={budgets}
                                transactions={transactions}
                                onSetBudget={handleSetBudget}
                            />
                        )}
                        {activeTab === 'profile' && <UserProfile user={user} transactions={transactions} />}
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
}
