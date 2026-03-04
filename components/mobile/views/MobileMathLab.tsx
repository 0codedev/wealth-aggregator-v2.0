import React, { useState, useMemo } from 'react';
import {
    Calculator, TrendingUp, Flame, Target, CreditCard,
    BarChart3, ArrowRight, RefreshCw, Percent
} from 'lucide-react';

type CalcCategory = 'investment' | 'trading' | 'simulation' | 'debt';

const formatINR = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const MobileMathLab: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<CalcCategory>('investment');

    // SIP Calculator
    const [sipMonthly, setSipMonthly] = useState(25000);
    const [sipRate, setSipRate] = useState(12);
    const [sipYears, setSipYears] = useState(20);

    const sipResult = useMemo(() => {
        const r = sipRate / 100 / 12;
        const n = sipYears * 12;
        const fv = sipMonthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        const invested = sipMonthly * n;
        return { fv, invested, gain: fv - invested };
    }, [sipMonthly, sipRate, sipYears]);

    // Lumpsum Calculator
    const [lsAmount, setLsAmount] = useState(500000);
    const [lsRate, setLsRate] = useState(12);
    const [lsYears, setLsYears] = useState(10);

    const lsResult = useMemo(() => {
        const fv = lsAmount * Math.pow(1 + lsRate / 100, lsYears);
        return { fv, gain: fv - lsAmount };
    }, [lsAmount, lsRate, lsYears]);

    // CAGR Calculator
    const [cagrStart, setCagrStart] = useState(100000);
    const [cagrEnd, setCagrEnd] = useState(250000);
    const [cagrYears, setCagrYears] = useState(5);

    const cagrResult = useMemo(() => {
        if (cagrStart <= 0 || cagrYears <= 0) return 0;
        return (Math.pow(cagrEnd / cagrStart, 1 / cagrYears) - 1) * 100;
    }, [cagrStart, cagrEnd, cagrYears]);

    // ROI Calculator
    const [roiInvested, setRoiInvested] = useState(100000);
    const [roiCurrent, setRoiCurrent] = useState(135000);

    const roiResult = useMemo(() => {
        if (roiInvested <= 0) return 0;
        return ((roiCurrent - roiInvested) / roiInvested) * 100;
    }, [roiInvested, roiCurrent]);

    // FIRE Calculator
    const [fireMonthly, setFireMonthly] = useState(75000);
    const [fireSWR, setFireSWR] = useState(4);

    const fireNumber = useMemo(() => (fireMonthly * 12) / (fireSWR / 100), [fireMonthly, fireSWR]);

    // EMI Calculator
    const [emiPrincipal, setEmiPrincipal] = useState(5000000);
    const [emiRate, setEmiRate] = useState(8.5);
    const [emiYears, setEmiYears] = useState(20);

    const emiResult = useMemo(() => {
        const r = emiRate / 100 / 12;
        const n = emiYears * 12;
        const emi = emiPrincipal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const totalPaid = emi * n;
        return { emi, totalPaid, totalInterest: totalPaid - emiPrincipal };
    }, [emiPrincipal, emiRate, emiYears]);

    // Trade P&L
    const [tradeBuy, setTradeBuy] = useState(100);
    const [tradeSell, setTradeSell] = useState(115);
    const [tradeQty, setTradeQty] = useState(100);

    const tradeResult = useMemo(() => {
        const pnl = (tradeSell - tradeBuy) * tradeQty;
        const pnlPct = ((tradeSell - tradeBuy) / tradeBuy) * 100;
        return { pnl, pnlPct };
    }, [tradeBuy, tradeSell, tradeQty]);

    const categories = [
        { id: 'investment' as const, label: 'Investment', icon: TrendingUp },
        { id: 'trading' as const, label: 'Trading', icon: BarChart3 },
        { id: 'simulation' as const, label: 'Simulation', icon: Target },
        { id: 'debt' as const, label: 'Debt', icon: CreditCard },
    ];

    // Slider component
    const SliderInput = ({ label, value, min, max, step, onChange, format }: {
        label: string; value: number; min: number; max: number; step: number;
        onChange: (v: number) => void; format?: (v: number) => string;
    }) => (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{format ? format(value) : value}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
        </div>
    );

    // Result Card
    const ResultCard = ({ label, value, sub, color = 'indigo' }: { label: string; value: string; sub?: string; color?: string }) => (
        <div className={`bg-${color}-500/10 border border-${color}-500/20 rounded-lg p-3`}>
            <p className={`text-[10px] uppercase font-bold text-${color}-600 dark:text-${color}-400 mb-1`}>{label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
            {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
        </div>
    );

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-500">
                        <Calculator className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Math Lab</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Advanced financial calculators</p>
                    </div>
                </div>
            </header>

            {/* Category Nav */}
            <div className="px-4 pt-4 flex gap-2 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${activeCategory === cat.id
                                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                    </button>
                ))}
            </div>

            <main className="p-4 space-y-5">
                {/* INVESTMENT CALCULATORS */}
                {activeCategory === 'investment' && (
                    <>
                        {/* SIP Calculator */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 text-emerald-500" /> SIP Calculator
                            </h3>
                            <SliderInput label="Monthly SIP" value={sipMonthly} min={500} max={200000} step={500} onChange={setSipMonthly} format={v => formatINR(v)} />
                            <SliderInput label="Expected Return" value={sipRate} min={4} max={25} step={0.5} onChange={setSipRate} format={v => `${v}%`} />
                            <SliderInput label="Duration" value={sipYears} min={1} max={40} step={1} onChange={setSipYears} format={v => `${v} yrs`} />
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1">Future Value</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatINR(sipResult.fv)}</p>
                                </div>
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
                                    <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1">Wealth Gain</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatINR(sipResult.gain)}</p>
                                    <p className="text-[10px] text-slate-500">Invested: {formatINR(sipResult.invested)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Lumpsum Calculator */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-500" /> Lumpsum Calculator
                            </h3>
                            <SliderInput label="Investment Amount" value={lsAmount} min={10000} max={10000000} step={10000} onChange={setLsAmount} format={v => formatINR(v)} />
                            <SliderInput label="Expected Return" value={lsRate} min={4} max={25} step={0.5} onChange={setLsRate} format={v => `${v}%`} />
                            <SliderInput label="Duration" value={lsYears} min={1} max={30} step={1} onChange={setLsYears} format={v => `${v} yrs`} />
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mt-4 text-center">
                                <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1">Maturity Value</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(lsResult.fv)}</p>
                                <p className="text-xs text-emerald-500 mt-1 font-semibold">+{formatINR(lsResult.gain)} gain</p>
                            </div>
                        </div>

                        {/* CAGR Calculator */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Percent className="w-4 h-4 text-amber-500" /> CAGR Calculator
                            </h3>
                            <SliderInput label="Initial Value" value={cagrStart} min={1000} max={10000000} step={1000} onChange={setCagrStart} format={v => formatINR(v)} />
                            <SliderInput label="Final Value" value={cagrEnd} min={1000} max={50000000} step={1000} onChange={setCagrEnd} format={v => formatINR(v)} />
                            <SliderInput label="Duration" value={cagrYears} min={1} max={30} step={1} onChange={setCagrYears} format={v => `${v} yrs`} />
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4 text-center">
                                <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 mb-1">CAGR</p>
                                <p className="text-3xl font-bold text-slate-900 dark:text-white">{cagrResult.toFixed(2)}%</p>
                            </div>
                        </div>

                        {/* ROI Calculator */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-emerald-500" /> ROI Calculator
                            </h3>
                            <SliderInput label="Invested Amount" value={roiInvested} min={1000} max={10000000} step={1000} onChange={setRoiInvested} format={v => formatINR(v)} />
                            <SliderInput label="Current Value" value={roiCurrent} min={1000} max={50000000} step={1000} onChange={setRoiCurrent} format={v => formatINR(v)} />
                            <div className={`rounded-lg p-4 mt-4 text-center ${roiResult >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Return on Investment</p>
                                <p className={`text-3xl font-bold ${roiResult >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{roiResult >= 0 ? '+' : ''}{roiResult.toFixed(2)}%</p>
                            </div>
                        </div>
                    </>
                )}

                {/* TRADING CALCULATORS */}
                {activeCategory === 'trading' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" /> Trade P&L Calculator
                        </h3>
                        <SliderInput label="Buy Price" value={tradeBuy} min={1} max={10000} step={1} onChange={setTradeBuy} format={v => `₹${v}`} />
                        <SliderInput label="Sell Price" value={tradeSell} min={1} max={10000} step={1} onChange={setTradeSell} format={v => `₹${v}`} />
                        <SliderInput label="Quantity" value={tradeQty} min={1} max={10000} step={1} onChange={setTradeQty} format={v => `${v}`} />
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className={`rounded-lg p-3 ${tradeResult.pnl >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">P&L</p>
                                <p className={`text-lg font-bold ${tradeResult.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tradeResult.pnl >= 0 ? '+' : ''}{formatINR(tradeResult.pnl)}
                                </p>
                            </div>
                            <div className={`rounded-lg p-3 ${tradeResult.pnlPct >= 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Return %</p>
                                <p className={`text-lg font-bold ${tradeResult.pnlPct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {tradeResult.pnlPct >= 0 ? '+' : ''}{tradeResult.pnlPct.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* SIMULATION CALCULATORS */}
                {activeCategory === 'simulation' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" /> FIRE Calculator
                        </h3>
                        <SliderInput label="Monthly Expenses" value={fireMonthly} min={10000} max={500000} step={5000} onChange={setFireMonthly} format={v => formatINR(v)} />
                        <SliderInput label="Safe Withdrawal Rate" value={fireSWR} min={2} max={6} step={0.5} onChange={setFireSWR} format={v => `${v}%`} />
                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-4 text-white text-center mt-4">
                            <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Your FIRE Number</p>
                            <p className="text-3xl font-bold">{formatINR(fireNumber)}</p>
                            <p className="text-xs text-white/70 mt-1">Annual expenses: {formatINR(fireMonthly * 12)}</p>
                        </div>
                    </div>
                )}

                {/* DEBT CALCULATORS */}
                {activeCategory === 'debt' && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-rose-500" /> EMI Calculator
                        </h3>
                        <SliderInput label="Loan Amount" value={emiPrincipal} min={100000} max={50000000} step={100000} onChange={setEmiPrincipal} format={v => formatINR(v)} />
                        <SliderInput label="Interest Rate" value={emiRate} min={5} max={20} step={0.25} onChange={setEmiRate} format={v => `${v}%`} />
                        <SliderInput label="Tenure" value={emiYears} min={1} max={30} step={1} onChange={setEmiYears} format={v => `${v} yrs`} />
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 text-center">
                                <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1">Monthly EMI</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(emiResult.emi)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Total Payment</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatINR(emiResult.totalPaid)}</p>
                                </div>
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                                    <p className="text-[10px] uppercase font-bold text-rose-500 mb-1">Total Interest</p>
                                    <p className="text-sm font-bold text-rose-500">{formatINR(emiResult.totalInterest)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-6" />
            </main>
        </div>
    );
};
