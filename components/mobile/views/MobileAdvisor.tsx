import React, { useState } from 'react';
import {
    Brain, MessageCircle, Send, Sparkles, TrendingUp, Target,
    PieChart, Shield, AlertTriangle, CheckCircle, Zap, Clock,
    DollarSign, BarChart3, Lightbulb, ArrowRight, User, Bot
} from 'lucide-react';
import { usePortfolioStore } from '../../../store/portfolioStore';

interface ChatMessage {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
}

const QUICK_PROMPTS = [
    { label: 'Portfolio Review', prompt: 'Review my portfolio and suggest improvements', icon: PieChart },
    { label: 'Tax Strategy', prompt: 'What tax-saving strategies should I consider?', icon: DollarSign },
    { label: 'Risk Assessment', prompt: 'Analyze my portfolio risk and suggest hedging', icon: Shield },
    { label: 'Goal Planning', prompt: 'Help me plan my financial goals', icon: Target },
    { label: 'Market Outlook', prompt: 'What is the current market outlook for India?', icon: BarChart3 },
    { label: 'SIP Optimization', prompt: 'How can I optimize my SIP investments?', icon: TrendingUp },
];

export const MobileAdvisor: React.FC = () => {
    const { stats, investments } = usePortfolioStore();
    const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'actions'>('chat');
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1', role: 'ai', timestamp: new Date().toISOString(),
            content: `Welcome! I'm your AI Financial Advisor. Your portfolio is worth ₹${(stats.totalCurrent || 0).toLocaleString('en-IN')} with ${investments.filter(i => !i.isHiddenFromTotals).length} active holdings. How can I help you today?`
        }
    ]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toISOString() };
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(), role: 'ai', timestamp: new Date().toISOString(),
            content: `That's a great question about "${text.substring(0, 40)}...". Based on your portfolio of ₹${(stats.totalCurrent || 0).toLocaleString('en-IN')} across ${investments.filter(i => !i.isHiddenFromTotals).length} holdings, I'd recommend diversifying further and maintaining a consistent SIP strategy. Would you like me to elaborate on any specific aspect?`
        };
        setMessages(prev => [...prev, userMsg, aiMsg]);
        setChatInput('');
    };

    const formatCurrency = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

    return (
        <div className="pb-24 flex flex-col h-full">
            {/* Tabs */}
            <div className="px-4 pt-3 pb-2 flex gap-1 border-b border-slate-200 dark:border-slate-800">
                {(['chat', 'insights', 'actions'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-bold capitalize rounded-lg transition-all ${activeTab === tab ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col px-4">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto py-4 space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-indigo-500" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] rounded-2xl p-3 text-xs ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-tl-sm'}`}>
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-slate-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Quick Prompts */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {QUICK_PROMPTS.slice(0, 4).map((qp, i) => (
                            <button key={i} onClick={() => sendMessage(qp.prompt)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-500 font-bold whitespace-nowrap hover:bg-indigo-500/20 transition-colors">
                                <qp.icon className="w-3 h-3" /> {qp.label}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2 py-3">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage(chatInput)}
                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Ask your advisor..." />
                        <button onClick={() => sendMessage(chatInput)}
                            className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className="px-4 py-4 space-y-3 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" /> AI Insights
                        </h3>
                        <div className="space-y-3">
                            {[
                                { title: 'Diversification Gap', desc: 'Your portfolio is heavily concentrated. Consider adding international funds.', severity: 'warning' as const },
                                { title: 'SIP Consistency', desc: 'Great job maintaining consistent SIPs! Keep it up for long-term wealth creation.', severity: 'success' as const },
                                { title: 'Tax Harvesting Opportunity', desc: `You have potential tax-saving opportunities worth ${formatCurrency(stats.totalCurrent * 0.02)}.`, severity: 'info' as const },
                                { title: 'Emergency Fund', desc: 'Ensure you have 6 months of expenses in liquid assets before aggressive investing.', severity: 'warning' as const },
                            ].map((insight, i) => (
                                <div key={i} className={`p-3 rounded-lg border ${insight.severity === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : insight.severity === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-indigo-500/5 border-indigo-500/20'}`}>
                                    <p className={`text-xs font-bold mb-1 ${insight.severity === 'warning' ? 'text-amber-500' : insight.severity === 'success' ? 'text-emerald-500' : 'text-indigo-500'}`}>{insight.title}</p>
                                    <p className="text-[10px] text-slate-500">{insight.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'actions' && (
                <div className="px-4 py-4 space-y-3 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-indigo-500" /> Recommended Actions
                        </h3>
                        <div className="space-y-2">
                            {[
                                { action: 'Increase SIP by 10%', impact: 'High', reason: 'Annual step-up boosts corpus by 40% over 10 years' },
                                { action: 'Add Gold ETF (5% allocation)', impact: 'Medium', reason: 'Reduces portfolio volatility' },
                                { action: 'Start Debt Fund SIP', impact: 'Medium', reason: 'Better than FD, tax efficient after 3 years' },
                                { action: 'Review insurance coverage', impact: 'High', reason: 'Term insurance gap detected' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.impact === 'High' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.action}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{item.reason}</p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.impact === 'High' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>{item.impact}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
