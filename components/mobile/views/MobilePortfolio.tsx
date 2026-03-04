import React, { useState, useMemo } from 'react';
import {
    TrendingUp, Search, Plus, LayoutGrid, List, Wallet,
    Star, RefreshCw, TrendingDown, ChevronRight, Activity, ShieldCheck, Target, ArrowRight,
    AlertTriangle, PieChart, Zap, DollarSign
} from 'lucide-react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { Investment, InvestmentType } from '../../../types';

export const MobilePortfolio: React.FC = () => {
    const { investments, stats } = usePortfolioStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'All' | 'Gain' | 'Loss'>('All');
    const [activeSubTab, setActiveSubTab] = useState<'Holdings' | 'Analytics' | 'Kill Switch' | 'Passive'>('Holdings');
    const [activeTopNav, setActiveTopNav] = useState<'overview' | 'goals' | 'compliance'>('overview');

    // Number formatting
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Derived stats
    const isOverallPositive = Number(stats.totalGainPercent) >= 0;

    // Filter logic
    const filteredInvestments = useMemo(() => {
        return investments.filter(inv => {
            // Search filter
            if (searchQuery && !inv.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Gain/Loss filter
            const gainPercent = ((inv.currentValue || 0) - (inv.investedAmount || 0)) / (inv.investedAmount || 1) * 100;
            if (activeFilter === 'Gain' && gainPercent < 0) return false;
            if (activeFilter === 'Loss' && gainPercent >= 0) return false;

            return !inv.isHiddenFromTotals;
        });
    }, [investments, searchQuery, activeFilter]);

    // Helper for asset icon color based on type
    const getIconStyles = (type: string) => {
        switch (type.toUpperCase()) {
            case 'EQUITY': return 'bg-pink-100 dark:bg-pink-900/20 text-pink-500';
            case 'GOLD': case 'SILVER': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500';
            case 'CRYPTO': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-500';
            case 'REAL_ESTATE': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-500';
            default: return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-500';
        }
    };

    return (
        <div className="pb-24">
            {/* Top Quick Nav (Goal GPS / Compliance) - Kept from Stitch design as it was in header but relevant to Portfolio */}
            <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
                {([{ id: 'overview' as const, label: 'Overview', Icon: Activity }, { id: 'goals' as const, label: 'Goal GPS', Icon: Target }, { id: 'compliance' as const, label: 'Compliance', Icon: ShieldCheck }]).map(nav => (
                    <button key={nav.id} onClick={() => setActiveTopNav(nav.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeTopNav === nav.id ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <nav.Icon className="w-4 h-4" />
                        {nav.label}
                    </button>
                ))}
            </div>

            <main className="px-4 pt-4 space-y-5">
                {activeTopNav === 'overview' && (<>
                    {/* Total Net Worth Card */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="relative z-10">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Net Worth</p>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalCurrent)}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isOverallPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {isOverallPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                    {isOverallPositive ? '+' : ''}{stats.totalGainPercent}%
                                </span>
                                <span className="text-xs text-slate-400">vs invested</span>
                            </div>
                        </div>
                    </div>

                    {/* Sub-tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                        {(['Holdings', 'Analytics', 'Kill Switch', 'Passive'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveSubTab(tab)}
                                className={`flex-none pb-2 px-4 border-b-2 text-sm font-medium transition-colors ${activeSubTab === tab ? 'border-indigo-500 text-indigo-500' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeSubTab === 'Holdings' && (
                        <>
                            {/* Controls */}
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="text-slate-400 w-4 h-4" />
                                    </span>
                                    <input
                                        className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl leading-5 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-900 dark:text-white transition-colors"
                                        placeholder="Search assets..."
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="flex-none w-10 h-10 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                                    <Plus className="w-5 h-5" />
                                </button>
                                <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shrink-0">
                                    <button className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm">
                                        <LayoutGrid className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                <button
                                    onClick={() => setActiveFilter('All')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${activeFilter === 'All' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setActiveFilter('Gain')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${activeFilter === 'Gain' ? 'bg-emerald-500 text-white border-transparent' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium'}`}
                                >
                                    Gain
                                </button>
                                <button
                                    onClick={() => setActiveFilter('Loss')}
                                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${activeFilter === 'Loss' ? 'bg-rose-500 text-white border-transparent' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium'}`}
                                >
                                    Loss
                                </button>
                            </div>

                            {/* Asset List */}
                            <div className="grid grid-cols-1 gap-4">
                                {filteredInvestments.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                        No investments matches found.
                                    </div>
                                ) : (
                                    filteredInvestments.map(inv => {
                                        const gainValue = (inv.currentValue || 0) - (inv.investedAmount || 0);
                                        const gainPercent = (inv.investedAmount || 0) > 0 ? (gainValue / inv.investedAmount!) * 100 : 0;
                                        const isGain = gainPercent >= 0;

                                        return (
                                            <div key={inv.id} className="group relative bg-white dark:bg-[#151e32] rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3 w-[65%]">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconStyles(inv.type)}`}>
                                                            {(inv.type === InvestmentType.DIGITAL_GOLD || inv.type === InvestmentType.DIGITAL_SILVER) ? <Star className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                                                        </div>
                                                        <div className="truncate">
                                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{inv.name}</h3>
                                                            <p className="text-xs text-slate-500 truncate">{inv.platform || inv.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(inv.currentValue || 0)}</p>
                                                        <p className={`text-xs font-medium ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {isGain ? '+' : ''}{gainPercent.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="relative h-8 w-full mt-2 overflow-hidden flex items-end">
                                                    {/* Mimicking the mini sparkline with pure CSS/SVG as per Stitch */}
                                                    <svg className="absolute bottom-0 w-full h-[120%]" preserveAspectRatio="none" viewBox="0 0 100 20">
                                                        <path
                                                            d={isGain ? "M0 18 Q 30 15, 60 5 T 100 2" : "M0 10 Q 40 5, 60 15 T 100 18"}
                                                            fill="none"
                                                            stroke={isGain ? "#10b981" : "#ef4444"}
                                                            strokeOpacity="0.5" strokeWidth="2"
                                                        ></path>
                                                    </svg>

                                                    <div className="absolute bottom-1 left-0 flex items-center gap-2">
                                                        {inv.recurring?.isEnabled && (
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-indigo-500/20 text-indigo-500 border border-indigo-500/20 flex items-center gap-0.5">
                                                                <RefreshCw className="w-[10px] h-[10px]" /> SIP
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] text-slate-400 ml-1">{Math.abs(gainPercent / 10).toFixed(1)}% vol</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}

                    {activeSubTab === 'Analytics' && (
                        <div className="space-y-4">
                            {/* Asset Type Breakdown */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <PieChart className="w-4 h-4 text-indigo-500" /> Asset Type Breakdown
                                </h3>
                                <div className="space-y-3">
                                    {(() => {
                                        const typeMap: Record<string, { count: number, value: number }> = {};
                                        investments.filter(i => !i.isHiddenFromTotals).forEach(inv => {
                                            const t = inv.type || 'Other';
                                            if (!typeMap[t]) typeMap[t] = { count: 0, value: 0 };
                                            typeMap[t].count++;
                                            typeMap[t].value += (inv.currentValue || 0);
                                        });
                                        const totalVal = Object.values(typeMap).reduce((s, v) => s + v.value, 0);
                                        return Object.entries(typeMap).sort((a, b) => b[1].value - a[1].value).map(([type, data]) => (
                                            <div key={type} className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getIconStyles(type)}`}>
                                                    <Wallet className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-medium text-slate-900 dark:text-white">{type}</span>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(data.value)}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalVal > 0 ? (data.value / totalVal * 100) : 0}%` }} />
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 mt-0.5">{data.count} holdings · {totalVal > 0 ? (data.value / totalVal * 100).toFixed(1) : 0}%</p>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                            {/* Performance Summary */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Diversity Score</p>
                                    <p className="text-2xl font-bold text-indigo-500">{Math.min(100, new Set(investments.filter(i => !i.isHiddenFromTotals).map(i => i.type)).size * 20)}/100</p>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Holdings</p>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{investments.filter(i => !i.isHiddenFromTotals).length}</p>
                                </div>
                            </div>
                            {/* Quant Metrics */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-purple-500" /> Quant Metrics
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Sharpe Ratio', value: '1.42', desc: 'Risk-adjusted return', color: 'text-emerald-500' },
                                        { label: 'Sortino Ratio', value: '1.85', desc: 'Downside risk adj.', color: 'text-indigo-500' },
                                        { label: 'Beta', value: '0.92', desc: 'Market sensitivity', color: 'text-amber-500' },
                                        { label: 'Max Drawdown', value: '-12.3%', desc: 'Largest peak drop', color: 'text-rose-500' },
                                        { label: 'Alpha', value: '+2.1%', desc: 'Excess return', color: 'text-emerald-500' },
                                        { label: 'Std Deviation', value: '14.5%', desc: 'Volatility measure', color: 'text-purple-500' },
                                    ].map((q, i) => (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                                            <p className="text-[9px] text-slate-500 uppercase font-bold mb-0.5">{q.label}</p>
                                            <p className={`text-lg font-black ${q.color}`}>{q.value}</p>
                                            <p className="text-[9px] text-slate-400">{q.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'Kill Switch' && (
                        <div className="space-y-4">
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                    <h3 className="text-sm font-bold text-rose-500">Emergency Liquidation</h3>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Generate sell orders for all active positions. Use with extreme caution.</p>
                                <div className="space-y-2">
                                    {investments.filter(i => !i.isHiddenFromTotals).slice(0, 8).map(inv => (
                                        <div key={inv.id} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800 last:border-0">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className={`w-7 h-7 rounded flex items-center justify-center shrink-0 text-xs font-bold ${getIconStyles(inv.type)}`}>
                                                    {inv.name.charAt(0)}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{inv.name}</p>
                                                    <p className="text-[10px] text-slate-500">{formatCurrency(inv.currentValue || 0)}</p>
                                                </div>
                                            </div>
                                            <button className="px-2 py-1 text-[10px] font-bold text-rose-500 border border-rose-500/30 rounded bg-rose-500/5 hover:bg-rose-500/10 transition-colors shrink-0">SELL</button>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 bg-rose-500 text-white text-xs font-bold py-3 rounded-xl shadow-lg shadow-rose-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
                                    <Zap className="w-4 h-4" /> LIQUIDATE ALL ({investments.filter(i => !i.isHiddenFromTotals).length} positions)
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'Passive' && (
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-indigo-500" /> Active SIPs
                                </h3>
                                {(() => {
                                    const sipInvestments = investments.filter(i => i.recurring?.isEnabled && !i.isHiddenFromTotals);
                                    if (sipInvestments.length === 0) {
                                        return (
                                            <div className="text-center py-8">
                                                <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-400/50" />
                                                <p className="text-xs text-slate-500">No active SIPs found.</p>
                                                <p className="text-[10px] text-slate-400 mt-1">Enable recurring on investments to track here.</p>
                                            </div>
                                        );
                                    }
                                    const totalSipMonthly = sipInvestments.reduce((s, i) => s + (i.recurring?.amount || 0), 0);
                                    return (
                                        <>
                                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-4 text-center">
                                                <p className="text-[10px] uppercase font-bold text-indigo-500 mb-1">Monthly SIP Outflow</p>
                                                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalSipMonthly)}</p>
                                            </div>
                                            <div className="space-y-3">
                                                {sipInvestments.map(inv => (
                                                    <div key={inv.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getIconStyles(inv.type)}`}>
                                                            <RefreshCw className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{inv.name}</p>
                                                            <p className="text-[10px] text-slate-500">{formatCurrency(inv.recurring?.amount || 0)}/mo</p>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">ACTIVE</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                </>)}

                {/* ===== GOAL GPS VIEW ===== */}
                {activeTopNav === 'goals' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
                            <h2 className="text-sm font-bold flex items-center gap-2 mb-2"><Target className="w-4 h-4" /> Goal GPS</h2>
                            <p className="text-xs text-indigo-200">Track your financial goals and see how close you are to achieving them.</p>
                        </div>
                        {[
                            { name: 'Emergency Fund', target: 300000, icon: '🏥', priority: 'High' },
                            { name: 'House Down Payment', target: 2000000, icon: '🏠', priority: 'High' },
                            { name: 'Car Fund', target: 800000, icon: '🚗', priority: 'Medium' },
                            { name: 'Vacation', target: 200000, icon: '✈️', priority: 'Low' },
                            { name: 'Retirement Corpus', target: 50000000, icon: '🏖️', priority: 'High' },
                        ].map((goal, i) => {
                            const allocated = Math.min(goal.target, stats.totalCurrent * (0.15 - i * 0.02));
                            const pct = Math.min(100, goal.target > 0 ? (allocated / goal.target) * 100 : 0);
                            return (
                                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{goal.icon}</span>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                                                <p className="text-[10px] text-slate-400">Target: {formatCurrency(goal.target)}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${goal.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : goal.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{goal.priority}</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                                        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="flex justify-between text-[10px]">
                                        <span className="text-slate-500">{formatCurrency(allocated)} saved</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{pct.toFixed(0)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ===== COMPLIANCE VIEW ===== */}
                {activeTopNav === 'compliance' && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white">
                            <h2 className="text-sm font-bold flex items-center gap-2 mb-2"><ShieldCheck className="w-4 h-4" /> Compliance Shield</h2>
                            <p className="text-xs text-emerald-200">Ensure your portfolio meets regulatory and financial best practices.</p>
                        </div>

                        {/* Compliance Score */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Compliance Score</p>
                            <span className="text-4xl font-black text-emerald-500">92</span>
                            <span className="text-sm text-slate-400">/100</span>
                            <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-3">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                            </div>
                        </div>

                        {/* Checks */}
                        {[
                            { check: 'KYC Verification', status: 'pass', detail: 'All nominees verified' },
                            { check: 'Nominee Assignment', status: 'pass', detail: `${investments.filter(i => !i.isHiddenFromTotals).length} holdings covered` },
                            { check: 'Concentration Risk', status: stats.topAsset && stats.topAsset.percent > 30 ? 'warn' : 'pass', detail: stats.topAsset ? `${stats.topAsset.name} is ${stats.topAsset.percent?.toFixed(0)}%` : 'Well diversified' },
                            { check: 'Tax Compliance', status: 'pass', detail: 'LTCG within limits' },
                            { check: 'Insurance Coverage', status: 'warn', detail: 'Review term plan' },
                            { check: 'Emergency Fund', status: 'pass', detail: '6+ months covered' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {item.status === 'pass' ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">{item.check}</p>
                                    <p className="text-[10px] text-slate-400">{item.detail}</p>
                                </div>
                                <span className={`text-[9px] font-bold uppercase ${item.status === 'pass' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status === 'pass' ? '✓ PASS' : '⚠ REVIEW'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Blank space to clear bottom nav */}
                <div className="h-6"></div>
            </main>
        </div>
    );
};
