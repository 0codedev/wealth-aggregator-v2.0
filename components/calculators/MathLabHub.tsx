import React, { useState } from 'react';
import { Calculator, TrendingUp, Target, CreditCard } from 'lucide-react';

// Subcomponents (To be implemented)
import { InvestmentCalculators } from './InvestmentCalculators';
import { TradingCalculators } from './TradingCalculators';
import { ScenarioCalculators } from './ScenarioCalculators';
import { DebtCalculators } from './DebtCalculators';

const CATEGORIES = [
    { id: 'investment', label: 'Investment & Wealth', icon: TrendingUp },
    { id: 'trading', label: 'Active Trading', icon: Target },
    { id: 'scenario', label: 'Simulations', icon: Calculator },
    { id: 'debt', label: 'Debt & Loans', icon: CreditCard },
];

export const MathLabHub: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('investment');

    const renderCategory = () => {
        switch (activeCategory) {
            case 'investment':
                return <InvestmentCalculators />;
            case 'trading':
                return <TradingCalculators />;
            case 'scenario':
                return <ScenarioCalculators />;
            case 'debt':
                return <DebtCalculators />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                            <Calculator size={24} />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Math Lab</h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl">
                        Advanced financial calculators and scenario simulators. Plan investments, analyze trades, and optimize your wealth trajectory.
                    </p>
                </div>
            </div>

            {/* Category Navigation */}
            <div className="flex overflow-x-auto scrollbar-none gap-2 pb-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeCategory === cat.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <cat.icon size={16} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Calculator Content */}
            <div className="mt-6">
                {renderCategory()}
            </div>
        </div>
    );
};
