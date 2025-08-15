// src/components/CalendarView.js
import React, { useMemo, useState } from 'react';

const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;

// New helper function to format numbers into a shorter version (e.g., 150k, 1.2jt)
const formatIDRShort = (value) => {
    if (value >= 1000000) {
        // Round to one decimal place for millions
        return `Rp${(value / 1000000).toFixed(1).replace('.0', '')}jt`;
    }
    if (value >= 1000) {
        // Round to the nearest thousand
        return `Rp${Math.round(value / 1000)}k`;
    }
    return `Rp${value}`;
};

export default function CalendarView({ transactions }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dailyExpenses = useMemo(() => {
        const expensesMap = new Map();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // FIX: Filter transactions to only include those from the currently viewed month and year.
        transactions
            .filter(t => {
                // Adding a buffer for timezone issues by creating date as UTC
                const transactionDate = new Date(t.date + 'T00:00:00Z');
                return t.type === 'expense' &&
                    transactionDate.getUTCFullYear() === year &&
                    transactionDate.getUTCMonth() === month;
            })
            .forEach(t => {
                const transactionDate = new Date(t.date + 'T00:00:00Z');
                const day = transactionDate.getUTCDate();
                expensesMap.set(day, (expensesMap.get(day) || 0) + t.amount);
            });
        return expensesMap;
    }, [transactions, currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    // Logic to get the starting day of the week and total days in the month
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    // Add blank cells for days before the first of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`blank-${i}`} className="border rounded-md p-2 h-28 bg-gray-50"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const expense = dailyExpenses.get(day);
        const today = new Date();
        const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

        calendarDays.push(
            <div key={day} className={`border rounded-md p-2 h-28 flex flex-col ${isToday ? 'bg-blue-100' : 'bg-white'}`}>
                <div className={`font-bold ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>{day}</div>
                {expense > 0 && (
                    <div className="mt-auto text-right">
                        {/* FIX: Show short format on mobile (sm:hidden) and full format on larger screens (hidden sm:block) */}
                        <p className="sm:hidden text-xs font-bold text-red-600">{formatIDRShort(expense)}</p>
                        <p className="hidden sm:block text-xs sm:text-sm font-bold text-red-600">
                            <span className="font-semibold">Spent: </span>
                            {formatIDR(expense)}
                        </p>
                    </div>
                )}
            </div>
        );
    }


    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">{monthName} {year}</h2>
                <div className="flex space-x-2">
                    <button onClick={handlePrevMonth} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">‹ Prev</button>
                    <button onClick={handleNextMonth} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Next ›</button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-600 mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
                {calendarDays}
            </div>
        </div>
    );
}
