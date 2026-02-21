import React, { useMemo, useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    ReferenceLine, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, BarChart3, Zap, Info } from 'lucide-react';
import { calculateRollingXIRR, calculateCAGR, type CashFlow } from '../../../utils/xirr';
import { Investment } from '../../../types';
import { formatCurrency } from '../../../utils/helpers';

interface XIRRTimeMachineProps {
    investments: Investment[];
    totalCurrentValue: number;
    totalInvested: number;
    isPrivacyMode?: boolean;
}

// Benchmark returns for comparison (annualized)
const BENCHMARKS: Record<string, { label: string; return_1y: number; color: string }> = {
    nifty50: { label: 'Nifty 50', return_1y: 0.12, color: '#f59e0b' },
    fd: { label: 'FD (7%)', return_1y: 0.07, color: '#64748b' },
    gold: { label: 'Gold', return_1y: 0.10, color: '#eab308' },
};

const PERIOD_LABELS = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'] as const;

const XIRRTimeMachine: React.FC<XIRRTimeMachineProps> = ({
    investments,
    totalCurrentValue,
    totalInvested,
    isPrivacyMode = false,
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
    const [showBenchmarks, setShowBenchmarks] = useState(true);

    // Calculate rolling XIRR for all periods
    const rollingXIRR = useMemo(() => {
        if (!investments.length || totalCurrentValue <= 0) return {};
        return calculateRollingXIRR(investments, totalCurrentValue);
    }, [investments, totalCurrentValue]);

    // Calculate simple CAGR for comparison
    const cagr = useMemo(() => {
        if (totalInvested <= 0) return null;

        // Find the earliest investment date
        const dates = investments
            .map(i => new Date(i.lastUpdated))
            .filter(d => !isNaN(d.getTime()));

        if (!dates.length) return null;

        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        const years = (Date.now() - earliest.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

        if (years < 0.01) return null;
        return calculateCAGR(totalInvested, totalCurrentValue, years);
    }, [investments, totalInvested, totalCurrentValue]);

    // Build chart data from rolling periods
    const chartData = useMemo(() => {
        return PERIOD_LABELS.map(period => ({
            period,
            xirr: rollingXIRR[period] != null ? +(rollingXIRR[period]! * 100).toFixed(2) : null,
            nifty: BENCHMARKS.nifty50.return_1y * 100,
            fd: BENCHMARKS.fd.return_1y * 100,
        })).filter(d => d.xirr !== null);
    }, [rollingXIRR]);

    const currentXIRR = rollingXIRR[selectedPeriod];
    const xirrPercent = currentXIRR != null ? (currentXIRR * 100).toFixed(2) : null;
    const isPositive = currentXIRR != null && currentXIRR >= 0;

    // Wealth multiple
    const wealthMultiple = totalInvested > 0
        ? (totalCurrentValue / totalInvested).toFixed(2)
        : '1.00';

    return (
        <div className="glass-card p-5 rounded-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20">
                        <Clock className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">XIRR Time-Machine</h3>
                        <p className="text-[10px] text-white/40">True annualized returns</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowBenchmarks(!showBenchmarks)}
                    className={`text-xs px-2 py-1 rounded-lg transition-all ${showBenchmarks
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'bg-white/5 text-white/40 hover:text-white/60'
                        }`}
                >
                    <BarChart3 className="w-3 h-3 inline mr-1" />
                    Benchmarks
                </button>
            </div>

            {/* Big XIRR Number */}
            <div className="text-center py-3">
                {xirrPercent !== null ? (
                    <>
                        <div className={`text-4xl font-black tracking-tight ${isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            {isPrivacyMode ? '•••' : (
                                <>
                                    {isPositive ? '+' : ''}{xirrPercent}%
                                </>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                            {isPositive
                                ? <TrendingUp className="w-3 h-3 text-emerald-400" />
                                : <TrendingDown className="w-3 h-3 text-red-400" />
                            }
                            <span className="text-xs text-white/50">
                                XIRR ({selectedPeriod})
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="text-white/30 text-sm">
                        Need more investment history for {selectedPeriod} XIRR
                    </div>
                )}
            </div>

            {/* Period Selector */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {PERIOD_LABELS.map(period => {
                    const hasData = rollingXIRR[period] != null;
                    return (
                        <button
                            key={period}
                            onClick={() => hasData && setSelectedPeriod(period)}
                            className={`flex-1 text-xs py-1.5 rounded-lg transition-all font-medium ${selectedPeriod === period
                                ? 'bg-violet-500/30 text-violet-300 shadow-lg shadow-violet-500/10'
                                : hasData
                                    ? 'text-white/50 hover:text-white/80 hover:bg-white/5'
                                    : 'text-white/20 cursor-not-allowed'
                                }`}
                        >
                            {period}
                        </button>
                    );
                })}
            </div>

            {/* Rolling XIRR Chart */}
            {chartData.length > 1 && (
                <div className="h-40 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="xirrGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="period"
                                tick={{ fill: '#ffffff60', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#ffffff40', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => `${v}%`}
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 15, 30, 0.95)',
                                    border: '1px solid rgba(139, 92, 246, 0.3)',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    color: '#fff',
                                }}
                                formatter={(value: number | string | undefined, name?: string) => {
                                    const numValue = typeof value === 'number' ? value : parseFloat(String(value ?? '0'));
                                    const formattedValue = isNaN(numValue) ? '0.00%' : `${numValue.toFixed(2)}%`;
                                    const label = name === 'xirr' ? 'Your XIRR' : name === 'nifty' ? 'Nifty 50' : (name ?? '');
                                    return [formattedValue, label];
                                }}
                            />
                            <ReferenceLine y={0} stroke="#ffffff20" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="xirr"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="url(#xirrGradient)"
                                dot={{ r: 4, fill: '#8b5cf6', stroke: '#1a1a2e', strokeWidth: 2 }}
                                name="xirr"
                            />
                            {showBenchmarks && (
                                <>
                                    <Line
                                        type="monotone"
                                        dataKey="nifty"
                                        stroke="#f59e0b"
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        name="nifty"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="fd"
                                        stroke="#64748b"
                                        strokeWidth={1}
                                        strokeDasharray="4 4"
                                        dot={false}
                                        name="fd"
                                    />
                                </>
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
                {/* CAGR comparison */}
                <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/40 mb-1">CAGR</div>
                    <div className={`text-sm font-bold ${cagr != null && cagr >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                        {isPrivacyMode ? '•••' : (
                            cagr != null ? `${(cagr * 100).toFixed(1)}%` : '—'
                        )}
                    </div>
                </div>

                {/* Wealth Multiple */}
                <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/40 mb-1">Multiplier</div>
                    <div className="text-sm font-bold text-violet-400">
                        {isPrivacyMode ? '•••' : `${wealthMultiple}x`}
                    </div>
                </div>

                {/* vs Nifty */}
                <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-[10px] text-white/40 mb-1">vs Nifty</div>
                    {currentXIRR != null ? (
                        <div className={`text-sm font-bold flex items-center justify-center gap-1 ${currentXIRR > BENCHMARKS.nifty50.return_1y ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                            {currentXIRR > BENCHMARKS.nifty50.return_1y ? (
                                <Zap className="w-3 h-3" />
                            ) : null}
                            {isPrivacyMode ? '•••' : (
                                currentXIRR > BENCHMARKS.nifty50.return_1y ? 'Beating' : 'Trailing'
                            )}
                        </div>
                    ) : (
                        <div className="text-sm text-white/30">—</div>
                    )}
                </div>
            </div>

            {/* Benchmark Legend */}
            {showBenchmarks && (
                <div className="flex items-center justify-center gap-4 pt-1">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-violet-500 rounded" />
                        <span className="text-[10px] text-white/40">Your XIRR</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-amber-500 rounded" style={{ borderStyle: 'dashed' }} />
                        <span className="text-[10px] text-white/40">Nifty 50</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-slate-500 rounded" style={{ borderStyle: 'dashed' }} />
                        <span className="text-[10px] text-white/40">FD</span>
                    </div>
                </div>
            )}

            {/* Info footer */}
            <div className="flex items-start gap-2 bg-violet-500/5 rounded-xl p-3">
                <Info className="w-3.5 h-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-white/40 leading-relaxed">
                    XIRR accounts for the exact timing and size of each investment, making it the most
                    accurate return metric for SIP and lump-sum investors. CAGR assumes a single investment.
                </p>
            </div>
        </div>
    );
};

export default React.memo(XIRRTimeMachine);
