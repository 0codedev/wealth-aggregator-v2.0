import React, { useState, useMemo } from 'react';
import {
    Radar, PersonStanding, BarChart3, Scissors,
    TrendingUp, TrendingDown, Clock, Info, Zap,
    ArrowRight, AlertTriangle, FileText
} from 'lucide-react';
import { usePortfolioStore } from '../../../store/portfolioStore';

// Mock insider trades data (same pattern as desktop AlphaPredator)
const INSIDER_DATA = [
    { company: 'RELIANCE', insider: 'Mukesh Ambani', role: 'Promoter', type: 'BUY' as const, value: 122500000, mode: 'Open Market', time: '2 mins ago' },
    { company: 'TATASTEEL', insider: 'N. Chandrasekaran', role: 'Director', type: 'BUY' as const, value: 1680000, mode: 'Open Market', time: '15 mins ago' },
    { company: 'INFY', insider: 'Salil Parekh', role: 'CEO', type: 'SELL' as const, value: 7250000, mode: 'ESOP', time: '1 hr ago' },
];

const BULK_DEALS = [
    { company: 'ZOMATO', buyer: 'Tiger Global', type: 'SELL' as const, value: 877500000, price: 58.5, change: -1.2 },
    { company: 'PAYTM', buyer: 'Softbank Vision Fund', type: 'SELL' as const, value: 17000000, price: 850, change: -4.5 },
    { company: 'SUZLON', buyer: 'SBI Mutual Fund', type: 'BUY' as const, value: 450000000, price: 18.2, change: 8.5 },
];

const formatINR = (value: number): string => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
};

export const MobileAlpha: React.FC = () => {
    const { investments } = usePortfolioStore();
    const [activeSection, setActiveSection] = useState<'insider' | 'bulk' | 'tax'>('insider');

    // Tax Harvesting — compute from real investments
    const taxHarvestingData = useMemo(() => {
        const lossMakers = investments
            .filter(inv => !inv.isHiddenFromTotals && (inv.currentValue || 0) < (inv.investedAmount || 0))
            .map(inv => ({
                name: inv.name,
                invested: inv.investedAmount || 0,
                current: inv.currentValue || 0,
                loss: (inv.currentValue || 0) - (inv.investedAmount || 0),
                lossPct: ((((inv.currentValue || 0) - (inv.investedAmount || 0)) / (inv.investedAmount || 1)) * 100),
            }))
            .sort((a, b) => a.loss - b.loss); // Worst first

        const totalLoss = lossMakers.reduce((sum, inv) => sum + Math.abs(inv.loss), 0);
        const taxSavings = totalLoss * 0.15; // 15% STCG rate

        return { lossMakers, totalLoss, taxSavings };
    }, [investments]);

    const sections = [
        { id: 'insider' as const, label: 'Insider Radar', active: true },
        { id: 'bulk' as const, label: 'Bulk Deal Scanner' },
        { id: 'tax' as const, label: 'Tax Harvester' },
    ];

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Radar className="text-indigo-500 w-6 h-6" />
                        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                            Alpha Predator <span className="text-indigo-500">Engine</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-emerald-500 tracking-wide">ONLINE</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time surveillance of market anomalies.</p>
            </header>

            {/* Nav Pills */}
            <nav className="sticky top-[85px] z-40 bg-white dark:bg-slate-950 pt-4 pb-2 px-4 overflow-x-auto no-scrollbar flex gap-3">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${activeSection === section.id
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        {section.label}
                    </button>
                ))}
            </nav>

            <main className="px-4 space-y-6 mt-4">
                {/* Insider Radar Section */}
                {activeSection === 'insider' && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-semibold flex items-center gap-2">
                                <PersonStanding className="text-indigo-500 w-5 h-5" />
                                Insider Radar
                            </h2>
                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Tracking Promoter Activity</span>
                        </div>
                        <div className="space-y-3">
                            {INSIDER_DATA.map((trade, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110" />
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{trade.company}</h3>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                                    {trade.type}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{trade.insider} <span className="opacity-50">• {trade.role}</span></p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {trade.time}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-slate-100 dark:border-slate-700 pt-3 mt-1">
                                        <div>
                                            <span className="text-[10px] uppercase text-slate-400 tracking-wider">Transaction Value</span>
                                            <div className="font-mono font-semibold text-lg text-slate-900 dark:text-white">{formatINR(trade.value)}</div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-slate-400">Mode</span>
                                            <div className="text-xs font-medium text-slate-900 dark:text-white">{trade.mode}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Bulk Deal Scanner Section */}
                {activeSection === 'bulk' && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-semibold flex items-center gap-2">
                                <BarChart3 className="text-amber-500 w-5 h-5" />
                                Bulk Deal Scanner
                            </h2>
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">Smart Money</span>
                        </div>
                        <div className="space-y-3">
                            {BULK_DEALS.map((deal, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{deal.company}</h3>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${deal.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                    {deal.change >= 0 ? '+' : ''}{deal.change}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{deal.buyer}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[10px] font-bold mb-0.5 ${deal.type === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>{deal.type}</div>
                                            <div className="font-mono font-semibold text-base text-slate-900 dark:text-white">{formatINR(deal.value)}</div>
                                            <div className="text-[10px] text-slate-400">@ ₹{deal.price} / share</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tax Harvester Section — LIVE from portfolio */}
                {activeSection === 'tax' && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-semibold flex items-center gap-2">
                                <Scissors className="text-rose-500 w-5 h-5" />
                                Tax Harvester
                            </h2>
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded uppercase tracking-wider">FY End Optimizer</span>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white relative shadow-lg overflow-hidden border border-slate-700/50 mb-4">
                            <Scissors className="absolute -right-4 -top-4 w-24 h-24 text-white/5 rotate-12" />
                            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 mb-1">Harvestable Loss</p>
                                    <p className="text-2xl font-bold font-mono text-rose-400">{formatINR(taxHarvestingData.totalLoss)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 mb-1">Tax Savings (Est)</p>
                                    <p className="text-2xl font-bold font-mono text-emerald-400">{formatINR(taxHarvestingData.taxSavings)}</p>
                                </div>
                            </div>

                            {/* Loss-making investments from portfolio */}
                            <div className="space-y-3 relative z-10">
                                {taxHarvestingData.lossMakers.length === 0 ? (
                                    <div className="text-center py-6">
                                        <TrendingUp className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">No loss-making investments found. Your portfolio is fully green!</p>
                                    </div>
                                ) : (
                                    taxHarvestingData.lossMakers.slice(0, 5).map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-white/10">
                                            <div>
                                                <span className="block font-medium">{item.name}</span>
                                                <span className="text-[10px] text-slate-400">Invested: {formatINR(item.invested)}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-rose-400 font-mono">{formatINR(item.loss)}</span>
                                                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1 rounded">{item.lossPct.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {taxHarvestingData.lossMakers.length > 0 && (
                                <button className="w-full mt-6 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2 transition-colors relative z-10 active:scale-95">
                                    <Scissors className="w-4 h-4" />
                                    Generate Harvesting Report
                                </button>
                            )}
                        </div>
                    </section>
                )}

                {/* AI Insight Banner */}
                <div className="bg-amber-900/90 dark:bg-amber-900/40 backdrop-blur-md border border-amber-700/50 p-3 rounded-lg shadow-xl flex items-start gap-3">
                    <div className="bg-amber-500/20 p-1.5 rounded-full shrink-0 mt-0.5">
                        <Zap className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-amber-500 font-bold mb-0.5">AI Insight</p>
                        <p className="text-xs text-amber-100 leading-relaxed">
                            Institutional Buying in <strong className="text-white">SUZLON</strong> correlates with the recent breakout. Watch for a retest of 18.0 levels.
                        </p>
                    </div>
                </div>
                {/* Paper Trading Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="text-indigo-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Paper Trading</h3>
                        <span className="ml-auto text-[9px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">VIRTUAL</span>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 mb-3 border border-indigo-500/20">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Virtual Balance</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">₹10,00,000</p>
                        <p className="text-[10px] text-emerald-500 font-bold">+₹0 (0.0%) P&L</p>
                    </div>
                    <div className="space-y-2 mb-3">
                        {[
                            { stock: 'RELIANCE', qty: 10, buy: 2450, now: 2520, pnl: 700 },
                            { stock: 'TCS', qty: 5, buy: 3800, now: 3750, pnl: -250 },
                        ].map((pos, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{pos.stock}</p>
                                    <p className="text-[10px] text-slate-400">{pos.qty} shares @ ₹{pos.buy}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-mono text-slate-900 dark:text-white">₹{pos.now}</p>
                                    <p className={`text-[10px] font-bold ${pos.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold">BUY</button>
                        <button className="py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold">SELL</button>
                    </div>
                </div>

                {/* Screener / Quick Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Radar className="text-cyan-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Quick Screener</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: '52W High', desc: 'Near all-time high', count: 12 },
                            { label: '52W Low', desc: 'Near yearly low', count: 8 },
                            { label: 'High Volume', desc: 'Unusual volume spike', count: 5 },
                            { label: 'Breakout', desc: 'Resistance broken', count: 3 },
                        ].map((filter, i) => (
                            <button key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-left hover:border-indigo-500/30 transition-colors">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{filter.label}</p>
                                <p className="text-[9px] text-slate-400">{filter.desc}</p>
                                <p className="text-[10px] text-indigo-500 font-bold mt-1">{filter.count} stocks</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-6" />
            </main>
        </div>
    );
};
