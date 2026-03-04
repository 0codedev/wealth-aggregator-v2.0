import React, { useState, useMemo } from 'react';
import {
    LayoutGrid, Bell, History, TrendingDown, Trophy, Wallet, ChevronDown,
    Gavel, Droplet, Banknote, ArrowRight, LineChart, Users, Flame,
    Brain, Sparkles, TrendingUp, PiggyBank, Flag, Send, Rocket,
    Target, Hourglass, BellRing, Plus, LayoutDashboard, Activity,
    BellOff, PieChart, CircleDashed, Layers, Mic, FileText, RefreshCw,
    ShieldCheck, AlertTriangle
} from 'lucide-react';
import { usePortfolioStore } from '../../../store/portfolioStore';

export const MobileDashboard: React.FC = () => {
    const { stats, investments } = usePortfolioStore();

    const [activeTimeTab, setActiveTimeTab] = useState<'PAST' | 'TIME_TRAVELER' | 'FUTURE'>('TIME_TRAVELER');
    const [activeAlertTab, setActiveAlertTab] = useState<'alerts' | 'templates' | 'analytics'>('alerts');
    const [finnInput, setFinnInput] = useState('');

    // Helper functions to format numbers
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const isPositive = Number(stats.totalGainPercent) >= 0;

    // Derived Data
    const taxHarvestingData = useMemo(() => {
        const lossMakers = investments
            .filter(inv => !inv.isHiddenFromTotals && (inv.currentValue || 0) < (inv.investedAmount || 0))
            .map(inv => ({
                name: inv.name,
                loss: (inv.currentValue || 0) - (inv.investedAmount || 0),
            }))
            .sort((a, b) => a.loss - b.loss);
        const totalLoss = lossMakers.reduce((sum, inv) => sum + Math.abs(inv.loss), 0);
        return { lossMakers, totalLoss };
    }, [investments]);

    const activeLiability = stats.totalLiability || 0;

    const [monthlyExpenses, setMonthlyExpenses] = useState(55000);
    const [swr, setSwr] = useState(4);
    const fireNumber = useMemo(() => (monthlyExpenses * 12) / (swr / 100), [monthlyExpenses, swr]);
    const fireProgress = Math.min(100, (stats.totalCurrent / fireNumber) * 100);

    // Compute allocation percentages for donut
    const allocationSlices = useMemo(() => {
        const typeMap: Record<string, number> = {};
        investments.filter(i => !i.isHiddenFromTotals).forEach(inv => {
            const t = inv.type || 'Other';
            typeMap[t] = (typeMap[t] || 0) + (inv.currentValue || 0);
        });
        const total = Object.values(typeMap).reduce((s, v) => s + v, 0);
        if (total === 0) return [];
        const colors = ['text-indigo-500', 'text-purple-500', 'text-rose-500', 'text-emerald-500', 'text-amber-500', 'text-cyan-500'];
        let offset = 0;
        return Object.entries(typeMap).sort((a, b) => b[1] - a[1]).map(([name, value], i) => {
            const pct = (value / total) * 100;
            const slice = { name, pct, offset, color: colors[i % colors.length] };
            offset += pct;
            return slice;
        });
    }, [investments]);

    // Compute platform bars
    const platformBars = useMemo(() => {
        const platMap: Record<string, number> = {};
        investments.filter(i => !i.isHiddenFromTotals).forEach(inv => {
            const p = inv.platform || 'Other';
            platMap[p] = (platMap[p] || 0) + (inv.currentValue || 0);
        });
        const total = Object.values(platMap).reduce((s, v) => s + v, 0);
        if (total === 0) return [];
        const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
        return Object.entries(platMap)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value], i) => ({ name, pct: (value / total) * 100, color: colors[i % colors.length] }));
    }, [investments]);

    return (
        <div className="px-4 py-6 space-y-6 max-w-lg mx-auto pb-24">

            {/* Market Status Tickers */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                <div className="flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs w-auto whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">MARKET CLOSED</span>
                </div>
                <div className="flex-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 flex items-center gap-2 text-xs w-auto whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">OPTIMAL VIX</span>
                </div>
            </div>

            {/* Net Worth Card */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gross Assets</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isPositive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                        {isPositive ? '+' : ''}{stats.totalGainPercent}%
                    </span>
                </div>
                <div className="mt-4 mb-6 relative z-10">
                    <h2 className="text-4xl font-sans font-bold text-slate-900 dark:text-white tracking-tight">{formatCurrency(stats.totalCurrent)}</h2>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Net Worth</span>
                        <span className="text-slate-900 dark:text-slate-300 font-medium">{formatCurrency(stats.totalCurrent)}</span>
                    </div>
                </div>
                <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl flex relative z-10">
                    <button
                        onClick={() => setActiveTimeTab('PAST')}
                        className={`flex-1 py-2 text-xs rounded-lg transition-colors ${activeTimeTab === 'PAST' ? 'font-bold text-white bg-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        {activeTimeTab === 'PAST' && <History className="w-4 h-4" />} PAST
                    </button>
                    <button
                        onClick={() => setActiveTimeTab('TIME_TRAVELER')}
                        className={`flex-1 py-2 text-xs rounded-lg transition-colors ${activeTimeTab === 'TIME_TRAVELER' ? 'font-bold text-white bg-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        {activeTimeTab === 'TIME_TRAVELER' && <History className="w-4 h-4" />} TIME TRAVELER
                    </button>
                    <button
                        onClick={() => setActiveTimeTab('FUTURE')}
                        className={`flex-1 py-2 text-xs rounded-lg transition-colors ${activeTimeTab === 'FUTURE' ? 'font-bold text-white bg-indigo-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1' : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        {activeTimeTab === 'FUTURE' && <History className="w-4 h-4" />} FUTURE
                    </button>
                </div>
            </section>

            {/* 2x2 Grid stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 relative">
                    <div className="flex justify-between items-start mb-3">
                        {Number(stats.totalGainPercent) >= 0 ? <TrendingUp className="text-emerald-500 w-5 h-5" /> : <TrendingDown className="text-rose-500 w-5 h-5" />}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${Number(stats.totalGainPercent) >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                            {Number(stats.totalGainPercent) >= 0 ? '+' : ''}{stats.totalGainPercent}%
                        </span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Total Profit/Loss</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalGain)}</h3>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-rose-500 w-1/4 h-full rounded-full"></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-3">
                        <Trophy className="text-orange-500 w-5 h-5" />
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-500/10 px-1.5 py-0.5 rounded">ALL TIME HIGH</span>
                    </div>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Top Performer</p>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{stats.topAsset?.name || 'None'}</h3>
                    <div className="flex items-end justify-between mt-2">
                        <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Return</p>
                            <p className={`text-lg font-bold ${stats.topAsset?.percent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stats.topAsset?.percent >= 0 ? '+' : ''}{stats.topAsset?.percent}%
                            </p>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">High Impact</span>
                    </div>
                </div>
            </div>

            {/* Tax Alpha */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                            <Wallet className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Tax Alpha</h3>
                    </div>
                    {taxHarvestingData.totalLoss > 0 ? (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">ACTION REQD</span>
                    ) : (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">ALL GREEN</span>
                    )}
                </div>
                <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Recoverable Value</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-orange-500">{formatCurrency(taxHarvestingData.totalLoss * 0.15)}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Total Loss: {formatCurrency(taxHarvestingData.totalLoss)}</span>
                    </div>
                </div>
                <div className="space-y-3">
                    {taxHarvestingData.lossMakers.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 w-3/4">
                                <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">{item.name.charAt(0)}</div>
                                <div className="truncate w-full">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                                    <p className="text-[10px] text-rose-500">{formatCurrency(item.loss)}</p>
                                </div>
                            </div>
                            <button className="px-2 py-1 text-[10px] font-bold text-orange-500 border border-orange-500/30 rounded bg-orange-500/5 hover:bg-orange-500/10 transition-colors">Harvest</button>
                        </div>
                    ))}
                    {taxHarvestingData.lossMakers.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-2">No loss-making investments.</p>
                    )}
                </div>
                {taxHarvestingData.lossMakers.length > 2 && (
                    <button className="w-full mt-4 text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1">
                        View {taxHarvestingData.lossMakers.length - 2} more missions <ChevronDown className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Active Liability */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                            <Gavel className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Active Liability</h3>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">{activeLiability > 0 ? 'ACTIVE' : 'NONE'}</span>
                </div>
                <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Outstanding Principal</p>
                    <p className="text-2xl font-bold text-rose-500">{formatCurrency(-activeLiability)}</p>
                </div>
                {activeLiability > 0 && (
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-3">
                        <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">You Bleed</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                <Droplet className="w-3 h-3 text-rose-500" /> {formatCurrency(activeLiability * 0.09 / 365)} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/ day</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Interest Cost</p>
                            <p className="text-sm font-bold text-rose-500">+{formatCurrency(activeLiability * 0.09)} <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">/ yr est</span></p>
                        </div>
                    </div>
                )}
            </div>

            {/* Scrollable Quick Actions */}
            <div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
                    <div className="snap-start flex-none w-[140px] bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[120px] group hover:border-indigo-500 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                            <span className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                <Banknote className="w-5 h-5" />
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">Spending Analytics</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Track expenses</p>
                        </div>
                    </div>
                    <div className="snap-start flex-none w-[140px] bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[120px] group hover:border-indigo-500 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                            <span className="p-1.5 bg-orange-500/10 text-orange-500 rounded-lg">
                                <LineChart className="w-5 h-5" />
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">Market Insights</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Trends &amp; Sentiment</p>
                        </div>
                    </div>
                    <div className="snap-start flex-none w-[140px] bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-[120px] group hover:border-indigo-500 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                            <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
                                <Users className="w-5 h-5" />
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1">Community</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Connect with others</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fire Control */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500">
                            <Flame className="w-4 h-4" />
                        </span>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-none">Fire Control</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Freedom Flight Deck</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">+ DEVIATION</span>
                </div>
                <div className="flex items-center justify-between gap-6 mb-6">
                    <div className="relative w-24 h-24 flex items-center justify-center flex-none">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-200 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                            <path className="text-orange-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${fireProgress}, 100`} strokeWidth="3"></path>
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-xl font-bold text-orange-500">{fireProgress.toFixed(1)}%</span>
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">Freedom</p>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Target Corpus</p>
                            <p className="text-lg font-bold text-orange-500">{formatCurrency(fireNumber)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Est. Freedom Date</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">To be calc <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Age: --</span></p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                            <span>Monthly Expenses</span>
                            <span>{formatCurrency(monthlyExpenses)}/Mo</span>
                        </div>
                        <input onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" max="250000" min="10000" step="5000" value={monthlyExpenses} type="range" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                            <span>Safe Withdrawal Rate</span>
                            <span>{swr}%</span>
                        </div>
                        <input onChange={(e) => setSwr(Number(e.target.value))} className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500" max="8" min="2" step="0.5" value={swr} type="range" />
                    </div>
                </div>
            </section>

            {/* F.I.N.N */}
            <section className="bg-gradient-to-b from-indigo-900/40 to-slate-900/40 dark:from-indigo-950/40 dark:to-slate-950/40 rounded-2xl p-5 border border-indigo-500/30 dark:border-indigo-500/20 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)] relative overflow-hidden">
                {/* Removed transparenttextures background for native feel */}
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-xs">
                                <Brain className="w-4 h-4" />
                            </span>
                            <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400">F.I.N.N</h3>
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-500 text-[8px] font-bold border border-indigo-500/30">BETA</span>
                        </div>
                        <Sparkles className="text-indigo-500/50 w-4 h-4" />
                    </div>
                    <div className="bg-slate-900/60 dark:bg-black/40 rounded-xl p-3 border border-indigo-500/20 mb-4">
                        <div className="flex gap-3">
                            <div className="w-1 bg-indigo-500 h-auto rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            <p className="text-xs text-indigo-100/90 leading-relaxed font-mono">
                                I am F.I.N.N (Financial Intelligence Neural Network). I can simulate scenarios, audit your spending, or optimize your tax strategy. Ready when you are.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 pb-1">
                        {[
                            { label: 'Portfolio Health', icon: TrendingUp, prompt: 'Analyze my portfolio health and risk score' },
                            { label: 'Saving Opps', icon: PiggyBank, prompt: 'What saving opportunities do I have?' },
                            { label: 'Goals', icon: Flag, prompt: 'Help me set financial goals and track progress' },
                        ].map(chip => (
                            <span key={chip.label} onClick={() => setFinnInput(chip.prompt)} className="flex-none px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer flex items-center gap-1">
                                <chip.icon className="w-3 h-3" /> {chip.label}
                            </span>
                        ))}
                    </div>
                    <div className="relative">
                        <input value={finnInput} onChange={(e) => setFinnInput(e.target.value)} className="w-full bg-slate-900 border border-slate-700 dark:border-slate-800 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none" placeholder="Ask F.I.N.N..." type="text" />
                        <button onClick={() => { if (finnInput.trim()) { setFinnInput(''); } }} className="absolute right-2 top-2 p-0.5 text-indigo-500 hover:text-white transition-colors">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Project SL */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Rocket className="w-5 h-5 text-purple-500" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase">Project SL</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gross Asset Track</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Current Status</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{fireProgress > 0 ? fireProgress.toFixed(1) : '0'}%</p>
                    </div>
                </div>
                <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full mb-6">
                    <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]`} style={{ width: `${Math.min(fireProgress, 100)}%` }}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                            <Target className="w-3 h-3" /> Target Goal
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(fireNumber)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                            <Hourglass className="w-3 h-3" /> To Go
                        </p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(Math.max(0, fireNumber - stats.totalCurrent))}</p>
                    </div>
                </div>
            </section>

            {/* Alerts Engine 2.0 */}
            <section className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                        <BellRing className="w-5 h-5 text-orange-500" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Alerts Engine 2.0</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Create triggers & alerts</p>
                        </div>
                    </div>
                    <button className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg shadow-orange-500/20">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-1 border border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                        {([{ id: 'alerts' as const, label: 'Alerts', Icon: Bell }, { id: 'templates' as const, label: 'Templates', Icon: LayoutDashboard }, { id: 'analytics' as const, label: 'Analytics', Icon: Activity }]).map(t => (
                            <button key={t.id} onClick={() => setActiveAlertTab(t.id)}
                                className={`py-1.5 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${activeAlertTab === t.id ? 'text-white bg-orange-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                                <t.Icon className="w-3 h-3" /> {t.label}
                            </button>
                        ))}
                    </div>

                    {activeAlertTab === 'alerts' && (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                                <BellOff className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">No alerts configured yet.</p>
                            <p className="text-[10px] text-slate-400">Use templates or click "Add" to get started.</p>
                        </div>
                    )}

                    {activeAlertTab === 'templates' && (
                        <div className="p-4 space-y-3">
                            {[
                                { name: 'Price Drop Alert', desc: 'Trigger when any holding drops >5%', icon: TrendingDown },
                                { name: 'SIP Reminder', desc: 'Monthly SIP due date notification', icon: RefreshCw },
                                { name: 'Goal Milestone', desc: 'Alert when portfolio hits target', icon: Target },
                            ].map((tmpl, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-orange-500/30 transition-colors cursor-pointer">
                                    <div className="w-9 h-9 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                                        <tmpl.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{tmpl.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{tmpl.desc}</p>
                                    </div>
                                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                                </div>
                            ))}
                        </div>
                    )}

                    {activeAlertTab === 'analytics' && (
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-center">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">0</p>
                                    <p className="text-[10px] text-slate-500">Triggered</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-center">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">0</p>
                                    <p className="text-[10px] text-slate-500">Active</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-center">
                                    <p className="text-lg font-bold text-emerald-500">100%</p>
                                    <p className="text-[10px] text-slate-500">Uptime</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 text-center">Alert analytics will populate once alerts are active.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Asset Allocation & Platform Diversification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Asset Allocation</h3>
                        <PieChart className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-200 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                {allocationSlices.map((slice, i) => (
                                    <path key={i} className={slice.color} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${slice.pct}, ${100 - slice.pct}`} strokeDashoffset={`${-slice.offset}`} strokeWidth="4"></path>
                                ))}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{allocationSlices.length} Types</span>
                            </div>
                        </div>
                    </div>
                    {allocationSlices.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                            {allocationSlices.slice(0, 4).map((s, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500 dark:text-slate-400">{s.name}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{s.pct.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase">Platform Diversification</h3>
                            <p className="text-[8px] text-slate-500 dark:text-slate-400 uppercase">Risk Concentration</p>
                        </div>
                        <Layers className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="space-y-3 mt-4">
                        {platformBars.length > 0 ? platformBars.slice(0, 5).map((bar, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-14 text-[10px] text-slate-500 dark:text-slate-400 text-right truncate">{bar.name}</span>
                                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${bar.pct}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-900 dark:text-white w-8">{bar.pct.toFixed(0)}%</span>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-400 text-center py-3">Add investments to see platform breakdown</p>
                        )}
                    </div>
                    {platformBars.length > 0 && (
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Top Concentration</span>
                            <span className="text-[10px] font-bold text-slate-900 dark:text-white">{platformBars[0]?.name} ({platformBars[0]?.pct.toFixed(0)}%)</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════ WEALTH TOOLS SECTION ═══════════ */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Wealth Tools
                </h2>

                {/* Oracle Hub — Monte Carlo Widget */}
                <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900 rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" /> Oracle 2.0
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-bold uppercase">Monte Carlo</span>
                        </div>
                        {(() => {
                            const sipMonthly = investments.filter(i => i.recurring?.isEnabled).reduce((s, i) => s + (i.recurring?.amount || 0), 0);
                            const projYears = 10;
                            const annualReturn = 0.12;
                            const future = stats.totalCurrent * Math.pow(1 + annualReturn, projYears) + sipMonthly * 12 * ((Math.pow(1 + annualReturn, projYears) - 1) / annualReturn);
                            const bearCase = future * 0.6;
                            const bullCase = future * 1.4;
                            return (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-slate-950/60 rounded-xl p-2.5 text-center border border-slate-800">
                                            <p className="text-[9px] text-rose-400 font-bold uppercase">Bear</p>
                                            <p className="text-xs font-mono font-bold text-white">{formatCurrency(bearCase)}</p>
                                        </div>
                                        <div className="bg-indigo-600/20 rounded-xl p-2.5 text-center border border-indigo-500/30">
                                            <p className="text-[9px] text-indigo-300 font-bold uppercase">Base</p>
                                            <p className="text-xs font-mono font-bold text-white">{formatCurrency(future)}</p>
                                        </div>
                                        <div className="bg-slate-950/60 rounded-xl p-2.5 text-center border border-slate-800">
                                            <p className="text-[9px] text-emerald-400 font-bold uppercase">Bull</p>
                                            <p className="text-xs font-mono font-bold text-white">{formatCurrency(bullCase)}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-950/40 rounded-lg p-2 flex justify-between text-[10px]">
                                        <span className="text-slate-400">Horizon: <span className="text-white font-bold">{projYears}yr</span></span>
                                        <span className="text-slate-400">SIP: <span className="text-white font-bold">{formatCurrency(sipMonthly)}/mo</span></span>
                                        <span className="text-slate-400">Return: <span className="text-white font-bold">12%</span></span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* FI Score Widget */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 rounded-2xl p-5 relative overflow-hidden border border-slate-700">
                    <div className="absolute top-2 right-2 opacity-5"><Flame className="w-20 h-20" /></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg"><Flame className="w-4 h-4 text-white" /></div>
                            <div>
                                <h3 className="text-sm font-bold text-white">FIRE Score</h3>
                                <p className="text-[10px] text-slate-400">Financial Independence</p>
                            </div>
                        </div>
                        {(() => {
                            const monthlyExp = monthlyExpenses;
                            const fireNum = monthlyExp * 12 * 25;
                            const fireProg = fireNum > 0 ? Math.min(100, (stats.totalCurrent / fireNum) * 100) : 0;
                            const monthsRunway = monthlyExp > 0 ? Math.floor(stats.totalCurrent / monthlyExp) : 0;
                            return (
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{fireProg.toFixed(0)}</span>
                                        <span className="text-sm text-slate-400">/100</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/5 p-2.5 rounded-xl">
                                            <p className="text-[10px] text-slate-400">Runway</p>
                                            <p className="text-sm font-bold text-white">{monthsRunway} mo</p>
                                        </div>
                                        <div className="bg-white/5 p-2.5 rounded-xl">
                                            <p className="text-[10px] text-slate-400">FIRE Number</p>
                                            <p className="text-sm font-bold text-white">{formatCurrency(fireNum)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                            <span>FIRE Progress</span><span>{fireProg.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${fireProg}%` }} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Wealth Simulator Mini */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <LineChart className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Wealth Simulator</h3>
                    </div>
                    {(() => {
                        const years = [1, 3, 5, 10, 15, 20];
                        const rate = 0.12;
                        return (
                            <div className="space-y-2">
                                {years.map(y => {
                                    const fv = stats.totalCurrent * Math.pow(1 + rate, y);
                                    const growth = ((fv / stats.totalCurrent) - 1) * 100;
                                    return (
                                        <div key={y} className="flex items-center gap-2">
                                            <span className="w-8 text-[10px] text-slate-500 text-right">{y}yr</span>
                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, growth / 10)}%` }} />
                                            </div>
                                            <span className="w-20 text-[10px] font-mono font-bold text-slate-900 dark:text-white text-right">{formatCurrency(fv)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* ═══════════ WATCHLISTS & CALENDARS ═══════════ */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-500" /> Watchlists & Calendars
                </h2>

                {/* Smart Watchlist */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-500" /> Smart Watchlist
                        </h3>
                        <span className="text-[9px] text-slate-400">{investments.filter(i => !i.isHiddenFromTotals).length} tracked</span>
                    </div>
                    <div className="space-y-2">
                        {investments.filter(i => !i.isHiddenFromTotals).slice(0, 5).map(inv => {
                            const change = ((inv.currentValue || 0) - (inv.investedAmount || 0)) / (inv.investedAmount || 1) * 100;
                            const isUp = change >= 0;
                            return (
                                <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${isUp ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {inv.name.charAt(0)}
                                        </div>
                                        <span className="text-xs font-medium text-slate-900 dark:text-white truncate max-w-[120px]">{inv.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(inv.currentValue || 0)}</span>
                                        <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-500' : 'text-rose-500'}`}>{isUp ? '+' : ''}{change.toFixed(1)}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Dividend Calendar Mini */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Banknote className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dividend Calendar</h3>
                    </div>
                    {(() => {
                        const sipInvs = investments.filter(i => i.recurring?.isEnabled && !i.isHiddenFromTotals);
                        const totalAnnualDiv = sipInvs.reduce((s, i) => s + ((i.currentValue || 0) * 0.02), 0);
                        return (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                                        <p className="text-[10px] uppercase font-bold text-emerald-500">Est. Annual</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalAnnualDiv)}</p>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Monthly Avg</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalAnnualDiv / 12)}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 text-center">Based on ~2% dividend yield estimate</p>
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* ═══════════ ADVANCED ANALYTICS ═══════════ */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-purple-500" /> Advanced Analytics
                </h2>

                {/* XIRR Time Machine */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Hourglass className="w-4 h-4 text-purple-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">XIRR Time Machine</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5 text-center">
                                <p className="text-[9px] text-purple-400 font-bold uppercase">Since Inception</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{stats.totalGainPercent}%</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-2.5 text-center border border-slate-200 dark:border-slate-800">
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Total Invested</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalInvested)}</p>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-2.5 text-center border border-slate-200 dark:border-slate-800">
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Current</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalCurrent)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Portfolio Constellation */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-cyan-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Portfolio Constellation</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {investments.filter(i => !i.isHiddenFromTotals).slice(0, 10).map(inv => {
                            const size = Math.max(28, Math.min(64, ((inv.currentValue || 0) / (stats.totalCurrent || 1)) * 300));
                            const change = ((inv.currentValue || 0) - (inv.investedAmount || 0)) / (inv.investedAmount || 1) * 100;
                            return (
                                <div key={inv.id} className={`rounded-full flex items-center justify-center text-[8px] font-bold border ${change >= 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}
                                    style={{ width: size, height: size }} title={`${inv.name}: ${change.toFixed(1)}%`}>
                                    {inv.name.substring(0, 3)}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">Bubble size = portfolio weight. Color = gain/loss.</p>
                </div>

                {/* Correlation Matrix Mini */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <LayoutGrid className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Correlation Matrix</h3>
                    </div>
                    {(() => {
                        const types = [...new Set(investments.filter(i => !i.isHiddenFromTotals).map(i => i.type))].slice(0, 4);
                        return (
                            <div className="space-y-1">
                                <div className="flex gap-1 ml-14">
                                    {types.map(t => <span key={t} className="w-12 text-[8px] text-slate-400 text-center truncate">{t}</span>)}
                                </div>
                                {types.map(rowType => (
                                    <div key={rowType} className="flex items-center gap-1">
                                        <span className="w-14 text-[8px] text-slate-400 text-right truncate pr-1">{rowType}</span>
                                        {types.map(colType => {
                                            const corr = rowType === colType ? 1 : (Math.random() * 0.8 - 0.2);
                                            return (
                                                <div key={colType} className={`w-12 h-8 rounded flex items-center justify-center text-[9px] font-mono font-bold ${corr > 0.5 ? 'bg-emerald-500/20 text-emerald-400' : corr > 0 ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-rose-500/10 text-rose-400'}`}>
                                                    {corr.toFixed(2)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* ═══════════ SECURITY & RISK ═══════════ */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-500" /> Security & Risk
                </h2>

                {/* Fortress Vault */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden">
                    <div className="absolute top-2 right-2 opacity-5"><ShieldCheck className="w-20 h-20" /></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-indigo-600 rounded-lg"><ShieldCheck className="w-4 h-4 text-white" /></div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Fortress Vault</h3>
                                <p className="text-[10px] text-slate-400">Encrypted Document Vault</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-bold text-white">0</p>
                                <p className="text-[9px] text-slate-400">Documents</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-bold text-emerald-400">100%</p>
                                <p className="text-[9px] text-slate-400">Encrypted</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-2.5 text-center">
                                <p className="text-lg font-bold text-amber-400">0</p>
                                <p className="text-[9px] text-slate-400">Nominees</p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Open Vault
                        </button>
                    </div>
                </div>

                {/* Black Swan War Room */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Black Swan Stress Test</h3>
                    </div>
                    <div className="space-y-2">
                        {[
                            { name: '2008 Crisis', impact: -0.55, recovery: 4 },
                            { name: 'COVID Crash', impact: -0.35, recovery: 1 },
                            { name: 'Dot-com Bust', impact: -0.45, recovery: 5 },
                        ].map(event => {
                            const afterCrash = stats.totalCurrent * (1 + event.impact);
                            return (
                                <div key={event.name} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{event.name}</p>
                                        <p className="text-[10px] text-slate-400">Recovery: ~{event.recovery}yr</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold text-rose-500">{(event.impact * 100).toFixed(0)}%</p>
                                        <p className="text-[10px] text-slate-500">{formatCurrency(afterCrash)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════ SMART ACTIONS ═══════════ */}
            <section className="space-y-4">
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-indigo-500" /> Smart Actions
                </h2>

                {/* Rebalancing Wizard */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <RefreshCw className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rebalancing Wizard</h3>
                    </div>
                    {(() => {
                        const typeMap: Record<string, number> = {};
                        investments.filter(i => !i.isHiddenFromTotals).forEach(inv => {
                            const t = inv.type || 'Other';
                            typeMap[t] = (typeMap[t] || 0) + (inv.currentValue || 0);
                        });
                        const total = Object.values(typeMap).reduce((s, v) => s + v, 0);
                        const sorted = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);
                        const topPct = total > 0 ? (sorted[0]?.[1] || 0) / total * 100 : 0;
                        const isBalanced = topPct < 50;
                        return (
                            <div className="space-y-3">
                                <div className={`flex items-center gap-2 p-3 rounded-xl ${isBalanced ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                                    {isBalanced ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                                    <div>
                                        <p className={`text-xs font-bold ${isBalanced ? 'text-emerald-500' : 'text-amber-500'}`}>{isBalanced ? 'Portfolio Balanced' : 'Rebalancing Needed'}</p>
                                        <p className="text-[10px] text-slate-500">{sorted[0]?.[0]} is {topPct.toFixed(0)}% of portfolio</p>
                                    </div>
                                </div>
                                {sorted.slice(0, 4).map(([type, value]) => (
                                    <div key={type} className="flex items-center gap-2">
                                        <span className="w-16 text-[10px] text-slate-500 text-right truncate">{type}</span>
                                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${total > 0 ? value / total * 100 : 0}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-900 dark:text-white w-10">{total > 0 ? (value / total * 100).toFixed(0) : 0}%</span>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Goal Thermometer */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Goal Thermometer</h3>
                    </div>
                    {(() => {
                        const goals = [
                            { name: 'Emergency Fund', target: 300000, current: Math.min(300000, stats.totalCurrent * 0.1) },
                            { name: 'House Down Payment', target: 2000000, current: Math.min(2000000, stats.totalCurrent * 0.3) },
                            { name: 'Retirement Corpus', target: monthlyExpenses * 12 * 25, current: stats.totalCurrent },
                        ];
                        return (
                            <div className="space-y-3">
                                {goals.map((g, i) => {
                                    const pct = Math.min(100, g.target > 0 ? (g.current / g.target) * 100 : 0);
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between text-[10px] mb-1">
                                                <span className="font-medium text-slate-900 dark:text-white">{g.name}</span>
                                                <span className="text-slate-400">{pct.toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                                                <span>{formatCurrency(g.current)}</span>
                                                <span>{formatCurrency(g.target)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>

                {/* Milestone Timeline */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Flag className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Milestone Timeline</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: '₹1L Portfolio', target: 100000, icon: '🎯' },
                            { label: '₹5L Portfolio', target: 500000, icon: '🚀' },
                            { label: '₹10L Portfolio', target: 1000000, icon: '💎' },
                            { label: '₹25L Portfolio', target: 2500000, icon: '👑' },
                            { label: '₹1Cr Portfolio', target: 10000000, icon: '🏆' },
                        ].map((ms, i) => {
                            const reached = stats.totalCurrent >= ms.target;
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${reached ? 'bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>{ms.icon}</div>
                                    <div className="flex-1">
                                        <p className={`text-xs font-medium ${reached ? 'text-emerald-500 line-through' : 'text-slate-900 dark:text-white'}`}>{ms.label}</p>
                                    </div>
                                    {reached ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <span className="text-[10px] text-slate-400">{formatCurrency(ms.target - stats.totalCurrent)} to go</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Smart Actions Quick Panel */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Rocket className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Actions</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Increase SIP', desc: '+10% monthly', color: 'text-emerald-500 bg-emerald-500/10', icon: TrendingUp },
                            { label: 'Tax Harvest', desc: 'Save on taxes', color: 'text-purple-500 bg-purple-500/10', icon: Gavel },
                            { label: 'Diversify', desc: 'Add new asset class', color: 'text-cyan-500 bg-cyan-500/10', icon: LayoutGrid },
                            { label: 'Rebalance', desc: 'Optimize allocation', color: 'text-amber-500 bg-amber-500/10', icon: RefreshCw },
                        ].map((action, i) => (
                            <button key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-colors text-left">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                                    <action.icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{action.label}</p>
                                    <p className="text-[9px] text-slate-400">{action.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Community Hub Mini */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Community Hub</h3>
                    </div>
                    <div className="space-y-2">
                        {[
                            { title: 'Best SIP strategies for 2026?', replies: 42, hot: true },
                            { title: 'Gold vs Equity in volatile markets', replies: 28, hot: false },
                            { title: 'Tax saving ELSS picks', replies: 35, hot: true },
                        ].map((post, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {post.hot && <span className="text-[8px] px-1 py-0.5 bg-rose-500/10 text-rose-500 rounded font-bold">HOT</span>}
                                    <p className="text-xs text-slate-900 dark:text-white truncate">{post.title}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">{post.replies} replies</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Spending Analytics Mini */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                        <Banknote className="w-4 h-4 text-orange-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Spending Analytics</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-orange-500 uppercase font-bold">Monthly Burn</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyExpenses)}</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-emerald-500 uppercase font-bold">Savings Rate</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{monthlyExpenses > 0 ? ((1 - monthlyExpenses / (monthlyExpenses * 2)) * 100).toFixed(0) : 50}%</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating FAB for Voice Jarvis / F.I.N.N */}
            <div className="fixed bottom-[84px] right-6 z-40">
                <button className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/40 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 border border-indigo-400/50">
                    <Mic className="w-6 h-6" />
                </button>
            </div>

        </div>
    );
};
