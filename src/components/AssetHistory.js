import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import {
    Area, AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)}`;
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export default function AssetHistoryChart({ assetId, assetName, color = '#3B82F6' }) {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!assetId) return;
            setLoading(true);
            try {
                const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
                const response = await get({
                    apiName: 'ExpenseTrackerAPI',
                    path: `/assets/${assetId}/history`,
                    options: { headers: { Authorization: authToken } }
                }).response;
                const data = await response.body.json();
                setHistoryData(data);
            } catch (error) {
                console.error("Error fetching asset history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [assetId]);

    if (loading) return <div className="h-64 flex items-center justify-center text-slate-500 animate-pulse">Loading history...</div>;
    if (historyData.length < 2) return <div className="h-64 flex items-center justify-center text-slate-500 italic">Not enough data to show history trend. Update this asset's value to build history.</div>;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <h4 className="text-md font-bold text-slate-700 mb-4">History: {assetName}</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData}>
                        <defs>
                            <linearGradient id={`color-${assetId}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={formatIDR}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            width={80}
                        />
                        <Tooltip
                            formatter={(value) => [`Rp${new Intl.NumberFormat('id-ID').format(value)}`, 'Value']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="amount" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${assetId})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}