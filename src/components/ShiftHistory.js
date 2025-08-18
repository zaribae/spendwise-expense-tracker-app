// src/components/ShiftHistory.js
import React, { useEffect, useState } from 'react';

const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
const formatDate = (isoString) => new Date(isoString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export default function ShiftHistory({ onApiCall }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            const data = await onApiCall('GET', '/shifts');
            setHistory(data || []);
            setIsLoading(false);
        };
        fetchHistory();
    }, [onApiCall]);

    if (isLoading) return <p>Loading shift history...</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Shift History</h2>
            <div className="space-y-4">
                {history.length > 0 ? history.map(shift => (
                    <div key={shift.shiftId} className="border p-4 rounded-lg">
                        <p className="font-bold text-lg">Shift Started: {formatDate(shift.createdAt)}</p>
                        <p className="text-sm text-gray-500 mb-2">Closed: {formatDate(shift.closedAt)}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                            <StatCard title="Starting Cash" value={formatIDR(shift.startingCash)} />
                            <StatCard title="Expected" value={formatIDR(shift.expectedBalance)} />
                            <StatCard title="Physical" value={formatIDR(shift.physicalCash)} />
                            <StatCard title="Difference" value={formatIDR(shift.difference)} isDifference={true} />
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500">No closed shifts found.</p>}
            </div>
        </div>
    );
}

const StatCard = ({ title, value, isDifference = false }) => {
    const isZero = parseFloat(value.replace(/[^0-9-]/g, '')) === 0;
    let colorClass = 'text-slate-800';
    if (isDifference && !isZero) colorClass = 'text-red-600';
    if (isDifference && isZero) colorClass = 'text-emerald-500';

    return (
        <div className="bg-slate-50 p-2 rounded">
            <p className="text-xs font-semibold text-gray-600">{title}</p>
            <p className={`font-bold text-lg ${colorClass}`}>{value}</p>
        </div>
    );
};
