import React, { useState, useMemo, useEffect } from 'react';
import {
    Zap, Sparkles, Flame, Shield, Search,
    TrendingDown, TrendingUp, Info, Calculator,
    BarChart3, ArrowRight, CheckCircle2, XCircle, Scale
} from 'lucide-react';
import { usePortfolioStore } from '../../../store/portfolioStore';

// Same presets as desktop IPOWarRoom
const IPO_PRESETS = [
    { name: 'NTPC Green', fresh: 100, promoter: 85, litigation: 2, pe: 45, gmp: 8, sub: 2.5, qib: 3.2, nii: 4.5, retail: 1.8 },
    { name: 'Swiggy', fresh: 45, promoter: 0, litigation: 12, pe: -1, gmp: 2, sub: 1.1, qib: 1.5, nii: 0.8, retail: 0.9 },
    { name: 'Hyundai India', fresh: 0, promoter: 100, litigation: 5, pe: 26, gmp: 5, sub: 2.3, qib: 6.9, nii: 0.6, retail: 0.5 },
    { name: 'Zomato (Hist)', fresh: 100, promoter: 0, litigation: 1, pe: -1, gmp: 55, sub: 40, qib: 52, nii: 35, retail: 8 },
];

export const MobileIPO: React.FC = () => {
    // 7-Point Scan State
    const [freshIssue, setFreshIssue] = useState<number | ''>('');
    const [promoterHolding, setPromoterHolding] = useState<number | ''>('');
    const [litigationCount, setLitigationCount] = useState<number | ''>('');
    const [peRatio, setPeRatio] = useState<number | ''>('');
    const [currentGmp, setCurrentGmp] = useState<number | ''>('');

    // Demand Heatmap
    const [qibSub, setQibSub] = useState<number | ''>('');
    const [niiSub, setNiiSub] = useState<number | ''>('');
    const [retailSub, setRetailSub] = useState<number | ''>('');

    // Probability Engine
    const [applications, setApplications] = useState(1);

    // Listing Strategy
    const [stratIssuePrice, setStratIssuePrice] = useState<number | ''>('');
    const [stratListPrice, setStratListPrice] = useState<number | ''>('');

    // Shareholder Quota
    const [isParentShareholder, setIsParentShareholder] = useState(false);

    // Apply preset
    const applyPreset = (preset: typeof IPO_PRESETS[0]) => {
        setFreshIssue(preset.fresh);
        setPromoterHolding(preset.promoter);
        setLitigationCount(preset.litigation);
        setPeRatio(preset.pe);
        setCurrentGmp(preset.gmp);
        setQibSub(preset.qib);
        setNiiSub(preset.nii);
        setRetailSub(preset.retail);
    };

    // Trust Score Calculation (same logic as desktop)
    const trustScore = useMemo(() => {
        let score = 0;
        let count = 0;
        if (freshIssue !== '') { score += Number(freshIssue) >= 50 ? 15 : 5; count++; }
        if (promoterHolding !== '') { score += Number(promoterHolding) >= 50 ? 20 : Number(promoterHolding) >= 25 ? 10 : 0; count++; }
        if (litigationCount !== '') { score += Number(litigationCount) <= 3 ? 15 : Number(litigationCount) <= 8 ? 8 : 0; count++; }
        if (peRatio !== '') { score += Number(peRatio) > 0 && Number(peRatio) <= 30 ? 15 : Number(peRatio) <= 50 ? 10 : 5; count++; }
        if (currentGmp !== '') { score += Number(currentGmp) >= 50 ? 20 : Number(currentGmp) >= 20 ? 12 : Number(currentGmp) >= 5 ? 6 : 0; count++; }
        if (retailSub !== '') { score += Number(retailSub) >= 5 ? 15 : Number(retailSub) >= 2 ? 10 : Number(retailSub) >= 1 ? 5 : 0; count++; }
        return count > 0 ? Math.min(100, score) : 0;
    }, [freshIssue, promoterHolding, litigationCount, peRatio, currentGmp, retailSub]);

    const trustLabel = trustScore >= 75 ? 'Strong Buy' : trustScore >= 50 ? 'Moderate' : trustScore >= 25 ? 'Caution' : 'Risky';
    const trustColor = trustScore >= 75 ? '#10b981' : trustScore >= 50 ? '#f59e0b' : trustScore >= 25 ? '#f97316' : '#ef4444';
    const trustMessage = trustScore >= 75 ? 'Institutional backing is strong. Favorable for retail.'
        : trustScore >= 50 ? 'Mixed signals. Watch GMP & subscription trends closely.'
            : trustScore >= 25 ? 'Institutions are cautious. Higher risk for retail investors.'
                : 'Institutions are avoiding this. Risky bet for retail.';

    // Allotment Probability
    const allotmentProb = useMemo(() => {
        const sub = Number(retailSub) || 0;
        if (sub <= 0) return { real: 100, theoretical: 100, lots: 0 };
        const base = (1 / sub) * 100;
        const real = Math.min(100, base * (applications >= 3 ? 1.5 : 1));
        return { real: Math.round(real), theoretical: Math.round(base), lots: Math.ceil(sub / applications) };
    }, [retailSub, applications]);

    // GMP Signal
    const gmpSignal = useMemo(() => {
        const gmp = Number(currentGmp) || 0;
        if (gmp >= 50) return { label: 'Very Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', width: '90%' };
        if (gmp >= 20) return { label: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', width: '70%' };
        if (gmp >= 5) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500', width: '45%' };
        if (gmp > 0) return { label: 'Weak', color: 'text-orange-500', bg: 'bg-orange-500', width: '25%' };
        return { label: 'Very Weak', color: 'text-rose-500', bg: 'bg-rose-500', width: '15%' };
    }, [currentGmp]);

    // Listing Strategy
    const listingStrategy = useMemo(() => {
        if (!stratIssuePrice || !stratListPrice) return null;
        const gain = Number(stratListPrice) - Number(stratIssuePrice);
        const gainPct = (gain / Number(stratIssuePrice)) * 100;
        if (gainPct < 0) return { title: 'CAPITAL PROTECTION', desc: 'Exit immediately to preserve capital.', color: 'text-rose-500 border-rose-500 bg-rose-50 dark:bg-rose-900/20', gainPct };
        if (gainPct < 10) return { title: 'STOP LOSS TIGHT', desc: 'Place SL at Issue Price. Exit if 5-min candle closes below.', color: 'text-amber-500 border-amber-500 bg-amber-50 dark:bg-amber-900/20', gainPct };
        if (gainPct < 40) return { title: 'BOOK & TRAIL', desc: 'Sell 50% to release capital. Trail rest with SL at Day Low.', color: 'text-indigo-500 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20', gainPct };
        return { title: 'RIDE THE WAVE', desc: 'Hold! Trail SL to Opening Price. Watch for Upper Circuit.', color: 'text-emerald-500 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20', gainPct };
    }, [stratIssuePrice, stratListPrice]);

    // Flipper's ROI
    const flipperROI = useMemo(() => {
        const gain = Number(currentGmp) || 0;
        const lockIn = 4;
        const annualized = gain > 0 ? ((gain / 100) * (365 / lockIn) * 100) : 0;
        return { annualized: annualized.toFixed(0), lockIn };
    }, [currentGmp]);

    // Input component for consistent styling
    const InputField = ({ label, value, onChange, placeholder, suffix }: { label: string; value: number | ''; onChange: (v: number | '') => void; placeholder?: string; suffix?: string }) => (
        <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5 block">{label}</label>
            <div className="relative">
                <input
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 dark:text-white placeholder-slate-400"
                    type="number"
                    value={value}
                    onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={placeholder}
                />
                {suffix && <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">{suffix}</span>}
            </div>
        </div>
    );

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">IPO War Room</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Forensic DRHP Analyzer</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-5">
                {/* Quick Load Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Quick Load:</span>
                    {IPO_PRESETS.map(preset => (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-transparent hover:border-slate-400 dark:hover:border-slate-600 transition-colors whitespace-nowrap active:scale-95"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-xs font-medium text-slate-900 dark:text-white">{preset.name}</span>
                        </button>
                    ))}
                </div>

                {/* Trust Score Gauge */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-sm">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-100 dark:text-slate-800" />
                            <circle cx="80" cy="80" r="70" fill="none" stroke={trustColor} strokeWidth="12" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 70}`}
                                strokeDashoffset={`${2 * Math.PI * 70 * (1 - trustScore / 100)}`}
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">{trustScore}</span>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-1">Trust Score</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1" style={{ color: trustColor }}>{trustLabel}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">{trustMessage}</p>
                    </div>
                </div>

                {/* Demand Heatmap */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="text-rose-500 w-5 h-5" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Demand Heatmap</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {[{ label: 'QIB (INST)', value: qibSub, set: setQibSub }, { label: 'NII (HNI)', value: niiSub, set: setNiiSub }, { label: 'RETAIL', value: retailSub, set: setRetailSub }].map(item => (
                            <div key={item.label} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 font-medium block mb-1">{item.label}</span>
                                <input
                                    type="number"
                                    value={item.value}
                                    onChange={e => item.set(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full text-lg font-bold bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
                                    placeholder="0.0"
                                />
                            </div>
                        ))}
                    </div>

                    {/* GMP Signal */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Grey Market Signal</span>
                            <div className={`flex items-center ${gmpSignal.color}`}>
                                {Number(currentGmp) >= 5 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                <span className="text-[10px] font-bold uppercase">{gmpSignal.label}</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mb-4 overflow-hidden">
                            <div className={`h-full ${gmpSignal.bg} rounded-full transition-all duration-500`} style={{ width: gmpSignal.width }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-500 block mb-1">GMP</span>
                                <span className={`text-lg font-bold ${Number(currentGmp) >= 20 ? 'text-emerald-500' : Number(currentGmp) > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                                    {currentGmp || 0}%
                                </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-500 block mb-1">Subscription</span>
                                <span className="text-lg font-bold text-indigo-500">{retailSub || 0}x</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Allotment Probability Engine */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Calculator className="text-indigo-500 w-5 h-5" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Allotment Probability Engine</h2>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4">Input the current subscription to see your true odds.</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <InputField label="Retail Subscription" value={retailSub} onChange={setRetailSub} placeholder="e.g. 50" suffix="X" />
                        <InputField label="Applications" value={applications} onChange={v => setApplications(Number(v) || 1)} suffix="Nos" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 relative overflow-hidden">
                            <Sparkles className="absolute -right-2 -top-2 w-10 h-10 text-emerald-500/10 rotate-12" />
                            <div className="flex items-center gap-1 mb-2">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Real Luck Score</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{allotmentProb.real}%</span>
                            <div className="h-1 w-full bg-emerald-900/20 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${allotmentProb.real}%` }} />
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Theoretical</span>
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{allotmentProb.theoretical}%</span>
                            <div className="h-1 w-full bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-slate-400 dark:bg-slate-500 rounded-full" style={{ width: `${allotmentProb.theoretical}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flipper's Matrix */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <ArrowRight className="text-indigo-500 w-5 h-5" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">The Flipper's Matrix</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">Lock-in</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{flipperROI.lockIn} days</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">Est. Gain</span>
                            <span className="text-sm font-bold text-emerald-500">₹{((Number(currentGmp) || 0) * 25).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-emerald-500/50 bg-emerald-900/5 dark:bg-emerald-900/10 p-3">
                            <span className="text-[10px] font-bold text-emerald-500 block mb-1">IPO STRATEGY</span>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{flipperROI.annualized}%</div>
                            <div className="text-[9px] text-emerald-500/70 uppercase font-bold">Annualized Return</div>
                        </div>
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">SWING ALT.</span>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(Number(flipperROI.annualized) * 0.15)}%</div>
                            <div className="text-[9px] text-slate-500 uppercase font-bold">Annualized Return</div>
                        </div>
                    </div>
                </div>

                {/* Listing Strategy */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Scale className="text-purple-500 w-5 h-5" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Listing Strategy</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <InputField label="Issue Price" value={stratIssuePrice} onChange={setStratIssuePrice} placeholder="₹" />
                        <InputField label="Open Price" value={stratListPrice} onChange={setStratListPrice} placeholder="₹" />
                    </div>
                    {listingStrategy ? (
                        <div className={`border rounded-lg p-4 ${listingStrategy.color}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {listingStrategy.gainPct >= 10 ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                <span className="text-sm font-bold">{listingStrategy.title}</span>
                            </div>
                            <p className="text-xs opacity-80">{listingStrategy.desc}</p>
                            <p className="text-lg font-bold mt-2">{listingStrategy.gainPct >= 0 ? '+' : ''}{listingStrategy.gainPct.toFixed(1)}%</p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                            <Scale className="text-slate-400 w-6 h-6 mb-2" />
                            <p className="text-xs text-slate-500">Enter prices to generate strategy</p>
                        </div>
                    )}
                </div>

                {/* 7-Point Scan */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Search className="text-indigo-500 w-5 h-5" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">The 7-Point Scan</h2>
                        </div>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded">Forensic Data</span>
                    </div>
                    <div className="space-y-4">
                        <InputField label="Fresh Issue % (vs OFS)" value={freshIssue} onChange={setFreshIssue} placeholder="e.g. 65" />
                        <div className="grid grid-cols-2 gap-3">
                            <InputField label="Promoter Holding %" value={promoterHolding} onChange={setPromoterHolding} />
                            <InputField label="Litigation Count" value={litigationCount} onChange={setLitigationCount} />
                        </div>
                        <InputField label="P/E Ratio (vs Sector)" value={peRatio} onChange={setPeRatio} />
                    </div>
                </div>

                {/* GMP Validator */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="text-emerald-500 w-5 h-5" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">GMP Validator</h2>
                    </div>
                    <div className="flex items-end gap-3 mb-4">
                        <div className="flex-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Current GMP %</label>
                            <input
                                type="number"
                                value={currentGmp}
                                onChange={e => setCurrentGmp(e.target.value === '' ? '' : Number(e.target.value))}
                                className="text-2xl font-bold bg-transparent outline-none text-slate-900 dark:text-white w-full"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase mb-1 block">Estimated Listing Gain</label>
                        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${gmpSignal.bg} rounded-full transition-all duration-500`} style={{ width: gmpSignal.width }} />
                        </div>
                    </div>
                </div>

                {/* Shareholder Quota */}
                <div className="bg-indigo-500 dark:bg-indigo-600 rounded-xl p-4 relative overflow-hidden text-white shadow-lg">
                    <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
                    <div className="flex items-center gap-2 mb-3 relative z-10">
                        <Shield className="w-5 h-5" />
                        <h2 className="text-sm font-bold">Shareholder Quota</h2>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer relative z-10">
                        <input
                            type="checkbox"
                            checked={isParentShareholder}
                            onChange={e => setIsParentShareholder(e.target.checked)}
                            className="h-5 w-5 cursor-pointer rounded border border-white/40 bg-white/10 accent-white"
                        />
                        <span className="text-xs font-medium text-white/90">Are you a shareholder of the Parent Co?</span>
                    </label>
                </div>
                {/* Listing Strategy */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="text-emerald-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Listing Strategy</h3>
                    </div>
                    {(() => {
                        const issueP = Number(stratIssuePrice) || 0;
                        const listP = Number(stratListPrice) || 0;
                        const gain = issueP > 0 ? ((listP - issueP) / issueP * 100) : 0;
                        const strategy = gain > 50 ? 'FLIP ON LISTING' : gain > 20 ? 'PARTIAL BOOK' : gain > 0 ? 'HOLD SHORT TERM' : 'AVOID / SELL';
                        const stratColor = gain > 50 ? 'text-emerald-500 bg-emerald-500/10' : gain > 20 ? 'text-indigo-500 bg-indigo-500/10' : gain > 0 ? 'text-amber-500 bg-amber-500/10' : 'text-rose-500 bg-rose-500/10';
                        return (
                            <div className="space-y-3">
                                {issueP > 0 && listP > 0 ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-2.5 text-center border border-slate-200 dark:border-slate-800">
                                                <p className="text-[9px] text-slate-500 uppercase font-bold">Issue</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">₹{issueP}</p>
                                            </div>
                                            <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-2.5 text-center border border-slate-200 dark:border-slate-800">
                                                <p className="text-[9px] text-slate-500 uppercase font-bold">Expected</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">₹{listP}</p>
                                            </div>
                                            <div className={`rounded-xl p-2.5 text-center border ${stratColor.includes('emerald') ? 'border-emerald-500/20' : stratColor.includes('rose') ? 'border-rose-500/20' : 'border-indigo-500/20'}`}>
                                                <p className="text-[9px] text-slate-500 uppercase font-bold">Gain</p>
                                                <p className={`text-sm font-bold ${gain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{gain.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-xl text-center ${stratColor}`}>
                                            <p className="text-xs font-bold">{strategy}</p>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-slate-400 text-center py-4">Enter issue price & expected listing price above to see strategy</p>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Flippers Matrix */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="text-purple-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Flippers Matrix</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">Recent IPO listing day performance</p>
                    <div className="space-y-2">
                        {[
                            { name: 'Bajaj Housing', issue: 66, list: 150, day: '+127%' },
                            { name: 'NTPC Green', issue: 108, list: 120, day: '+11%' },
                            { name: 'Swiggy', issue: 390, list: 412, day: '+5.6%' },
                            { name: 'Hyundai India', issue: 1960, list: 1840, day: '-6.1%' },
                        ].map((ipo, i) => {
                            const gain = ((ipo.list - ipo.issue) / ipo.issue * 100);
                            return (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{ipo.name}</p>
                                        <p className="text-[10px] text-slate-400">₹{ipo.issue} → ₹{ipo.list}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold ${gain >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{ipo.day}</span>
                                        <p className="text-[9px] text-slate-400">{gain >= 20 ? '🟢 FLIP' : gain >= 0 ? '🟡 HOLD' : '🔴 AVOID'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-6" />
            </main>
        </div>
    );
};
