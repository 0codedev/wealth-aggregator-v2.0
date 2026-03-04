import React, { useState, useEffect, useCallback } from 'react';
import {
    Globe, RefreshCw, TrendingUp, TrendingDown,
    Activity, DollarSign, Droplets, Zap,
    BarChart3, Gauge, Calendar, Clock, Loader2,
    Coins, Scale
} from 'lucide-react';
import { useMarketSentiment } from '../../../hooks/useMarketSentiment';
import { marketDataService } from '../../../services/MarketDataService';

// --- Same data structures as desktop MacroPulse ---
const INITIAL_MACRO_INDICATORS = [
    { id: 'vix', name: 'India VIX', label: 'Fear Index', value: 13.5, change: -2.4, unit: '', icon: Activity, color: '#f59e0b' },
    { id: 'usdinr', name: 'USD/INR', label: 'Currency', value: 84.12, change: 0.12, unit: '₹', icon: DollarSign, color: '#10b981' },
    { id: 'crude', name: 'Brent Crude', label: 'Inflation', value: 78.45, change: -0.5, unit: '$', icon: Droplets, color: '#ef4444' },
    { id: 'us10y', name: 'US 10Y Yield', label: 'Liquidity', value: 4.42, change: 0.05, unit: '%', icon: Zap, color: '#6366f1' },
    { id: 'gold', name: 'Gold (USD)', label: 'Safe Haven', value: 2150.80, change: 0.8, unit: '$', icon: Coins, color: '#eab308' },
    { id: 'dxy', name: 'Dollar Index', label: 'USD Strength', value: 103.8, change: -0.1, unit: '', icon: Scale, color: '#64748b' },
];

const INITIAL_GLOBAL_INDICES = [
    { name: 'S&P 500', value: 5120.50, change: 1.2 },
    { name: 'NASDAQ', value: 16250.25, change: 1.8 },
    { name: 'FTSE 100', value: 7710.10, change: -0.4 },
    { name: 'NIKKEI 225', value: 39500.00, change: 2.1 },
    { name: 'GIFT NIFTY', value: 22450.50, change: 0.5 },
    { name: 'BITCOIN', value: 64200.00, change: 5.2 },
];

const FII_DII_DATA = [
    { date: 'Dec 05', fii: -1250, dii: 1850 },
    { date: 'Dec 04', fii: -890, dii: 1420 },
    { date: 'Dec 03', fii: 520, dii: 780 },
    { date: 'Dec 02', fii: -1580, dii: 2100 },
    { date: 'Nov 29', fii: -2100, dii: 1950 },
];

const ECONOMIC_CALENDAR = [
    { event: 'Fed Interest Rate Decision', date: 'Dec 18', impact: 'HIGH' as const, forecast: '4.75%' },
    { event: 'India CPI Inflation', date: 'Dec 12', impact: 'HIGH' as const, forecast: '4.80%' },
    { event: 'US Non-Farm Payrolls', date: 'Dec 06', impact: 'MEDIUM' as const, forecast: '180K' },
];

const SECTOR_HEATMAP_DATA = [
    { name: 'IT', value: 2.5 }, { name: 'Pharma', value: 1.8 }, { name: 'Auto', value: 0.5 },
    { name: 'Banks', value: -0.8 }, { name: 'Metals', value: -1.2 }, { name: 'Realty', value: 1.5 },
];

const EARNINGS_CALENDAR = [
    { company: 'TCS', sector: 'IT', estimate: '₹62.5', date: 'Dec 09' },
    { company: 'Infosys', sector: 'IT', estimate: '₹18.2', date: 'Dec 11' },
    { company: 'HDFC Bank', sector: 'Banking', estimate: '₹21.5', date: 'Dec 15' },
    { company: 'Reliance', sector: 'Energy', estimate: '₹42.5', date: 'Dec 18' },
];

export const MobileMarketIntel: React.FC = () => {
    const { vix, status: marketStatus } = useMarketSentiment();
    const [macroIndicators, setMacroIndicators] = useState(INITIAL_MACRO_INDICATORS);
    const [globalIndices, setGlobalIndices] = useState(INITIAL_GLOBAL_INDICES);
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    // Fetch live data from marketDataService (same as desktop MacroPulse)
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { macro, global } = await marketDataService.fetchMacroAndGlobal();
            setMacroIndicators(prev => prev.map(p => {
                const fetched = macro.find((m: any) => m.id === p.id);
                return fetched ? { ...p, value: fetched.value, change: fetched.change } : p;
            }));
            setGlobalIndices(prev => prev.map(p => {
                const mapId = p.name === 'S&P 500' ? 'sp500' : p.name === 'NASDAQ' ? 'nasdaq' :
                    p.name === 'FTSE 100' ? 'ftse' : p.name === 'NIKKEI 225' ? 'nikkei' :
                        p.name === 'BITCOIN' ? 'btc' : '';
                const found = global.find((g: any) => g.id === mapId);
                return found ? { ...p, value: found.value, change: found.change } : p;
            }));
            setLastRefresh(new Date());
        } catch (err) {
            console.error('MobileMarketIntel: Data load failed', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Live noise animation (same as desktop)
    useEffect(() => {
        const interval = setInterval(() => {
            setGlobalIndices(prev => prev.map(idx => {
                const noise = (Math.random() - 0.5) * (idx.value * 0.0005);
                return { ...idx, value: idx.value + noise };
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Update VIX from market sentiment hook
    useEffect(() => {
        if (vix > 0) {
            setMacroIndicators(prev => prev.map(p =>
                p.id === 'vix' ? { ...p, value: vix } : p
            ));
        }
    }, [vix]);

    const getVixStatus = () => {
        if (vix < 15) return { label: 'Calm', color: 'text-emerald-500', bg: 'bg-emerald-500' };
        if (vix > 20) return { label: 'Fear', color: 'text-rose-500', bg: 'bg-rose-500' };
        return { label: 'Neutral', color: 'text-amber-500', bg: 'bg-amber-500' };
    };

    const vixStatus = getVixStatus();

    // Compute 5-day FII/DII net
    const fiiNet = FII_DII_DATA.reduce((sum, d) => sum + d.fii, 0);
    const diiNet = FII_DII_DATA.reduce((sum, d) => sum + d.dii, 0);

    return (
        <div className="pb-24">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: marquee 30s linear infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="text-indigo-500 w-6 h-6" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Market Intel</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {lastRefresh ? `Updated: ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {isLoading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </header>

            {/* Global Indices Marquee - LIVE */}
            <div className="bg-white dark:bg-[#151e32] border-b border-slate-200 dark:border-slate-800 overflow-hidden py-2 whitespace-nowrap relative">
                <div className="inline-flex animate-marquee gap-6 items-center">
                    {[...globalIndices, ...globalIndices].map((idx, i) => (
                        <span key={i} className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {idx.name}{' '}
                            <span className="text-slate-900 dark:text-white ml-1">
                                {idx.name === 'BITCOIN' ? '$' : ''}{idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>{' '}
                            <span className={idx.change >= 0 ? 'text-emerald-500 ml-1' : 'text-rose-500 ml-1'}>
                                {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}%
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            <main className="p-4 space-y-4">
                {/* Section Title */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className="text-indigo-500 w-5 h-5" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Macro Pulse</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Global economic indicators and their impact on your portfolio.</p>
                </div>

                {/* Horizontal Scroll Metrics - LIVE from macroIndicators */}
                <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4 snap-x">
                    {macroIndicators.map(indicator => (
                        <div key={indicator.id} className="snap-start shrink-0 w-36 bg-white dark:bg-[#151e32] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                <indicator.icon className="w-8 h-8" />
                            </div>
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{indicator.label}</span>
                                <span className={`text-[10px] flex items-center px-1 rounded ${indicator.change >= 0 ? 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' : 'text-rose-500 bg-rose-100 dark:bg-rose-900/30'}`}>
                                    {indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(2)}%
                                </span>
                            </div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white relative z-10">
                                {indicator.unit}{indicator.value.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 relative z-10">{indicator.name}</div>
                        </div>
                    ))}
                </div>

                {/* VIX Trend Chart */}
                <div className="bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="text-amber-500 w-5 h-5" />
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">India VIX Trend</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wide">Current Level</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{vix.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="relative h-40 w-full overflow-hidden">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 100">
                            <defs>
                                <linearGradient id="chartGradientMobile" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path d="M0,70 Q30,50 50,60 T100,40 T150,55 T200,45 T250,50 T300,75 L300,100 L0,100 Z" fill="url(#chartGradientMobile)" />
                            <path d="M0,70 Q30,50 50,60 T100,40 T150,55 T200,45 T250,50 T300,75" fill="none" stroke="#F59E0B" strokeWidth="2" />
                        </svg>
                        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[8px] text-slate-400 py-1 font-mono">
                            <span>{(vix + 1.3).toFixed(1)}</span>
                            <span>{(vix + 0.9).toFixed(1)}</span>
                            <span>{(vix + 0.5).toFixed(1)}</span>
                            <span>{(vix + 0.1).toFixed(1)}</span>
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">Market volatility expectation. &lt; 15 is calm, &gt; 20 is fearful.</p>
                </div>

                {/* Economic Calendar */}
                <div className="bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-indigo-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Economic Calendar</h3>
                    </div>
                    <div className="space-y-4">
                        {ECONOMIC_CALENDAR.map((event, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-center h-min min-w-[3rem]">
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{event.date.split(' ')[0]}</div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{event.date.split(' ')[1]}</div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{event.event}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${event.impact === 'HIGH' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'}`}>
                                            {event.impact}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Fcst: {event.forecast}</span>
                                    </div>
                                </div>
                                <Clock className="text-slate-400 w-4 h-4 mt-0.5" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sector Heatmap & Fear/Greed */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm col-span-2 sm:col-span-1">
                        <div className="flex items-center gap-2 mb-3">
                            <BarChart3 className="text-emerald-500 w-5 h-5" />
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Sector Heatmap</h3>
                        </div>
                        <div className="space-y-2 text-[10px]">
                            {SECTOR_HEATMAP_DATA.map(sector => (
                                <div key={sector.name} className="flex items-center gap-2">
                                    <span className="w-10 text-right text-slate-500 dark:text-slate-400">{sector.name}</span>
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                        <div
                                            className={`h-full rounded-full ${sector.value >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                            style={{ width: `${Math.min(100, Math.abs(sector.value) * 32)}%` }}
                                        />
                                    </div>
                                    <span className={`w-8 text-right font-bold ${sector.value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {sector.value >= 0 ? '+' : ''}{sector.value}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fear & Greed Dial */}
                    <div className="bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-2 w-full">
                            <Gauge className="text-orange-500 w-5 h-5" />
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Fear & Greed</h3>
                        </div>
                        <div className="relative w-32 h-16 mt-2">
                            <div className="w-32 h-16 rounded-t-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 opacity-80" />
                            <div
                                className="absolute bottom-0 left-1/2 w-1 h-14 bg-slate-800 dark:bg-white origin-bottom rounded-full border border-white dark:border-slate-900 z-10"
                                style={{ transform: `translateX(-50%) rotate(${(42 / 100) * 180 - 90}deg)` }}
                            />
                            <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-slate-800 dark:bg-white rounded-full transform -translate-x-1/2 translate-y-1/2 z-20 border-2 border-slate-200 dark:border-slate-800" />
                        </div>
                        <div className="text-center mt-4">
                            <div className={`text-2xl font-bold ${vixStatus.color}`}>42</div>
                            <div className={`text-xs font-semibold uppercase tracking-wider ${vixStatus.color}`}>Fear</div>
                        </div>
                    </div>
                </div>

                {/* FII/DII Activity - LIVE DATA */}
                <div className="bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-indigo-500 w-5 h-5" />
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">FII/DII Activity (₹ Cr)</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                    <th className="text-left font-normal pb-2">Date</th>
                                    <th className="font-normal pb-2">FII</th>
                                    <th className="font-normal pb-2">DII</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-medium">
                                {FII_DII_DATA.map((day, idx) => (
                                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50">
                                        <td className="text-left py-2 text-slate-600 dark:text-slate-300">{day.date}</td>
                                        <td className={`py-2 ${day.fii >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {day.fii >= 0 ? '+' : ''}{day.fii.toLocaleString()}
                                        </td>
                                        <td className={`py-2 ${day.dii >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            +{day.dii.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="text-left py-2 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wide">5-Day Net</td>
                                    <td className={`py-2 font-bold ${fiiNet >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{fiiNet.toLocaleString()} Cr</td>
                                    <td className="py-2 text-emerald-500 font-bold">+{diiNet.toLocaleString()} Cr</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Earnings Calendar */}
                <div className="bg-white dark:bg-[#151e32] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm mb-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="text-purple-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Earnings Calendar</h3>
                    </div>
                    <div className="space-y-3">
                        {EARNINGS_CALENDAR.map((earning, idx) => (
                            <div key={idx} className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0 last:pb-0">
                                <div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{earning.company}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{earning.sector}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">{earning.estimate}</div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{earning.date}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fear & Greed Gauge */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Gauge className="text-amber-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Fear & Greed Index</h3>
                    </div>
                    {(() => {
                        const fgValue = vix < 15 ? 75 : vix < 20 ? 55 : vix < 25 ? 40 : vix < 30 ? 25 : 15;
                        const fgLabel = fgValue >= 75 ? 'Extreme Greed' : fgValue >= 55 ? 'Greed' : fgValue >= 40 ? 'Neutral' : fgValue >= 25 ? 'Fear' : 'Extreme Fear';
                        const fgColor = fgValue >= 75 ? 'text-emerald-500' : fgValue >= 55 ? 'text-green-500' : fgValue >= 40 ? 'text-amber-500' : fgValue >= 25 ? 'text-orange-500' : 'text-rose-500';
                        const fgBg = fgValue >= 75 ? 'from-emerald-500' : fgValue >= 55 ? 'from-green-500' : fgValue >= 40 ? 'from-amber-500' : fgValue >= 25 ? 'from-orange-500' : 'from-rose-500';
                        return (
                            <div className="text-center space-y-3">
                                <div className="relative w-32 h-32 mx-auto">
                                    <svg viewBox="0 0 100 50" className="w-full">
                                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-800" />
                                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8"
                                            className={fgColor} strokeDasharray={`${fgValue * 1.26} 126`} strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                                        <span className={`text-2xl font-black ${fgColor}`}>{fgValue}</span>
                                    </div>
                                </div>
                                <p className={`text-sm font-bold ${fgColor}`}>{fgLabel}</p>
                                <p className="text-[10px] text-slate-400">Based on VIX: {vix.toFixed(1)}</p>
                            </div>
                        );
                    })()}
                </div>

                {/* FII/DII Flow */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="text-indigo-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">FII / DII Flow</h3>
                    </div>
                    <div className="space-y-2">
                        {[
                            { date: 'Feb 25', fii: -1250, dii: 1850 },
                            { date: 'Feb 24', fii: -890, dii: 1420 },
                            { date: 'Feb 21', fii: 520, dii: 780 },
                            { date: 'Feb 20', fii: -1580, dii: 2100 },
                            { date: 'Feb 19', fii: 340, dii: -120 },
                        ].map((d, i) => {
                            const net = d.fii + d.dii;
                            return (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <span className="text-[10px] text-slate-500 w-12 font-mono">{d.date}</span>
                                    <div className="flex gap-3">
                                        <span className={`text-[10px] font-bold ${d.fii >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>FII: {d.fii >= 0 ? '+' : ''}{d.fii}Cr</span>
                                        <span className={`text-[10px] font-bold ${d.dii >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>DII: {d.dii >= 0 ? '+' : ''}{d.dii}Cr</span>
                                    </div>
                                    <span className={`text-[10px] font-bold ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Net: {net >= 0 ? '+' : ''}{net}Cr</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Economic Calendar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="text-cyan-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Economic Calendar</h3>
                    </div>
                    <div className="space-y-2">
                        {[
                            { event: 'RBI Policy Decision', date: 'Feb 28', impact: 'High', type: '🏦' },
                            { event: 'GDP Data Release', date: 'Feb 28', impact: 'High', type: '📊' },
                            { event: 'PMI Manufacturing', date: 'Mar 01', impact: 'Medium', type: '🏭' },
                            { event: 'Auto Sales Data', date: 'Mar 01', impact: 'Medium', type: '🚗' },
                            { event: 'US Jobs Report', date: 'Mar 07', impact: 'High', type: '🇺🇸' },
                            { event: 'CPI Inflation', date: 'Mar 12', impact: 'High', type: '📈' },
                        ].map((ev, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <span className="text-lg">{ev.type}</span>
                                <div className="flex-1">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{ev.event}</p>
                                    <p className="text-[10px] text-slate-400 font-mono">{ev.date}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ev.impact === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>{ev.impact}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-6" />
            </main>
        </div>
    );
};
