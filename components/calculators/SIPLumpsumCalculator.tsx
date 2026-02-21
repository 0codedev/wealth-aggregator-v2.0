import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import { EditableValue } from '../shared/EditableValue';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const SIPLumpsumCalculator: React.FC = () => {
    const [calcType, setCalcType] = useState<'SIP' | 'LUMPSUM'>('SIP');
    const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
    const [lumpsumInvestment, setLumpsumInvestment] = useState(100000);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [timePeriod, setTimePeriod] = useState(10);
    const [stepUpPerc, setStepUpPerc] = useState(0);

    const result = useMemo(() => {
        let totalInvested = 0;
        let futureValue = 0;
        const chartData = [];

        const monthlyRate = expectedReturn / 12 / 100;
        const months = timePeriod * 12;

        if (calcType === 'SIP') {
            let currentMonthly = monthlyInvestment;
            let currentFV = 0;

            for (let year = 1; year <= timePeriod; year++) {
                // For each year, we have 12 months of contributions at currentMonthly
                for (let month = 1; month <= 12; month++) {
                    totalInvested += currentMonthly;
                    currentFV = (currentFV + currentMonthly) * (1 + monthlyRate);
                }

                chartData.push({
                    year,
                    invested: Math.round(totalInvested),
                    value: Math.round(currentFV)
                });

                // Apply step up at end of year
                if (stepUpPerc > 0) {
                    currentMonthly = currentMonthly * (1 + stepUpPerc / 100);
                }
            }
            futureValue = currentFV;

        } else {
            // Lumpsum
            totalInvested = lumpsumInvestment;
            for (let year = 1; year <= timePeriod; year++) {
                const yearValue = totalInvested * Math.pow(1 + expectedReturn / 100, year);
                chartData.push({
                    year,
                    invested: totalInvested,
                    value: Math.round(yearValue)
                });
            }
            futureValue = chartData[chartData.length - 1].value;
        }

        const estReturns = futureValue - totalInvested;

        return { totalInvested, futureValue, estReturns, chartData };
    }, [calcType, monthlyInvestment, lumpsumInvestment, expectedReturn, timePeriod, stepUpPerc]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Investment Calculator</h3>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setCalcType('SIP')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${calcType === 'SIP' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        SIP
                    </button>
                    <button
                        onClick={() => setCalcType('LUMPSUM')}
                        className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${calcType === 'LUMPSUM' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Lumpsum
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    {calcType === 'SIP' ? (
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">Monthly Investment</label>
                                <EditableValue
                                    value={monthlyInvestment}
                                    onChange={setMonthlyInvestment}
                                    displayValue={formatCurrency(monthlyInvestment)}
                                    className="text-sm font-bold text-indigo-400"
                                    min={500}
                                    step={500}
                                />
                            </div>
                            <input
                                type="range" min="500" max="1000000" step="500"
                                value={monthlyInvestment}
                                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    ) : (
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">Total Investment</label>
                                <EditableValue
                                    value={lumpsumInvestment}
                                    onChange={setLumpsumInvestment}
                                    displayValue={formatCurrency(lumpsumInvestment)}
                                    className="text-sm font-bold text-indigo-400"
                                    min={1000}
                                    step={1000}
                                />
                            </div>
                            <input
                                type="range" min="10000" max="10000000" step="10000"
                                value={lumpsumInvestment}
                                onChange={(e) => setLumpsumInvestment(Number(e.target.value))}
                                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Expected Return Rate (p.a)</label>
                            <EditableValue
                                value={expectedReturn}
                                onChange={setExpectedReturn}
                                suffix="%"
                                className="text-sm font-bold text-emerald-400"
                                min={1}
                                max={50}
                                step={0.5}
                            />
                        </div>
                        <input
                            type="range" min="1" max="30" step="0.5"
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                            className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Time Period (Years)</label>
                            <EditableValue
                                value={timePeriod}
                                onChange={setTimePeriod}
                                suffix=" Yr"
                                className="text-sm font-bold text-amber-400"
                                min={1}
                                max={50}
                                step={1}
                            />
                        </div>
                        <input
                            type="range" min="1" max="40" step="1"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(Number(e.target.value))}
                            className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {calcType === 'SIP' && (
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-300">Annual Step-Up (Optional)</label>
                                <EditableValue
                                    value={stepUpPerc}
                                    onChange={setStepUpPerc}
                                    suffix="%"
                                    className="text-sm font-bold text-rose-400"
                                    min={0}
                                    max={50}
                                    step={1}
                                />
                            </div>
                            <input
                                type="range" min="0" max="25" step="1"
                                value={stepUpPerc}
                                onChange={(e) => setStepUpPerc(Number(e.target.value))}
                                className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    )}
                </div>

                {/* Results & Chart */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-1">Invested Amount</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(result.totalInvested)}</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <p className="text-xs text-slate-400 mb-1">Est. Returns</p>
                            <p className="text-lg font-bold text-emerald-400">+{formatCurrency(result.estReturns)}</p>
                        </div>
                        <div className="bg-indigo-900/40 p-4 rounded-xl col-span-2 border border-indigo-500/20">
                            <p className="text-sm text-indigo-300 mb-1 font-medium">Total Value</p>
                            <p className="text-3xl font-black text-white">{formatCurrency(result.futureValue)}</p>
                        </div>
                    </div>

                    <div className="h-64 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="year" stroke="#475569" fontSize={12} tickFormatter={(val) => `${val}Y`} />
                                <YAxis stroke="#475569" fontSize={12} tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`} />
                                <Tooltip
                                    formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                    labelFormatter={(label) => `Year ${label}`}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="invested" stroke="#94a3b8" fillOpacity={1} fill="url(#colorInvested)" name="Invested" />
                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" name="Total Value" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
