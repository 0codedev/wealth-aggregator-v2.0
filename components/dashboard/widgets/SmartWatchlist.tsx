import React, { useState, useMemo, useCallback } from 'react';
import {
    Eye, Plus, Trash2, TrendingUp, TrendingDown, Target,
    AlertTriangle, ChevronDown, ChevronUp, Crosshair, Activity
} from 'lucide-react';
import { generateSignals, getSignalColor, type TechnicalSignals } from '../../../utils/technicalAnalysis';

// ============================
// Types
// ============================
interface WatchlistItem {
    id: string;
    ticker: string;
    name: string;
    currentPrice: number;
    targetBuyPrice: number;
    targetSellPrice?: number;
    priceHistory: number[]; // Historical close prices (last 200+ days)
    addedAt: string;
    notes?: string;
}

interface SmartWatchlistProps {
    isPrivacyMode?: boolean;
}

// ============================
// Mock data for demonstration
// ============================
const DEMO_WATCHLIST: WatchlistItem[] = [
    {
        id: 'w1',
        ticker: 'RELIANCE',
        name: 'Reliance Industries',
        currentPrice: 2456,
        targetBuyPrice: 2300,
        targetSellPrice: 2800,
        priceHistory: generateMockPrices(2456, 200, 0.015),
        addedAt: '2025-12-01',
    },
    {
        id: 'w2',
        ticker: 'HDFCBANK',
        name: 'HDFC Bank',
        currentPrice: 1678,
        targetBuyPrice: 1550,
        targetSellPrice: 1900,
        priceHistory: generateMockPrices(1678, 200, 0.012),
        addedAt: '2025-11-15',
    },
    {
        id: 'w3',
        ticker: 'TCS',
        name: 'Tata Consultancy',
        currentPrice: 3890,
        targetBuyPrice: 3600,
        priceHistory: generateMockPrices(3890, 200, 0.018),
        addedAt: '2026-01-10',
    },
    {
        id: 'w4',
        ticker: 'INFY',
        name: 'Infosys',
        currentPrice: 1542,
        targetBuyPrice: 1450,
        targetSellPrice: 1750,
        priceHistory: generateMockPrices(1542, 200, 0.02),
        addedAt: '2026-01-20',
    },
];

function generateMockPrices(currentPrice: number, days: number, volatility: number): number[] {
    const prices: number[] = [];
    let price = currentPrice * (1 - Math.random() * 0.2 + 0.1);
    for (let i = 0; i < days; i++) {
        price *= (1 + (Math.random() - 0.48) * volatility);
        prices.push(Math.round(price * 100) / 100);
    }
    prices[prices.length - 1] = currentPrice;
    return prices;
}

// ============================
// Signal Badge Subcomponent
// ============================
const SignalBadge: React.FC<{ signal: TechnicalSignals['signal']; score: number }> = ({ signal, score }) => {
    const color = getSignalColor(signal);
    const label = signal.replace('_', ' ');

    return (
        <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{
                color,
                backgroundColor: `${color}15`,
                border: `1px solid ${color}30`,
            }}
        >
            {label}
        </span>
    );
};

// ============================
// Entry Zone Gauge Subcomponent
// ============================
const EntryZoneGauge: React.FC<{
    currentPrice: number;
    targetBuy: number;
    targetSell?: number;
}> = ({ currentPrice, targetBuy, targetSell }) => {
    const range = targetSell
        ? targetSell - targetBuy
        : targetBuy * 0.3; // If no sell target, use 30% range

    const low = targetBuy - range * 0.2;
    const high = targetSell || targetBuy + range * 1.2;
    const clampedRange = high - low;
    const position = clampedRange > 0
        ? Math.max(0, Math.min(100, ((currentPrice - low) / clampedRange) * 100))
        : 50;

    const buyZonePosition = clampedRange > 0
        ? Math.max(0, Math.min(100, ((targetBuy - low) / clampedRange) * 100))
        : 30;

    // Determine zone color
    let zoneColor = '#f59e0b'; // Neutral/yellow
    if (currentPrice <= targetBuy) zoneColor = '#10b981'; // Green = in buy zone
    else if (targetSell && currentPrice >= targetSell) zoneColor = '#ef4444'; // Red = sell zone

    return (
        <div className="mt-2 space-y-1">
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Buy zone indicator */}
                <div
                    className="absolute top-0 left-0 h-full bg-emerald-500/20 rounded-l-full"
                    style={{ width: `${buyZonePosition}%` }}
                />
                {/* Current price indicator */}
                <div
                    className="absolute top-0 w-3 h-3 -mt-0.5 rounded-full border-2 shadow-lg transition-all duration-500"
                    style={{
                        left: `${position}%`,
                        transform: 'translateX(-50%)',
                        backgroundColor: zoneColor,
                        borderColor: `${zoneColor}80`,
                        boxShadow: `0 0 8px ${zoneColor}60`
                    }}
                />
            </div>
            <div className="flex justify-between text-[9px] text-white/30">
                <span>₹{targetBuy.toLocaleString('en-IN')}</span>
                <span className="text-white/50 font-medium">₹{currentPrice.toLocaleString('en-IN')}</span>
                {targetSell && <span>₹{targetSell.toLocaleString('en-IN')}</span>}
            </div>
        </div>
    );
};

// ============================
// Mini Sparkline
// ============================
const MiniSparkline: React.FC<{ prices: number[]; width?: number; height?: number }> = ({
    prices,
    width = 60,
    height = 24,
}) => {
    if (prices.length < 2) return null;

    const recent = prices.slice(-30); // Last 30 data points
    const min = Math.min(...recent);
    const max = Math.max(...recent);
    const range = max - min || 1;

    const points = recent.map((p, i) => {
        const x = (i / (recent.length - 1)) * width;
        const y = height - ((p - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const isUp = recent[recent.length - 1] >= recent[0];

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={isUp ? '#10b981' : '#ef4444'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

// ============================
// Add Item Form
// ============================
const AddWatchlistForm: React.FC<{
    onAdd: (item: Omit<WatchlistItem, 'id' | 'priceHistory' | 'addedAt'>) => void;
    onCancel: () => void;
}> = ({ onAdd, onCancel }) => {
    const [ticker, setTicker] = useState('');
    const [name, setName] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [targetBuyPrice, setTargetBuyPrice] = useState('');
    const [targetSellPrice, setTargetSellPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticker || !currentPrice || !targetBuyPrice) return;

        onAdd({
            ticker: ticker.toUpperCase(),
            name: name || ticker.toUpperCase(),
            currentPrice: parseFloat(currentPrice),
            targetBuyPrice: parseFloat(targetBuyPrice),
            targetSellPrice: targetSellPrice ? parseFloat(targetSellPrice) : undefined,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 rounded-xl p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="text"
                    placeholder="Ticker (e.g. RELIANCE)"
                    value={ticker}
                    onChange={e => setTicker(e.target.value)}
                    className="bg-white/10 text-white text-xs rounded-lg px-3 py-2 border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Company Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-white/10 text-white text-xs rounded-lg px-3 py-2 border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                />
            </div>
            <div className="grid grid-cols-3 gap-2">
                <input
                    type="number"
                    placeholder="Current ₹"
                    value={currentPrice}
                    onChange={e => setCurrentPrice(e.target.value)}
                    className="bg-white/10 text-white text-xs rounded-lg px-3 py-2 border border-white/10 focus:border-cyan-500/50 focus:outline-none"
                    required
                />
                <input
                    type="number"
                    placeholder="Buy Zone ₹"
                    value={targetBuyPrice}
                    onChange={e => setTargetBuyPrice(e.target.value)}
                    className="bg-white/10 text-white text-xs rounded-lg px-3 py-2 border border-emerald-500/30 focus:border-emerald-500/50 focus:outline-none"
                    required
                />
                <input
                    type="number"
                    placeholder="Sell Zone ₹"
                    value={targetSellPrice}
                    onChange={e => setTargetSellPrice(e.target.value)}
                    className="bg-white/10 text-white text-xs rounded-lg px-3 py-2 border border-red-500/30 focus:border-red-500/50 focus:outline-none"
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="flex-1 text-xs py-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors font-medium"
                >
                    Add to Watchlist
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs px-3 py-2 rounded-lg bg-white/5 text-white/40 hover:text-white/60 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

// ============================
// Main Smart Watchlist Widget
// ============================
const SmartWatchlist: React.FC<SmartWatchlistProps> = ({ isPrivacyMode = false }) => {
    const [items, setItems] = useState<WatchlistItem[]>(DEMO_WATCHLIST);
    const [showAddForm, setShowAddForm] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'score' | 'name' | 'distance'>('score');

    // Calculate signals for all items
    const itemsWithSignals = useMemo(() => {
        return items.map(item => ({
            ...item,
            signals: generateSignals(item.priceHistory),
            distanceToBuy: ((item.currentPrice - item.targetBuyPrice) / item.targetBuyPrice) * 100,
        }));
    }, [items]);

    // Sort items
    const sortedItems = useMemo(() => {
        const sorted = [...itemsWithSignals];
        switch (sortBy) {
            case 'score': return sorted.sort((a, b) => b.signals.score - a.signals.score);
            case 'name': return sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
            case 'distance': return sorted.sort((a, b) => a.distanceToBuy - b.distanceToBuy);
        }
    }, [itemsWithSignals, sortBy]);

    // Stats
    const buyZoneCount = itemsWithSignals.filter(i => i.currentPrice <= i.targetBuyPrice).length;
    const bullishCount = itemsWithSignals.filter(i =>
        i.signals.signal === 'STRONG_BUY' || i.signals.signal === 'BUY'
    ).length;

    const handleAddItem = useCallback((newItem: Omit<WatchlistItem, 'id' | 'priceHistory' | 'addedAt'>) => {
        const item: WatchlistItem = {
            ...newItem,
            id: `w_${Date.now()}`,
            priceHistory: generateMockPrices(newItem.currentPrice, 200, 0.015),
            addedAt: new Date().toISOString().split('T')[0],
        };
        setItems(prev => [...prev, item]);
        setShowAddForm(false);
    }, []);

    const handleRemove = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    return (
        <div className="glass-card p-5 rounded-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20">
                        <Crosshair className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Smart Watchlist</h3>
                        <p className="text-[10px] text-white/40">
                            {items.length} assets · {buyZoneCount} in buy zone
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-xl p-2.5 text-center">
                    <div className="text-[10px] text-white/40">Tracking</div>
                    <div className="text-lg font-bold text-white">{items.length}</div>
                </div>
                <div className="bg-emerald-500/5 rounded-xl p-2.5 text-center border border-emerald-500/10">
                    <div className="text-[10px] text-emerald-400/60">Buy Zone</div>
                    <div className="text-lg font-bold text-emerald-400">{buyZoneCount}</div>
                </div>
                <div className="bg-cyan-500/5 rounded-xl p-2.5 text-center">
                    <div className="text-[10px] text-cyan-400/60">Bullish</div>
                    <div className="text-lg font-bold text-cyan-400">{bullishCount}</div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {([
                    { key: 'score', label: 'By Signal' },
                    { key: 'distance', label: 'By Entry' },
                    { key: 'name', label: 'A-Z' },
                ] as const).map(opt => (
                    <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`flex-1 text-xs py-1.5 rounded-lg transition-all font-medium ${sortBy === opt.key
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Add Form */}
            {showAddForm && (
                <AddWatchlistForm
                    onAdd={handleAddItem}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* Watchlist Items */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {sortedItems.map(item => {
                    const isExpanded = expandedId === item.id;
                    const inBuyZone = item.currentPrice <= item.targetBuyPrice;
                    const inSellZone = item.targetSellPrice && item.currentPrice >= item.targetSellPrice;

                    return (
                        <div
                            key={item.id}
                            className={`bg-white/5 rounded-xl p-3 transition-all cursor-pointer hover:bg-white/8 ${inBuyZone ? 'ring-1 ring-emerald-500/20' : ''
                                } ${inSellZone ? 'ring-1 ring-red-500/20' : ''}`}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                            {/* Main Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-white">{item.ticker}</span>
                                            <SignalBadge signal={item.signals.signal} score={item.signals.score} />
                                        </div>
                                        <span className="text-[10px] text-white/40">{item.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MiniSparkline prices={item.priceHistory} />
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">
                                            {isPrivacyMode ? '•••' : `₹${item.currentPrice.toLocaleString('en-IN')}`}
                                        </div>
                                        <div className={`text-[10px] font-medium ${item.distanceToBuy <= 0 ? 'text-emerald-400' : 'text-white/40'
                                            }`}>
                                            {item.distanceToBuy <= 0
                                                ? '✅ In Buy Zone'
                                                : `${item.distanceToBuy.toFixed(1)}% above target`
                                            }
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-3 h-3 text-white/30" /> : <ChevronDown className="w-3 h-3 text-white/30" />}
                                </div>
                            </div>

                            {/* Entry Zone Gauge */}
                            <EntryZoneGauge
                                currentPrice={item.currentPrice}
                                targetBuy={item.targetBuyPrice}
                                targetSell={item.targetSellPrice}
                            />

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                    {/* Technical Indicators */}
                                    <div className="grid grid-cols-4 gap-2 text-center">
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-[9px] text-white/40">RSI (14)</div>
                                            <div className={`text-xs font-bold ${item.signals.rsi14 !== null
                                                ? item.signals.rsi14 < 30 ? 'text-emerald-400'
                                                    : item.signals.rsi14 > 70 ? 'text-red-400'
                                                        : 'text-white'
                                                : 'text-white/30'
                                                }`}>
                                                {item.signals.rsi14?.toFixed(1) ?? '—'}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-[9px] text-white/40">SMA 200</div>
                                            <div className="text-xs font-bold text-white">
                                                {item.signals.sma200
                                                    ? `₹${Math.round(item.signals.sma200).toLocaleString('en-IN')}`
                                                    : '—'
                                                }
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-[9px] text-white/40">52W High</div>
                                            <div className={`text-xs font-bold ${item.signals.percentFromHigh > -5 ? 'text-amber-400' : 'text-white'
                                                }`}>
                                                {item.signals.percentFromHigh.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-[9px] text-white/40">Score</div>
                                            <div className={`text-xs font-bold`} style={{ color: getSignalColor(item.signals.signal) }}>
                                                {item.signals.score}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bollinger Band Position */}
                                    {item.signals.bollingerLower && item.signals.bollingerUpper && (
                                        <div className="bg-white/5 rounded-lg p-2 flex items-center justify-between">
                                            <span className="text-[10px] text-white/40">Bollinger Bands</span>
                                            <span className="text-[10px] text-white/60">
                                                ₹{Math.round(item.signals.bollingerLower).toLocaleString('en-IN')} — ₹{Math.round(item.signals.bollingerUpper).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={e => { e.stopPropagation(); handleRemove(item.id); }}
                                            className="text-[10px] px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                        {inBuyZone && (
                                            <button
                                                onClick={e => e.stopPropagation()}
                                                className="text-[10px] px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                                            >
                                                <Target className="w-3 h-3" /> Set Alert
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {items.length === 0 && !showAddForm && (
                <div className="text-center py-8">
                    <Eye className="w-8 h-8 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40">No assets in watchlist</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        + Add your first asset
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(SmartWatchlist);
