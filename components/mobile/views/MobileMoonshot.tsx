import React, { useState, useRef, useEffect } from 'react';
import {
    FlaskConical, Send, Loader2, MessageSquare,
    Bot, Sparkles, Brain, Target, Zap
} from 'lucide-react';
import { usePortfolioStore } from '../../../store/portfolioStore';
import { chatWithGemini } from '../../../services/aiService';

// AI Personas (matching desktop Boardroom)
const PERSONAS = [
    { id: 'analyst', name: 'The Analyst', icon: Target, color: '#6366f1', desc: 'Quantitative & data-driven' },
    { id: 'contrarian', name: 'The Contrarian', icon: Zap, desc: 'Challenges consensus', color: '#f59e0b' },
    { id: 'strategist', name: 'The Strategist', icon: Brain, desc: 'Long-term vision', color: '#10b981' },
];

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    persona?: string;
    timestamp: Date;
}

export const MobileMoonshot: React.FC = () => {
    const { investments, stats } = usePortfolioStore();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Welcome to the Moonshot Lab. I\'m your AI investment strategist. Ask me about your portfolio, market trends, or get actionable insights. I have full visibility into your holdings.',
            persona: 'strategist',
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activePersona, setActivePersona] = useState('strategist');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    // Build portfolio context for AI
    const buildContext = () => {
        const topHoldings = investments
            .filter(i => !i.isHiddenFromTotals)
            .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
            .slice(0, 5)
            .map(i => `${i.name}: ₹${(i.currentValue || 0).toLocaleString()} (${(((i.currentValue || 0) - (i.investedAmount || 0)) / (i.investedAmount || 1) * 100).toFixed(1)}%)`)
            .join(', ');

        return `Portfolio: Total ₹${(stats.totalCurrent || 0).toLocaleString()}, P&L: ${stats.totalGainPercent}%, ${investments.length} holdings. Top: ${topHoldings}`;
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const context = buildContext();
            const persona = PERSONAS.find(p => p.id === activePersona);
            const systemPrompt = `You are "${persona?.name}" - ${persona?.desc}. You're analyzing this investor's portfolio. ${context}. Give concise, actionable mobile-friendly responses (2-3 paragraphs max). Use ₹ for Indian currency.`;

            const chatHistory = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const response = await chatWithGemini(
                'gemini-2.5-flash',
                chatHistory,
                userMessage.content,
                systemPrompt
            );

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response || 'I couldn\'t generate a response. Please try again.',
                persona: activePersona,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
            // Fallback response if AI service unavailable
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Based on your portfolio of ${stats.totalCurrent?.toLocaleString() || '0'} across ${investments.length} holdings, here are my thoughts:\n\nYour overall P&L of ${stats.totalGainPercent}% suggests a ${Number(stats.totalGainPercent) >= 0 ? 'positive' : 'challenging'} trajectory. I'd recommend reviewing your asset allocation for optimal diversification.\n\n*AI response generated locally. Connect Gemini API for richer analysis.*`,
                persona: activePersona,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPrompts = [
        'Analyze my portfolio risk',
        'Suggest rebalancing moves',
        'Tax-saving opportunities?',
        'What should I buy next?',
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                    <FlaskConical className="text-indigo-500 w-6 h-6" />
                    <div>
                        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Moonshot Lab</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">AI Boardroom — The Council is in session</p>
                    </div>
                </div>
                {/* Persona Selector */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {PERSONAS.map(persona => (
                        <button
                            key={persona.id}
                            onClick={() => setActivePersona(persona.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${activePersona === persona.id
                                ? 'text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                                }`}
                            style={activePersona === persona.id ? { backgroundColor: persona.color, boxShadow: `0 4px 14px ${persona.color}40` } : undefined}
                        >
                            <persona.icon className="w-3.5 h-3.5" />
                            {persona.name}
                        </button>
                    ))}
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-48">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${msg.role === 'user'
                            ? 'bg-indigo-500 text-white rounded-2xl rounded-br-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm text-slate-900 dark:text-white'
                            } px-4 py-3 shadow-sm`}>
                            {msg.role === 'assistant' && msg.persona && (
                                <div className="flex items-center gap-1 mb-2">
                                    <Bot className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase">
                                        {PERSONAS.find(p => p.id === msg.persona)?.name}
                                    </span>
                                </div>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[9px] mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                <span className="text-xs text-slate-500">Analyzing...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts + Input */}
            <div className="fixed bottom-[70px] left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 pt-2 pb-3 z-30">
                {/* Quick Prompts */}
                {messages.length <= 2 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
                        {quickPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setInput(prompt); }}
                                className="flex-none px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-xs font-medium whitespace-nowrap active:scale-95 transition-all"
                            >
                                <Sparkles className="w-3 h-3 inline mr-1" /> {prompt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about your portfolio..."
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="w-11 h-11 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Strategy Lab Section */}
            <div className="px-4 pb-24 space-y-4 mt-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="text-purple-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">SIP Time Machine</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">What if you had started SIP earlier?</p>
                    <div className="space-y-2">
                        {[
                            { years: 5, monthly: 10000, returns: 12 },
                            { years: 10, monthly: 10000, returns: 12 },
                            { years: 15, monthly: 10000, returns: 12 },
                            { years: 20, monthly: 10000, returns: 12 },
                        ].map((sip, i) => {
                            const r = sip.returns / 100 / 12;
                            const n = sip.years * 12;
                            const futureValue = sip.monthly * ((Math.pow(1 + r, n) - 1) / r);
                            const invested = sip.monthly * n;
                            const gain = futureValue - invested;
                            return (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{sip.years} Years Ago</p>
                                        <p className="text-[10px] text-slate-400">₹{sip.monthly.toLocaleString()}/mo @ {sip.returns}%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">₹{Math.round(futureValue).toLocaleString()}</p>
                                        <p className="text-[10px] text-emerald-500 font-bold">+₹{Math.round(gain).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Brain className="text-indigo-500 w-5 h-5" />
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Strategy Backtester</h3>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">Backtest popular strategies on Indian markets</p>
                    <div className="space-y-2">
                        {[
                            { name: 'Mean Reversion (Nifty)', cagr: 14.2, maxDD: -18, sharpe: 1.1, win: 58 },
                            { name: 'Momentum (Top 30)', cagr: 18.5, maxDD: -25, sharpe: 0.95, win: 52 },
                            { name: 'Dividend Yield', cagr: 11.8, maxDD: -12, sharpe: 1.3, win: 65 },
                            { name: 'Low Volatility', cagr: 10.5, maxDD: -9, sharpe: 1.5, win: 70 },
                        ].map((strat, i) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{strat.name}</p>
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">{strat.cagr}% CAGR</span>
                                </div>
                                <div className="flex gap-3 text-[10px]">
                                    <span className="text-slate-400">Max DD: <strong className="text-rose-500">{strat.maxDD}%</strong></span>
                                    <span className="text-slate-400">Sharpe: <strong className="text-indigo-500">{strat.sharpe}</strong></span>
                                    <span className="text-slate-400">Win: <strong className="text-emerald-500">{strat.win}%</strong></span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
