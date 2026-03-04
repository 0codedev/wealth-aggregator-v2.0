import React, { useState } from 'react';
import {
    BookOpen, TrendingUp, TrendingDown, Calendar, Clock, Tag,
    Brain, Target, BarChart3, PenLine, Smile, Frown, Meh,
    AlertTriangle, CheckCircle, ArrowRight, Plus
} from 'lucide-react';

interface TradeEntry {
    id: string;
    date: string;
    asset: string;
    type: 'BUY' | 'SELL';
    amount: number;
    emotion: 'confident' | 'fearful' | 'neutral' | 'greedy';
    notes: string;
    outcome?: 'profit' | 'loss' | 'pending';
}

const MOCK_TRADES: TradeEntry[] = [
    { id: '1', date: '2026-02-20', asset: 'Reliance', type: 'BUY', amount: 25000, emotion: 'confident', notes: 'Strong quarterly results', outcome: 'profit' },
    { id: '2', date: '2026-02-18', asset: 'TCS', type: 'SELL', amount: 15000, emotion: 'fearful', notes: 'IT sector weakness', outcome: 'loss' },
    { id: '3', date: '2026-02-15', asset: 'HDFC Bank', type: 'BUY', amount: 30000, emotion: 'neutral', notes: 'Rebalancing portfolio', outcome: 'profit' },
    { id: '4', date: '2026-02-12', asset: 'Infosys', type: 'BUY', amount: 20000, emotion: 'greedy', notes: 'FOMO buy on dip', outcome: 'loss' },
];

const emotionIcons = {
    confident: { icon: Smile, color: 'text-emerald-500 bg-emerald-500/10' },
    fearful: { icon: Frown, color: 'text-rose-500 bg-rose-500/10' },
    neutral: { icon: Meh, color: 'text-slate-500 bg-slate-500/10' },
    greedy: { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10' },
};

export const MobileJournal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'trades' | 'insights' | 'streaks'>('trades');

    const profitTrades = MOCK_TRADES.filter(t => t.outcome === 'profit').length;
    const lossTrades = MOCK_TRADES.filter(t => t.outcome === 'loss').length;
    const winRate = MOCK_TRADES.length > 0 ? (profitTrades / MOCK_TRADES.length * 100) : 0;

    return (
        <div className="pb-24">
            {/* Header Stats */}
            <div className="px-4 pt-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Win Rate</p>
                        <p className="text-xl font-bold text-emerald-500">{winRate.toFixed(0)}%</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Trades</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{MOCK_TRADES.length}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Streak</p>
                        <p className="text-xl font-bold text-amber-500">🔥 3</p>
                    </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800">
                    {(['trades', 'insights', 'streaks'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 pb-2 text-xs font-bold capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-indigo-500 text-indigo-500' : 'text-slate-500 dark:text-slate-400'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'trades' && (
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
                            <Plus className="w-4 h-4" /> Log New Trade
                        </button>
                        {MOCK_TRADES.map(trade => {
                            const EmotionIcon = emotionIcons[trade.emotion].icon;
                            return (
                                <div key={trade.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{trade.type}</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">{trade.asset}</span>
                                        </div>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${emotionIcons[trade.emotion].color}`}>
                                            <EmotionIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trade.date}</span>
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">₹{trade.amount.toLocaleString()}</span>
                                        </div>
                                        {trade.outcome && (
                                            <span className={`text-[10px] font-bold ${trade.outcome === 'profit' ? 'text-emerald-500' : trade.outcome === 'loss' ? 'text-rose-500' : 'text-slate-400'}`}>
                                                {trade.outcome === 'profit' ? '✓ Profit' : trade.outcome === 'loss' ? '✗ Loss' : '⏳ Pending'}
                                            </span>
                                        )}
                                    </div>
                                    {trade.notes && <p className="text-[10px] text-slate-400 mt-2 italic">"{trade.notes}"</p>}
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="space-y-3">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-500" /> AI Trading Psychology
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                    <p className="text-xs font-bold text-amber-500 mb-1">⚠️ FOMO Pattern Detected</p>
                                    <p className="text-[10px] text-slate-500">Your "greedy" trades have 75% loss rate. Consider waiting 24hrs before acting on FOMO impulses.</p>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                    <p className="text-xs font-bold text-emerald-500 mb-1">✓ Confidence Works</p>
                                    <p className="text-[10px] text-slate-500">Trades made when "confident" have an 80% success rate. Trust your research-backed decisions.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Emotion Distribution</h3>
                            <div className="grid grid-cols-4 gap-2">
                                {Object.entries(emotionIcons).map(([emotion, config]) => {
                                    const count = MOCK_TRADES.filter(t => t.emotion === emotion).length;
                                    const Icon = config.icon;
                                    return (
                                        <div key={emotion} className="text-center">
                                            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${config.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <p className="text-[10px] capitalize text-slate-500 mt-1">{emotion}</p>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">{count}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'streaks' && (
                    <div className="space-y-3">
                        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl border border-amber-500/20 p-5 text-center">
                            <p className="text-4xl mb-2">🔥</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">3 Day Streak</p>
                            <p className="text-xs text-slate-500 mt-1">You've logged trades 3 days in a row!</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Achievements</h3>
                            <div className="space-y-2">
                                {[
                                    { badge: '🏅', title: 'First Trade Logged', done: true },
                                    { badge: '📝', title: '10 Trades Journaled', done: false },
                                    { badge: '🎯', title: '5 Profitable Trades', done: false },
                                    { badge: '🧘', title: 'Zero FOMO for 7 Days', done: false },
                                ].map((ach, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${ach.done ? 'bg-emerald-500/5' : 'bg-slate-50 dark:bg-slate-950'}`}>
                                        <span className="text-lg">{ach.badge}</span>
                                        <span className={`text-xs font-medium flex-1 ${ach.done ? 'text-emerald-500' : 'text-slate-500'}`}>{ach.title}</span>
                                        {ach.done && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
