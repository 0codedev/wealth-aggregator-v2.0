import React, { useState, useMemo, useCallback } from 'react';
import {
    Target, Flame, Calculator, TrendingUp, TrendingDown,
    Play, CheckCircle2, AlertTriangle, SlidersHorizontal, PiggyBank
} from 'lucide-react';
import { usePortfolioStore } from '../../../store/portfolioStore';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const MobilePlanner: React.FC = () => {
    const { investments, stats } = usePortfolioStore();
    const currentCorpus = stats?.totalCurrent || 0;

    // Parameter state
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(55);
    const [monthlyExpenses, setMonthlyExpenses] = useState(75000);
    const [monthlySaving, setMonthlySaving] = useState(50000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [inflation, setInflation] = useState(6);
    const [swr, setSwr] = useState(4); // Safe withdrawal rate

    // Active tab
    const [activeTab, setActiveTab] = useState<'retirement' | 'fire'>('retirement');

    // Calculations
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = 85 - retirementAge; // Assume life till 85

    const projectedCorpus = useMemo(() => {
        const r = expectedReturn / 100 / 12;
        const n = yearsToRetirement * 12;
        const futureCorpus = currentCorpus * Math.pow(1 + r, n);
        const futureSIP = monthlySaving * ((Math.pow(1 + r, n) - 1) / r);
        return futureCorpus + futureSIP;
    }, [currentCorpus, monthlySaving, expectedReturn, yearsToRetirement]);

    const requiredCorpus = useMemo(() => {
        const realReturn = ((1 + expectedReturn / 100) / (1 + inflation / 100)) - 1;
        const inflatedExpenses = monthlyExpenses * Math.pow(1 + inflation / 100, yearsToRetirement);
        const annual = inflatedExpenses * 12;
        return annual / (swr / 100);
    }, [monthlyExpenses, inflation, yearsToRetirement, swr, expectedReturn]);

    const gap = projectedCorpus - requiredCorpus;
    const isOnTrack = gap >= 0;

    // FIRE number
    const fireNumber = useMemo(() => (monthlyExpenses * 12) / (swr / 100), [monthlyExpenses, swr]);
    const fireProgress = Math.min(100, (currentCorpus / fireNumber) * 100);

    // Monte Carlo simulation (simplified — runs in main thread for mobile)
    const [simResult, setSimResult] = useState<{ successRate: number; median: number } | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const runSimulation = useCallback(() => {
        setIsSimulating(true);
        setTimeout(() => {
            const trials = 1000;
            let successes = 0;
            const endValues: number[] = [];
            const r = expectedReturn / 100;
            const vol = 0.15; // assumed volatility

            for (let i = 0; i < trials; i++) {
                let corpus = currentCorpus;
                for (let y = 0; y < yearsToRetirement; y++) {
                    const yearReturn = r + (Math.random() - 0.5) * 2 * vol;
                    corpus = corpus * (1 + yearReturn) + monthlySaving * 12;
                }
                endValues.push(corpus);
                if (corpus >= requiredCorpus) successes++;
            }
            endValues.sort((a, b) => a - b);
            setSimResult({
                successRate: Math.round((successes / trials) * 100),
                median: endValues[Math.floor(trials / 2)],
            });
            setIsSimulating(false);
        }, 500);
    }, [currentCorpus, expectedReturn, yearsToRetirement, monthlySaving, requiredCorpus]);

    // Slider component
    const SliderInput = ({ label, value, min, max, step, onChange, suffix, format }: {
        label: string; value: number; min: number; max: number; step: number;
        onChange: (v: number) => void; suffix?: string; format?: (v: number) => string;
    }) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {format ? format(value) : value}{suffix || ''}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                <span>{format ? format(min) : min}{suffix || ''}</span>
                <span>{format ? format(max) : max}{suffix || ''}</span>
            </div>
        </div>
    );

    return (
        <div className="pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Target className="text-indigo-500 w-6 h-6" />
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Life Planner</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Retirement & FIRE planning with Monte Carlo</p>
                    </div>
                </div>
            </header>

            {/* Sub Tabs */}
            <div className="px-4 pt-4 flex gap-2">
                <button
                    onClick={() => setActiveTab('retirement')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'retirement' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                        }`}
                >
                    <PiggyBank className="w-4 h-4 inline mr-1" /> Retirement
                </button>
                <button
                    onClick={() => setActiveTab('fire')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'fire' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                        }`}
                >
                    <Flame className="w-4 h-4 inline mr-1" /> FIRE
                </button>
            </div>

            <main className="p-4 space-y-5">
                {/* Current Corpus Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Your Current Corpus</p>
                    <h2 className="text-3xl font-bold">{formatCurrency(currentCorpus)}</h2>
                    <p className="text-xs text-white/70 mt-1">{investments.length} active investments</p>
                </div>

                {activeTab === 'retirement' && (
                    <>
                        {/* Parameters */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> Parameters
                            </h3>
                            <SliderInput label="Current Age" value={currentAge} min={18} max={60} step={1} onChange={setCurrentAge} suffix=" yrs" />
                            <SliderInput label="Retirement Age" value={retirementAge} min={40} max={70} step={1} onChange={setRetirementAge} suffix=" yrs" />
                            <SliderInput label="Monthly Expenses" value={monthlyExpenses} min={10000} max={500000} step={5000} onChange={setMonthlyExpenses} format={v => `₹${(v / 1000).toFixed(0)}K`} />
                            <SliderInput label="Monthly Saving" value={monthlySaving} min={5000} max={500000} step={5000} onChange={setMonthlySaving} format={v => `₹${(v / 1000).toFixed(0)}K`} />
                            <SliderInput label="Expected Return" value={expectedReturn} min={6} max={20} step={0.5} onChange={setExpectedReturn} suffix="%" />
                            <SliderInput label="Inflation Rate" value={inflation} min={3} max={10} step={0.5} onChange={setInflation} suffix="%" />
                        </div>

                        {/* Projected Outcomes */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-indigo-500" /> Projected Outcomes
                            </h3>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <p className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-bold mb-1">Projected Corpus</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(projectedCorpus)}</p>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                    <p className="text-[10px] uppercase text-amber-600 dark:text-amber-400 font-bold mb-1">Required Corpus</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(requiredCorpus)}</p>
                                </div>
                            </div>
                            <div className={`rounded-lg p-4 flex items-center gap-3 ${isOnTrack ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-500/30'}`}>
                                {isOnTrack ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />}
                                <div>
                                    <p className={`text-sm font-bold ${isOnTrack ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                        {isOnTrack ? 'On Track!' : 'Gap Detected'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {isOnTrack ? `Surplus of ${formatCurrency(gap)}` : `Shortfall of ${formatCurrency(Math.abs(gap))}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Monte Carlo */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-indigo-500" /> Monte Carlo Simulation
                            </h3>
                            <p className="text-xs text-slate-500 mb-4">Run 1,000 randomized scenarios to test your plan's survivability.</p>
                            <button
                                onClick={runSimulation}
                                disabled={isSimulating}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-indigo-500/20"
                            >
                                <Play className="w-4 h-4" />
                                {isSimulating ? 'Simulating...' : 'Run 1,000 Simulations'}
                            </button>
                            {simResult && (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className={`rounded-lg p-3 text-center ${simResult.successRate >= 80 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">{simResult.successRate}%</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Success Rate</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-center">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(simResult.median)}</p>
                                        <p className="text-[10px] uppercase font-bold text-slate-500">Median Outcome</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'fire' && (
                    <>
                        {/* FIRE Dashboard */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-500" /> Your FIRE Number
                            </h3>
                            <SliderInput label="Monthly Expenses" value={monthlyExpenses} min={10000} max={500000} step={5000} onChange={setMonthlyExpenses} format={v => `₹${(v / 1000).toFixed(0)}K`} />
                            <SliderInput label="Safe Withdrawal Rate" value={swr} min={2} max={6} step={0.5} onChange={setSwr} suffix="%" />

                            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-4 text-white text-center mt-4">
                                <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">FIRE Target</p>
                                <p className="text-3xl font-bold">{formatCurrency(fireNumber)}</p>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-500">Progress</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{fireProgress.toFixed(1)}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                                        style={{ width: `${fireProgress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                                    <span>{formatCurrency(currentCorpus)}</span>
                                    <span>{formatCurrency(fireNumber)}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {/* ═══════ OPPORTUNITY COST ═══════ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Calculator className="text-purple-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Opportunity Cost</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">What if you'd invested in these instead?</p>
                    <div className="space-y-2">
                        {[
                            { name: 'Nifty 50 Index', cagr: 12, years: 10, icon: '📊' },
                            { name: 'Gold', cagr: 10, years: 10, icon: '🥇' },
                            { name: 'Fixed Deposit', cagr: 7, years: 10, icon: '🏦' },
                            { name: 'Bitcoin (₹)', cagr: 45, years: 10, icon: '₿' },
                            { name: 'Real Estate', cagr: 8, years: 10, icon: '🏢' },
                        ].map((alt, i) => {
                            const futureVal = currentCorpus * Math.pow(1 + alt.cagr / 100, alt.years);
                            const diff = futureVal - currentCorpus;
                            return (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{alt.icon}</span>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-900 dark:text-white">{alt.name}</p>
                                            <p className="text-[10px] text-slate-400">{alt.cagr}% CAGR × {alt.years}yr</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(futureVal)}</p>
                                        <p className="text-[10px] text-emerald-500 font-bold">+{formatCurrency(diff)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ═══════ DYNASTY MODE ═══════ */}
                <div className="bg-gradient-to-br from-amber-950/80 to-slate-900 rounded-2xl border border-amber-500/20 p-5 relative overflow-hidden">
                    <div className="absolute top-2 right-2 opacity-10 text-6xl">👑</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">👑</span>
                            <div>
                                <h3 className="text-sm font-bold text-white">Dynasty Mode</h3>
                                <p className="text-[10px] text-slate-400">Multi-Generational Wealth</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { gen: 'You (Gen 1)', years: 30, rate: 12 },
                                { gen: 'Children (Gen 2)', years: 30, rate: 10 },
                                { gen: 'Grandchildren (Gen 3)', years: 30, rate: 8 },
                            ].map((g, i) => {
                                const prevCorpus = i === 0 ? currentCorpus : currentCorpus * Math.pow(1 + [12, 10][i - 1] / 100, 30 * i);
                                const futureGen = prevCorpus * Math.pow(1 + g.rate / 100, g.years);
                                return (
                                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-white">{g.gen}</p>
                                                <p className="text-[10px] text-slate-400">{g.rate}% CAGR × {g.years}yr</p>
                                            </div>
                                            <p className="text-sm font-mono font-bold text-amber-400">{formatCurrency(futureGen)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <p className="text-[10px] text-slate-400 text-center">Assuming reinvestment with no withdrawals</p>
                        </div>
                    </div>
                </div>

                {/* ═══════ LEGACY VAULT ═══════ */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="text-indigo-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Legacy Vault</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                            <p className="text-[10px] text-indigo-500 uppercase font-bold mb-1">Estate Value</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(currentCorpus)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Nominees</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">0</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Will Status</p>
                                <p className="text-lg font-bold text-amber-500">Pending</p>
                            </div>
                        </div>
                        {[
                            { asset: 'Demat Account', nominee: 'Not Assigned', status: 'warn' },
                            { asset: 'Bank Accounts', nominee: 'Not Assigned', status: 'warn' },
                            { asset: 'Insurance Policies', nominee: 'Not Assigned', status: 'warn' },
                            { asset: 'Property', nominee: 'Not Assigned', status: 'warn' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div>
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.asset}</p>
                                    <p className="text-[10px] text-slate-400">{item.nominee}</p>
                                </div>
                                <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${item.status === 'pass' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {item.status === 'pass' ? '✓ Done' : '⚠ Action'}
                                </span>
                            </div>
                        ))}
                        <button className="w-full py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                            <Target className="w-4 h-4" /> Setup Legacy Plan
                        </button>
                    </div>
                </div>

                <div className="h-6" />
            </main>
        </div>
    );
};
