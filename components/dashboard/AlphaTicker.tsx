
import React, { useState, useEffect, useCallback } from 'react';
import { Zap, AlertTriangle, ArrowUpRight, ArrowDownRight, Wifi, WifiOff } from 'lucide-react';
import { fetchIndianIndices, fetchIndiaVIX, hasAnyApiKey } from '../../services/RealDataService';
import { logger } from '../../services/Logger';

interface TickerItem {
    id: string;
    type: 'MARKET' | 'INSIGHT' | 'ALERT';
    text: string;
    value?: string;
    change?: number; // percentage
    isLive?: boolean;
}

// Fallback mock data
const MOCK_TICKER_ITEMS: TickerItem[] = [
    { id: '1', type: 'MARKET', text: 'NIFTY 50', value: '24,850', change: 0.45, isLive: false },
    { id: '2', type: 'MARKET', text: 'SENSEX', value: '81,200', change: -0.12, isLive: false },
    { id: '3', type: 'INSIGHT', text: 'Tech sector showing overbought signals (RSI > 75)', change: 0 },
    { id: '4', type: 'ALERT', text: 'HDFC Bank crossed 52-week high', change: 1.2 },
    { id: '5', type: 'MARKET', text: 'INDIA VIX', value: '14.20', change: -0.5, isLive: false },
    { id: '6', type: 'INSIGHT', text: 'Midcap index outperforming large caps by 2.5% this week', change: 0 },
    { id: '7', type: 'ALERT', text: 'SIP deducted for "Retirement Goal": ₹25,000', change: 0 },
];

// Format number for display
function formatPrice(value: number): string {
    if (value >= 10000) {
        return value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    }
    return value.toFixed(2);
}

export const AlphaTicker: React.FC = () => {
    const [tickerItems, setTickerItems] = useState<TickerItem[]>(MOCK_TICKER_ITEMS);
    const [isLiveData, setIsLiveData] = useState(false);

    const fetchLiveData = useCallback(async () => {
        try {
            const hasKeys = hasAnyApiKey();
            logger.debug('AlphaTicker: Fetching data, has API keys:', hasKeys);

            // Fetch indices and VIX
            const [indices, vix] = await Promise.all([
                fetchIndianIndices(),
                fetchIndiaVIX()
            ]);

            // Check if we got live data
            const hasLiveData = indices.some(i => i.source !== 'mock') || vix.source !== 'mock';
            setIsLiveData(hasLiveData);

            // Build new ticker items
            const newItems: TickerItem[] = [];

            // Add indices
            for (const quote of indices) {
                newItems.push({
                    id: quote.symbol,
                    type: 'MARKET',
                    text: quote.name,
                    value: formatPrice(quote.price),
                    change: quote.changePercent,
                    isLive: quote.source !== 'mock'
                });
            }

            // Add VIX
            newItems.push({
                id: 'indiavix',
                type: 'MARKET',
                text: 'INDIA VIX',
                value: formatPrice(vix.value),
                change: vix.change,
                isLive: vix.source !== 'mock'
            });

            // Keep insights and alerts from mock data
            // In a real app, these would also come from a live source or AI analysis
            const staticItems = MOCK_TICKER_ITEMS.filter(item => item.type !== 'MARKET');

            setTickerItems([...newItems, ...staticItems]);
            logger.debug(`AlphaTicker: Updated with ${newItems.length} market items, live: ${hasLiveData}`);
        } catch (error) {
            logger.warn('AlphaTicker: Failed to fetch live data', error);
            // Keep current items on error
        }
    }, []);

    // Initial fetch and refresh interval
    useEffect(() => {
        fetchLiveData();

        // Refresh every 5 minutes
        const interval = setInterval(fetchLiveData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchLiveData]);

    return (
        <div className="w-full bg-slate-950 text-white overflow-hidden py-2 border-b border-indigo-500/20 relative z-40">
            {/* Live indicator */}
            <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 bg-gradient-to-r from-slate-950 to-transparent">
                {isLiveData ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Live</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800/50 rounded-full border border-slate-700">
                        <WifiOff size={10} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Offline</span>
                    </div>
                )}
            </div>

            {/* Fade Out Edge */}
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

            {/* Marquee Content */}
            <div className="flex whitespace-nowrap animate-ticker hover:[animation-play-state:paused] ml-24">
                {/* Triple the items for smoother seamless loop on wide screens */}
                {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center gap-2 mx-8 text-xs font-mono group cursor-default transition-colors hover:text-white">
                        {item.type === 'MARKET' && (
                            <span className="flex items-center gap-2">
                                <span className="font-bold text-slate-400 group-hover:text-white transition-colors">{item.text}</span>
                                <span className={`font-medium ${item.change && item.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {item.value}
                                </span>
                                {item.change !== undefined && (
                                    <span className={`flex items-center px-1.5 py-0.5 rounded ${item.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {item.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                        {Math.abs(item.change).toFixed(2)}%
                                    </span>
                                )}
                            </span>
                        )}

                        {item.type === 'INSIGHT' && (
                            <span className="flex items-center gap-1.5 text-indigo-300/80 group-hover:text-indigo-300">
                                <Zap size={12} className="text-yellow-400 fill-yellow-400" />
                                <span>{item.text}</span>
                            </span>
                        )}

                        {item.type === 'ALERT' && (
                            <span className="flex items-center gap-1.5 text-slate-400 group-hover:text-slate-300">
                                <AlertTriangle size={12} className="text-amber-500" />
                                <span>{item.text}</span>
                                {item.change && item.change > 0 && (
                                    <span className="text-emerald-400 flex items-center">
                                        <ArrowUpRight size={12} /> {item.change}%
                                    </span>
                                )}
                            </span>
                        )}

                        <span className="text-slate-800 ml-6 select-none opacity-20">|</span>
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); } /* Move 1/3 since we tripled content */
                }
                .animate-ticker {
                    animation: ticker 60s linear infinite;
                    will-change: transform;
                }
            `}</style>
        </div>
    );
};
