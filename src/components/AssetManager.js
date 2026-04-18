import {
    ArrowDownRight,
    ArrowUpRight,
    Bitcoin,
    Building2,
    Car, Coins,
    Home,
    Landmark,
    LayoutGrid,
    MoreVertical,
    Package, Plus,
    Smartphone, TrendingUp,
    Wallet
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Swal from 'sweetalert2';
import AssetHistoryChart from './AssetHistory';

const formatIDR = (value) => `Rp${new Intl.NumberFormat('id-ID').format(value)}`;
const assetCategories = ['Cash', 'Bank', 'E-Wallet', 'Investment', 'Stock', 'Crypto', 'Property', 'Vehicle', 'Gold', 'Other'];
const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#14B8A6', '#FCD34D', '#9CA3AF'];

const getCategoryIcon = (category) => {
    switch (category) {
        case 'Cash': return Wallet;
        case 'Bank': return Building2;
        case 'E-Wallet': return Smartphone;
        case 'Investment': return TrendingUp;
        case 'Stock': return Landmark;
        case 'Crypto': return Bitcoin;
        case 'Property': return Home;
        case 'Vehicle': return Car;
        case 'Gold': return Coins;
        default: return Package;
    }
};

export default function AssetManager({ assets, onAdd, onUpdate, onDelete }) {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [formData, setFormData] = useState({ name: '', amount: '', category: 'Cash', description: '' });
    const [netWorthHistory, setNetWorthHistory] = useState([]);
    const [activeFilter, setActiveFilter] = useState('Semua');

    const totalNetWorth = useMemo(() => assets.reduce((sum, a) => sum + a.amount, 0), [assets]);

    const chartData = useMemo(() => {
        const grouped = {};
        assets.forEach(a => {
            grouped[a.category] = (grouped[a.category] || 0) + a.amount;
        });
        return Object.keys(grouped).map(k => ({ name: k, value: grouped[k] }));
    }, [assets]);

    // FIX: Create a sorted copy for display to avoid mutating the original read-only array
    const sortedChartData = useMemo(() => {
        return [...chartData].sort((a, b) => b.value - a.value).slice(0, 3);
    }, [chartData]);

    // Calculating Wealth Growth Trends (Based on initial vs. latest data)
    const trend = useMemo(() => {
        if (netWorthHistory.length < 1 || totalNetWorth === 0) return null;
        const oldestValue = netWorthHistory[0].totalAmount;
        if (oldestValue === 0) return null;
        const diff = totalNetWorth - oldestValue;
        const percent = (diff / oldestValue) * 100;
        return { diff, percent, isPositive: diff >= 0 };
    }, [netWorthHistory, totalNetWorth]);

    // Logika Filter
    const availableFilters = ['Semua', ...Array.from(new Set(assets.map(a => a.category)))];

    const filteredAssets = useMemo(() => {
        let filtered = activeFilter === 'Semua' ? assets : assets.filter(a => a.category === activeFilter);
        return [...filtered].sort((a, b) => b.amount - a.amount);
    }, [assets, activeFilter]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, amount: parseFloat(formData.amount) };
        if (selectedAsset) {
            onUpdate(payload, selectedAsset.assetId);
        } else {
            onAdd(payload);
        }
        closeForm();
    };

    const handleAssetClick = (asset) => {
        setSelectedAsset(asset);
        setFormData({ name: asset.name, amount: asset.amount, category: asset.category, description: asset.description });
        setIsFormVisible(true);
    };

    const closeForm = () => {
        setIsFormVisible(false);
        setSelectedAsset(null);
        setFormData({ name: '', amount: '', category: 'Cash', description: '' });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Asset?',
            text: "This will remove this asset and its history.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC2626',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(id);
                closeForm();
            }
        });
    };

    // Helper for category badge color
    const getCategoryColor = (cat) => COLORS[assetCategories.indexOf(cat) % COLORS.length];

    return (
        <div className="space-y-6">
            {/* --- BAGIAN ATAS: RINGKASAN & GRAFIK --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Kartu Pertumbuhan & Total Net Worth */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative z-10">
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Net Worth</p>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
                                {formatIDR(totalNetWorth)}
                            </h2>
                            {trend && (
                                <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-sm font-semibold ${trend.isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {trend.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    <span>{trend.isPositive ? '+' : ''}{formatIDR(trend.diff)} ({trend.percent.toFixed(1)}%)</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => { setIsFormVisible(true); setSelectedAsset(null); setFormData({ name: '', amount: '', category: 'Cash', description: '' }); }}
                            className="flex-shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                        >
                            <Plus size={20} /> Tambah Aset
                        </button>
                    </div>

                    {/* Area Chart Net Worth Growth di dalam kartu */}
                    <div className="h-40 w-full mt-4 -mx-2">
                        {netWorthHistory.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={netWorthHistory} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" hide />
                                    <YAxis domain={['auto', 'auto']} hide />
                                    <Tooltip
                                        formatter={(value) => formatIDR(value)}
                                        labelFormatter={(l) => new Date(l).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="totalAmount" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium bg-slate-50/50 rounded-xl border border-dashed border-slate-200 mx-2">
                                Grafik pertumbuhan akan muncul setelah ada pembaruan nilai aset.
                            </div>
                        )}
                    </div>
                </div>

                {/* Kartu Alokasi Aset (Pie Chart) */}
                <div className="lg:col-span-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <LayoutGrid size={20} className="text-blue-500" /> Alokasi Aset
                    </h3>
                    <div className="flex-1 min-h-[180px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[assetCategories.indexOf(entry.name) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatIDR(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Aset Top</span>
                            <span className="text-sm font-bold text-slate-700">{sortedChartData.length > 0 ? sortedChartData[0].name : '-'}</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="mt-4 space-y-2.5">
                        {sortedChartData.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[assetCategories.indexOf(item.name) % COLORS.length] }}></div>
                                    <span className="text-slate-600 font-medium">{item.name}</span>
                                </div>
                                <span className="font-bold text-slate-800">{((item.value / totalNetWorth) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- BAGIAN BAWAH: DAFTAR ASET --- */}
            <div>
                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {availableFilters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeFilter === filter
                                ? 'bg-slate-800 text-white shadow-md'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Grid Kartu Aset */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredAssets.length > 0 ? filteredAssets.map(asset => {
                        const color = getCategoryColor(asset.category);
                        const Icon = getCategoryIcon(asset.category);
                        const percentage = totalNetWorth > 0 ? ((asset.amount / totalNetWorth) * 100).toFixed(1) : 0;
                        const updateDate = new Date(asset.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                        return (
                            <div
                                key={asset.assetId}
                                onClick={() => handleAssetClick(asset)}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full relative"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3.5">
                                        <div className="p-3 rounded-xl text-white shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: color }}>
                                            <Icon size={22} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{asset.name}</h3>
                                            <span className="text-xs font-semibold text-slate-400">{asset.category}</span>
                                        </div>
                                    </div>
                                    <button className="text-slate-300 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>

                                <div className="mb-5 flex-grow">
                                    <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{formatIDR(asset.amount)}</p>
                                </div>

                                {/* Progress Bar & Footer */}
                                <div className="mt-auto">
                                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mb-2">
                                        <span>Porsi: {percentage}%</span>
                                        <span className="font-medium text-slate-400">{updateDate}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
                            <div className="p-4 bg-slate-50 rounded-full mb-3">
                                <Wallet size={32} className="text-slate-400" />
                            </div>
                            <p className="text-slate-700 font-bold text-lg">Tidak ada aset ditemukan.</p>
                            <p className="text-slate-500 text-sm mt-1">Ubah filter atau tambahkan aset baru untuk mulai melacak.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL FORM & RIWAYAT --- */}
            {isFormVisible && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">

                        {/* Kiri: Form */}
                        <div className="p-8 md:w-1/2 flex flex-col overflow-y-auto">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-slate-800">{selectedAsset ? 'Detail Aset' : 'Aset Baru'}</h3>
                                <button onClick={closeForm} className="md:hidden text-slate-400 hover:text-slate-600">✕</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Aset / Bank</label>
                                    <input name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Contoh: BCA Tabungan" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Saldo Saat Ini (Rp)</label>
                                    <input name="amount" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-xl text-emerald-600" required />
                                    {selectedAsset && <p className="text-xs text-blue-500 font-medium mt-2">✨ Menyimpan nominal baru akan otomatis mencatat riwayat hari ini.</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                                        <select name="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-medium">
                                            {assetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Catatan</label>
                                        <input name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Opsional" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="pt-8 mt-auto flex gap-3 border-t border-slate-100">
                                    {selectedAsset && (
                                        <button type="button" onClick={() => handleDelete(selectedAsset.assetId)} className="px-6 py-3 text-red-600 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-200 transition-all font-bold">
                                            Hapus
                                        </button>
                                    )}
                                    <button type="submit" className="flex-grow px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all font-bold">
                                        {selectedAsset ? 'Simpan Perubahan' : 'Buat Aset'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Kanan: Grafik Riwayat Individual */}
                        <div className="bg-slate-50 p-8 md:w-1/2 border-l border-slate-200 flex flex-col relative">
                            <button onClick={closeForm} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 hidden md:block bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            {selectedAsset ? (
                                <div className="flex-grow flex flex-col justify-center">
                                    <div className="flex-grow">
                                        <AssetHistoryChart
                                            assetId={selectedAsset.assetId}
                                            assetName={selectedAsset.name}
                                            color={getCategoryColor(selectedAsset.category)}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col justify-center items-center text-center p-8 opacity-60">
                                    <div className="text-7xl mb-6 grayscale opacity-50">📈</div>
                                    <h4 className="text-2xl font-bold text-slate-800 mb-2">Lacak Pertumbuhan</h4>
                                    <p className="text-slate-500 max-w-xs font-medium">Setelah aset dibuat, grafik riwayat nilai aset akan ditampilkan di sini setiap kali Anda memperbarui saldonya.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Net Worth Summary */}
            {/* <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row justify-between items-center">
                <div>
                    <p className="text-slate-400 font-medium uppercase tracking-wider text-sm mb-2">Total Net Worth</p>
                    <h2 className="text-5xl font-bold tracking-tight">{formatIDR(totalNetWorth)}</h2>
                </div>
                <button
                    onClick={() => { setIsFormVisible(true); setSelectedAsset(null); setFormData({ name: '', amount: '', category: 'Cash', description: '' }); }}
                    className="mt-6 md:mt-0 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Asset
                </button>
            </div> */}

            {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assets.length > 0 ? assets.map(asset => (
                        <div
                            key={asset.assetId}
                            onClick={() => handleAssetClick(asset)}
                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 rounded-xl bg-slate-50 text-2xl group-hover:scale-110 transition-transform duration-300">
                                    {asset.category === 'Cash' ? '💵' :
                                        asset.category === 'Bank' ? '🏦' :
                                            asset.category === 'E-Wallet' ? '📱' :
                                                asset.category === 'Investment' ? '📈' :
                                                    asset.category === 'Stock' ? '📊' :
                                                        asset.category === 'Crypto' ? '₿' :
                                                            asset.category === 'Property' ? '🏠' :
                                                                asset.category === 'Vehicle' ? '🚗' :
                                                                    asset.category === 'Gold' ? '🥇' : '💼'}
                                </div>
                                <span
                                    className="px-3 py-1 rounded-full text-xs font-semibold"
                                    style={{ backgroundColor: `${getCategoryColor(asset.category)}20`, color: getCategoryColor(asset.category) }}
                                >
                                    {asset.category}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{asset.name}</h3>
                            <p className="text-2xl font-bold text-slate-900 mb-2">{formatIDR(asset.amount)}</p>

                            {asset.description && (
                                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-grow">{asset.description}</p>
                            )}

                            <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-sm text-slate-400">
                                <span>Updated: {new Date(asset.updatedAt).toLocaleDateString()}</span>
                                <span className="flex items-center text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Details <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                </span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 text-lg">No assets tracked yet.</p>
                            <p className="text-slate-400 text-sm mt-1">Add your first asset to start tracking your net worth.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
                            Asset Allocation
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[assetCategories.indexOf(entry.name) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => formatIDR(value)}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Modal for Add/Edit & History */}
            {/* {isFormVisible && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row overflow-hidden">

                        <div className="p-8 md:w-1/2 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-slate-800">{selectedAsset ? 'Asset Details' : 'Add New Asset'}</h3>
                                <button onClick={closeForm} className="md:hidden text-slate-400 hover:text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Asset Name</label>
                                    <input name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. BCA Savings" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Current Value (Rp)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-slate-400 font-semibold">Rp</span>
                                        <input name="amount" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0" className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-lg text-slate-800" required />
                                    </div>
                                    {selectedAsset && <p className="text-xs text-blue-500 mt-2 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Updating this value records a new history point.</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Category</label>
                                        <select name="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none">
                                            {assetCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Description</label>
                                        <input name="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional note" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="pt-6 mt-auto flex gap-3">
                                    {selectedAsset && (
                                        <button type="button" onClick={() => handleDelete(selectedAsset.assetId)} className="px-5 py-3 text-red-600 hover:bg-red-50 rounded-xl border border-red-100 hover:border-red-200 transition-all font-semibold">
                                            Delete
                                        </button>
                                    )}
                                    <button type="submit" className="flex-grow px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all font-bold">
                                        {selectedAsset ? 'Update Asset' : 'Create Asset'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="bg-slate-50 p-8 md:w-1/2 border-l border-slate-100 flex flex-col">
                            <div className="flex justify-end mb-6 hidden md:block">
                                <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {selectedAsset ? (
                                <div className="flex-grow flex flex-col">
                                    <h4 className="text-lg font-bold text-slate-700 mb-6 flex items-center">
                                        <span className="bg-white p-2 rounded-lg shadow-sm mr-3 border border-slate-100">📈</span>
                                        Value History
                                    </h4>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex-grow min-h-[300px]">
                                        <AssetHistoryChart
                                            assetId={selectedAsset.assetId}
                                            assetName={selectedAsset.name}
                                            color={COLORS[assetCategories.indexOf(selectedAsset.category) % COLORS.length]}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow flex flex-col justify-center items-center text-center p-8 opacity-60">
                                    <div className="text-6xl mb-4">🚀</div>
                                    <h4 className="text-xl font-bold text-slate-800 mb-2">Track Your Growth</h4>
                                    <p className="text-slate-500">Add an asset to start tracking its value over time. You'll see a history chart here once you save it.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
}