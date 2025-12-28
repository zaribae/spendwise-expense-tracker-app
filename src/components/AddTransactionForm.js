import { get, post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function AddTransactionForm({ onTransactionAdded }) {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [assets, setAssets] = useState([]);
    const [selectedAssetId, setSelectedAssetId] = useState('');

    // Fetch assets when component loads
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
                // Automatically select the first asset if available
                if (data && data.length > 0) setSelectedAssetId(data[0].assetId);
            } catch (error) {
                console.error("Error fetching assets:", error);
            }
        };
        fetchAssets();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) {
            Swal.fire({ icon: 'error', title: 'Oops...', text: 'Please enter a transaction.' });
            return;
        }

        // Optional: Force user to select a wallet? (Here we just warn if they have assets but didn't select one)
        if (assets.length > 0 && !selectedAssetId) {
            const result = await Swal.fire({
                title: 'No Wallet Selected',
                text: "You haven't selected a wallet. This transaction won't update your asset balances. Continue?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, continue',
                cancelButtonText: 'No, let me select'
            });
            if (!result.isConfirmed) return;
        }

        setLoading(true);
        try {
            const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
            const requestOptions = {
                headers: { Authorization: authToken },
                body: {
                    text: text,
                    assetId: selectedAssetId // Send the asset ID to backend
                }
            };

            await post({ apiName: 'ExpenseTrackerAPI', path: '/process-text', options: requestOptions }).response;

            setText('');
            onTransactionAdded(); // This refreshes the dashboard data
            Swal.fire({
                icon: 'success',
                title: 'Transaction Added!',
                text: selectedAssetId ? 'Asset balance updated.' : 'Transaction saved.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Processing Failed', text: 'The AI could not understand the transaction.' });
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Add Transaction (AI-Powered)</h2>
            <p className="text-gray-600 mb-4">Simply type your transaction below. E.g., "monthly salary 5jt" or "beli kopi 15k".</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Asset Selection Dropdown */}
                {assets.length > 0 && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Wallet / Account</label>
                        <select
                            value={selectedAssetId}
                            onChange={(e) => setSelectedAssetId(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">-- Don't link to asset --</option>
                            {assets.map(asset => (
                                <option key={asset.assetId} value={asset.assetId}>
                                    {asset.name} ({asset.category})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your transaction here..."
                        className="flex-grow w-full p-3 border border-slate-300 rounded-lg bg-slate-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-sm"
                    >
                        {loading ? 'Processing...' : 'Add'}
                    </button>
                </div>
            </form>
        </div>
    );
}