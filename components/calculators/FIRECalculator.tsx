import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import { EditableValue } from '../shared/EditableValue';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export const FIRECalculator: React.FC = () => {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(50);
    const [lifeExpectancy, setLifeExpectancy] = useState(85);
    const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
    const [inflationRate, setInflationRate] = useState(6);
    const [expectedReturnPostRetirement, setExpectedReturnPostRetirement] = useState(9);

    // Existing assets
    const [currentCorpus, setCurrentCorpus] = useState(1000000);

    const result = useMemo(() => {
        const yearsToRetirement = retirementAge - currentAge;
        const yearsInRetirement = lifeExpectancy - retirementAge;

        // Calculate monthly expenses at retirement (adjusted for inflation)
        const expensesAtRetirement = monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
        const annualExpensesAtRetirement = expensesAtRetirement * 12;

        // Real return post-retirement
        const realReturn = ((1 + expectedReturnPostRetirement / 100) / (1 + inflationRate / 100)) - 1;

        // Calculate needed corpus at retirement (Present value of growing annuity)
        let corpusNeeded = 0;
        if (realReturn === 0) {
            corpusNeeded = annualExpensesAtRetirement * yearsInRetirement;
        } else {
            corpusNeeded = annualExpensesAtRetirement * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);
        }

        // Calculate Future Value of current corpus at retirement (assume pre-retirement return is same as post for now, or could add another slider)
        // Let's assume a standard 12% pre-retirement return for the current corpus
        const preRetirementReturn = 12;
        const fvCurrentCorpus = currentCorpus * Math.pow(1 + preRetirementReturn / 100, yearsToRetirement);

        // Shortfall
        const shortfall = Math.max(0, corpusNeeded - fvCurrentCorpus);

        // Required monthly SIP to bridge shortfall
        const monthlyRate = preRetirementReturn / 12 / 100;
        const months = yearsToRetirement * 12;
        const requiredSIP = shortfall > 0
            ? (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)
            : 0;

        return {
            expensesAtRetirement,
            corpusNeeded,
            fvCurrentCorpus,
            shortfall,
            requiredSIP
        };
    }, [currentAge, retirementAge, lifeExpectancy, monthlyExpenses, inflationRate, expectedReturnPostRetirement, currentCorpus]);

    const chartData = [
        { name: 'Future Value of Current Corpus', value: Math.min(result.fvCurrentCorpus, result.corpusNeeded) },
        { name: 'Shortfall (To be Built)', value: result.shortfall }
    ];
    const COLORS = ['#6366f1', '#f43f5e'];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">F.I.R.E. Engine</h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-400 block mb-1">Current Age</label>
                            <input
                                type="number"
                                value={currentAge}
                                onChange={(e) => setCurrentAge(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400 block mb-1">Retirement Age</label>
                            <input
                                type="number"
                                value={retirementAge}
                                onChange={(e) => setRetirementAge(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Life Expectancy</label>
                            <EditableValue
                                value={lifeExpectancy}
                                onChange={setLifeExpectancy}
                                suffix=" Yr"
                                className="text-sm font-bold text-slate-300"
                                min={retirementAge + 1}
                                max={100}
                                step={1}
                            />
                        </div>
                        <input
                            type="range" min={retirementAge + 1} max="100" step="1"
                            value={lifeExpectancy}
                            onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                            className="w-full accent-slate-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Current Monthly Expenses</label>
                            <EditableValue
                                value={monthlyExpenses}
                                onChange={setMonthlyExpenses}
                                displayValue={formatCurrency(monthlyExpenses)}
                                className="text-sm font-bold text-rose-400"
                                min={5000}
                                step={5000}
                            />
                        </div>
                        <input
                            type="range" min="10000" max="1000000" step="5000"
                            value={monthlyExpenses}
                            onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                            className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Current Saved Corpus</label>
                            <EditableValue
                                value={currentCorpus}
                                onChange={setCurrentCorpus}
                                displayValue={formatCurrency(currentCorpus)}
                                className="text-sm font-bold text-indigo-400"
                                min={0}
                                step={100000}
                            />
                        </div>
                        <input
                            type="range" min="0" max="50000000" step="100000"
                            value={currentCorpus}
                            onChange={(e) => setCurrentCorpus(Number(e.target.value))}
                            className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-400 block mb-1">Inflation (%)</label>
                            <input
                                type="number" step="0.5"
                                value={inflationRate}
                                onChange={(e) => setInflationRate(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400 block mb-1">Post-Ret Return (%)</label>
                            <input
                                type="number" step="0.5"
                                value={expectedReturnPostRetirement}
                                onChange={(e) => setExpectedReturnPostRetirement(Number(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Results & Chart */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <p className="text-sm text-slate-400 mb-2">Target FIRE Corpus Needed</p>
                        <h4 className="text-4xl font-black text-white">{formatCurrency(result.corpusNeeded)}</h4>

                        <div className="mt-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 mb-1">Monthly Exp. @ Retirement</p>
                                <p className="text-lg font-bold text-rose-400">{formatCurrency(result.expensesAtRetirement)}/mo</p>
                            </div>
                            <div className="w-px bg-slate-700 hidden md:block"></div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 mb-1">Required monthly SIP now</p>
                                {result.requiredSIP > 0 ? (
                                    <p className="text-lg font-bold text-indigo-400">{formatCurrency(result.requiredSIP)}/mo</p>
                                ) : (
                                    <p className="text-lg font-bold text-emerald-400">Target Achieved 🎉</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-48 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => formatCurrency(Number(value) || 0)}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
