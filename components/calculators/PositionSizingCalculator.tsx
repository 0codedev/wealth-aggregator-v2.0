import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';
import { Crosshair, IndianRupee, Percent } from 'lucide-react';

export const PositionSizingCalculator: React.FC = () => {
    const [accountSize, setAccountSize] = useState(100000);
    const [riskPercent, setRiskPercent] = useState(1);

    const [entryPrice, setEntryPrice] = useState(1000);
    const [stopLoss, setStopLoss] = useState(950);
    const [leverage, setLeverage] = useState(1); // 1x means no leverage

    const result = useMemo(() => {
        if (entryPrice <= 0 || stopLoss <= 0 || accountSize <= 0) {
            return {
                riskAmount: 0,
                riskPerShare: 0,
                maxQuantity: 0,
                requiredMargin: 0,
                actualLeverage: 0
            };
        }

        const riskAmount = (accountSize * riskPercent) / 100;
        const riskPerShare = Math.abs(entryPrice - stopLoss);

        let maxQuantity = 0;
        if (riskPerShare > 0) {
            maxQuantity = Math.floor(riskAmount / riskPerShare);
        }

        const positionSizeValue = maxQuantity * entryPrice;
        const requiredMargin = positionSizeValue / leverage;
        const actualLeverage = positionSizeValue / accountSize;

        return {
            riskAmount,
            riskPerShare,
            maxQuantity,
            positionSizeValue,
            requiredMargin,
            actualLeverage
        };
    }, [accountSize, riskPercent, entryPrice, stopLoss, leverage]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Crosshair size={150} />
            </div>

            <h3 className="text-xl font-bold text-white mb-6 relative z-10">Position Sizing & Risk Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Account Size</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <IndianRupee size={14} />
                                </div>
                                <input
                                    type="number"
                                    value={accountSize}
                                    onChange={(e) => setAccountSize(Number(e.target.value))}
                                    className="w-full bg-slate-800 border-none rounded-lg pl-8 pr-3 py-2 text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Risk per Trade (%)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Percent size={14} />
                                </div>
                                <input
                                    type="number" step="0.1" max="10" min="0.1"
                                    value={riskPercent}
                                    onChange={(e) => setRiskPercent(Number(e.target.value))}
                                    className="w-full bg-slate-800 border-none rounded-lg pl-8 pr-3 py-2 text-white font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-800 my-4 border-dashed border-t border-slate-700"></div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Entry Price</label>
                            <input
                                type="number"
                                value={entryPrice}
                                onChange={(e) => setEntryPrice(Number(e.target.value))}
                                className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-indigo-100 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-1 block">Stop Loss</label>
                            <input
                                type="number"
                                value={stopLoss}
                                onChange={(e) => setStopLoss(Number(e.target.value))}
                                className="w-full bg-slate-800 border-none rounded-lg px-4 py-2 text-rose-100 font-mono focus:ring-2 focus:ring-rose-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between flex-wrap gap-2 mb-2">
                            <label className="text-xs font-medium text-slate-400">Leverage / Margin (x)</label>
                            <span className="text-xs font-semibold text-slate-300">{leverage}x</span>
                        </div>
                        <input
                            type="range" min="1" max="20" step="1"
                            value={leverage}
                            onChange={(e) => setLeverage(Number(e.target.value))}
                            className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Outputs */}
                <div className="bg-slate-800/60 p-6 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
                    <div className="mb-6">
                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">Max Allowed Quantity</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white">{result.maxQuantity.toLocaleString()}</span>
                            <span className="text-slate-500 font-medium tracking-wide">shares/units</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-rose-400 mb-1">Max Risk Amount</p>
                            <p className="text-lg font-bold text-rose-300">{formatCurrency(result.riskAmount)}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Risk Per Share</p>
                            <p className="text-lg font-bold text-white">{formatCurrency(result.riskPerShare)}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Total Position Value:</span>
                            <span className="font-mono text-white">{formatCurrency(result.positionSizeValue || 0)}</span>
                        </div>
                        <div className={`flex justify-between items-center text-sm ${result.requiredMargin > accountSize ? 'text-rose-400' : 'text-emerald-400'}`}>
                            <span className="font-bold">Required Margin:</span>
                            <span className="font-mono font-bold">{formatCurrency(result.requiredMargin || 0)}</span>
                        </div>
                        {result.requiredMargin > accountSize && (
                            <p className="text-[10px] text-rose-400 mt-1">⚠️ Margin exceeds account size. Increase leverage or deposit funds.</p>
                        )}
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">True Leverage:</span>
                            <span className="font-mono font-bold text-amber-400">{result.actualLeverage.toFixed(2)}x</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
