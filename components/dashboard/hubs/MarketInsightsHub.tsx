import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, TrendingUp, Globe, Activity, BarChart3,
    PieChart, AlertCircle, ArrowUpRight, ArrowDownRight,
    Layers, Info
} from 'lucide-react';
import { Investment } from '../../../types';
import { useMarketSentiment, MarketStatus } from '../../../hooks/useMarketSentiment';

interface MarketInsightsHubProps {
    onBack: () => void;
    stats: any;
    investments: Investment[];
}

export const MarketInsightsHub: React.FC<MarketInsightsHubProps> = ({
    onBack,
    stats,
    investments
}) => {
    const { status, vix, marketMessage } = useMarketSentiment();

    // Determine sentiment based on VIX
    const getSentiment = (vixValue: number): string => {
        if (vixValue < 15) return 'Calm';
        if (vixValue < 20) return 'Neutral';
        if (vixValue < 25) return 'Nervous';
        return 'Fearful';
    };

    // Determine trend based on status
    const getTrend = (marketStatus: MarketStatus): 'up' | 'down' | 'neutral' => {
        if (marketStatus === 'NORMAL') return 'up';
        if (marketStatus === 'RED') return 'down';
        return 'neutral';
    };

    const sentiment = getSentiment(vix);
    const trend = getTrend(status);

    // Calculate portfolio metrics
    const portfolioMetrics = useMemo(() => {
        const equityInvestments = investments.filter((i: Investment) =>
            i.type === 'Stocks' || i.type === 'ETF' || i.type === 'Smallcase'
        );
        const equityValue = equityInvestments.reduce((sum: number, i: Investment) => sum + (i.currentValue || 0), 0);
        const equityInvested = equityInvestments.reduce((sum: number, i: Investment) => sum + (i.investedAmount || 0), 0);
        const equityReturns = equityInvested > 0 ? ((equityValue - equityInvested) / equityInvested) * 100 : 0;
        const uniquePlatforms = new Set(equityInvestments.map((i: Investment) => i.platform)).size;
        
        return {
            equityValue,
            equityInvested,
            equityReturns,
            equityCount: equityInvestments.length,
            uniquePlatforms
        };
    }, [investments]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Globe className="text-indigo-500" />
                            Market Insights
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Real-time market analysis and portfolio correlation
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${
                        status === 'NORMAL' || status === 'PRE_MARKET' ? 'bg-emerald-500 animate-pulse' :
                        status === 'CLOSED' ? 'bg-red-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-sm font-medium">{marketMessage}</span>
                </div>
            </div>

            {/* Market Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-500 dark:text-slate-400 text-sm">Market Sentiment</span>
                        <Activity size={18} className="text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold capitalize">{sentiment}</div>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${
                        trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-500'
                    }`}>
                        {trend === 'up' ? <ArrowUpRight size={16} /> : trend === 'down' ? <ArrowDownRight size={16} /> : null}
                        {trend === 'up' ? 'Bullish momentum' : trend === 'down' ? 'Bearish pressure' : 'Sideways movement'}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-500 dark:text-slate-400 text-sm">Equity Exposure</span>
                        <PieChart size={18} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">₹{(portfolioMetrics.equityValue / 100000).toFixed(1)}L</div>
                    <div className={`flex items-center gap-1 text-sm mt-1 ${
                        portfolioMetrics.equityReturns >= 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                        {portfolioMetrics.equityReturns >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {portfolioMetrics.equityReturns.toFixed(2)}% returns
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-500 dark:text-slate-400 text-sm">Active Positions</span>
                        <BarChart3 size={18} className="text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold">{portfolioMetrics.equityCount}</div>
                    <div className="text-slate-500 text-sm mt-1">
                        Across {portfolioMetrics.uniquePlatforms} platforms
                    </div>
                </motion.div>
            </div>

            {/* Portfolio Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-500" />
                    Portfolio Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-500 mb-1">Total Value</div>
                        <div className="text-xl font-bold">₹{((stats?.totalValue || 0) / 100000).toFixed(1)}L</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-500 mb-1">Day Change</div>
                        <div className={`text-xl font-bold ${(stats?.dayChange || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(stats?.dayChange || 0) >= 0 ? '+' : ''}₹{(Math.abs(stats?.dayChange || 0)).toLocaleString()}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-500 mb-1">Total Return</div>
                        <div className={`text-xl font-bold ${(stats?.totalGain || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {(stats?.totalGain || 0) >= 0 ? '+' : ''}₹{((stats?.totalGain || 0) / 1000).toFixed(1)}K
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-500 mb-1">Diversity Score</div>
                        <div className="text-xl font-bold">{stats?.diversityScore || 0}%</div>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 flex items-start gap-3">
                <Info className="text-indigo-500 mt-0.5 flex-shrink-0" size={18} />
                <div className="text-sm text-indigo-800 dark:text-indigo-200">
                    <strong>Market Insights Hub:</strong> Track your equity exposure and market correlation. 
                    Monitor market sentiment and adjust your portfolio accordingly. Future enhancements 
                    will include real-time market data feeds and AI-powered market predictions.
                </div>
            </div>
        </motion.div>
    );
};

export default MarketInsightsHub;
