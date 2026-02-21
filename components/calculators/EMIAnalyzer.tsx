import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import { EditableValue } from '../shared/EditableValue';
import { Building2, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export const EMIAnalyzer: React.FC = () => {
    const [loanAmount, setLoanAmount] = useState(5000000); // 50L Default
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenureYears, setLoanTenureYears] = useState(20);
    const [extraPrepayment, setExtraPrepayment] = useState(10000); // 10k extra per month

    const result = useMemo(() => {
        const principal = loanAmount;
        const monthlyRate = interestRate / 12 / 100;
        const months = loanTenureYears * 12;

        // Standard EMI calculation
        let standardEmi = 0;
        let standardTotalInterest = 0;

        if (monthlyRate > 0 && months > 0) {
            standardEmi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
            standardTotalInterest = (standardEmi * months) - principal;
        }

        // Prepayment Analysis
        let monthsSaved = 0;
        let interestSaved = 0;
        let newTotalInterest = standardTotalInterest;
        let actualMonths = months;

        if (extraPrepayment > 0 && standardEmi > 0) {
            let balance = principal;
            newTotalInterest = 0;
            actualMonths = 0;

            // Simulate month by month
            while (balance > 0 && actualMonths < 1000) { // arbitrary safeguard
                actualMonths++;
                const interestForMonth = balance * monthlyRate;
                newTotalInterest += interestForMonth;

                const principalPaidStandard = standardEmi - interestForMonth;

                // Add prepayment directly to principal reduction
                const totalPrincipalPaid = principalPaidStandard + extraPrepayment;

                balance -= totalPrincipalPaid;

                if (balance <= 0) break;
            }

            monthsSaved = months - actualMonths;
            interestSaved = standardTotalInterest - newTotalInterest;
        }

        return {
            standardEmi,
            standardTotalInterest,
            totalPaymentStandard: principal + standardTotalInterest,
            actualMonths,
            monthsSaved,
            interestSaved,
            newTotalInterest,
            principal
        };

    }, [loanAmount, interestRate, loanTenureYears, extraPrepayment]);

    const chartData = [
        { name: 'Principal Amount', value: result.principal },
        { name: 'Total Interest', value: result.newTotalInterest }
    ];
    const COLORS = ['#6366f1', '#f43f5e'];

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Building2 className="text-indigo-500" size={24} /> Loan / EMI Analyzer
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-slate-300">Loan Amount</label>
                            <EditableValue
                                value={loanAmount}
                                onChange={setLoanAmount}
                                displayValue={formatCurrency(loanAmount)}
                                className="text-sm font-bold text-indigo-400"
                                min={100000}
                                step={100000}
                            />
                        </div>
                        <input
                            type="range" min="100000" max="50000000" step="100000"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Interest Rate (%)</label>
                            <input
                                type="number" step="0.1"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Number(e.target.value))}
                                className="w-full bg-slate-800 border-none rounded-lg px-3 py-2 text-white font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Tenure (Years)</label>
                            <input
                                type="number" step="1" min="1" max="40"
                                value={loanTenureYears}
                                onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                                className="w-full bg-slate-800 border-none rounded-lg px-3 py-2 text-white font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-slate-800/50 rounded-xl border border-emerald-500/20">
                        <label className="text-xs font-medium text-slate-300 mb-1 block">Extra Monthly Prepayment</label>
                        <p className="text-[10px] text-slate-500 mb-3">Adding small amounts monthly drastically cuts interest.</p>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                <IndianRupee size={14} />
                            </div>
                            <input
                                type="number" step="1000" min="0"
                                value={extraPrepayment}
                                onChange={(e) => setExtraPrepayment(Number(e.target.value))}
                                className="w-full bg-slate-900 border-none rounded-lg pl-8 pr-3 py-2 text-emerald-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Outputs */}
                <div className="lg:col-span-7 flex flex-col justify-center">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 rounded-2xl p-6 border border-indigo-500/20 flex flex-col justify-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">Base EMI</p>
                            <p className="text-4xl font-black text-indigo-400 relative z-10">{formatCurrency(result.standardEmi)}<span className="text-sm text-slate-500 font-medium">/mo</span></p>
                        </div>

                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 flex flex-col justify-center items-center">
                            <div className="h-32 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={50}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: any) => formatCurrency(Number(value) || 0)}
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[10px] text-slate-400">Principal</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[10px] text-slate-400">Interest</span></div>
                            </div>
                        </div>
                    </div>


                    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-300">Loan Summary</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Total Interest Paid</p>
                                <p className="text-lg font-mono text-rose-300">{formatCurrency(result.newTotalInterest)}</p>
                                {result.interestSaved > 0 && (
                                    <p className="text-[10px] text-rose-500/80 line-through">{formatCurrency(result.standardTotalInterest)}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">Loan Duration</p>
                                <p className="text-lg font-mono text-slate-200">{Math.floor(result.actualMonths / 12)} Yr {result.actualMonths % 12} Mo</p>
                                {result.monthsSaved > 0 && (
                                    <p className="text-[10px] text-slate-500/80 line-through">{loanTenureYears} Years</p>
                                )}
                            </div>
                        </div>

                        {result.interestSaved > 0 && (
                            <div className="p-4 bg-emerald-950/30 border-t border-emerald-900/50 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-500/80 mb-1">Prepayment Superpower</p>
                                    <p className="text-sm text-emerald-100">You save <span className="font-bold text-emerald-400">{formatCurrency(result.interestSaved)}</span> in interest.</p>
                                </div>
                                <div className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30 whitespace-nowrap">
                                    <span className="text-xs font-bold text-emerald-400">- {Math.floor(result.monthsSaved / 12)} Yr {result.monthsSaved % 12} Mo</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};
