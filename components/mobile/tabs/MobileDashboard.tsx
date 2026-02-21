import React from 'react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { formatCurrency } from '../../../utils/helpers';

const MobileDashboard: React.FC = () => {
    const { stats } = usePortfolioStore();

    return (
        <div className="space-y-4 pb-6">
            <h1 className="text-2xl font-bold pb-2">Dashboard</h1>

            {/* Quick Stats Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <h2 className="text-slate-400 text-sm font-medium mb-1 relative z-10">Gross Assets</h2>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent relative z-10">
                    {formatCurrency(stats?.totalCurrent || 0)}
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-slate-400">
                <p>More mobile-optimized widgets coming soon...</p>
            </div>
        </div>
    );
};

export default MobileDashboard;
