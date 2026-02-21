import React, { useState, useEffect } from 'react';
import { LayoutGrid, Eye, EyeOff, Check, RotateCcw, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, layoutTactileHover, springTransition } from '../ui/animations';
import { LazyWidgetWrapper } from './LazyWidgetWrapper';

interface DashboardGridProps {
    renderWidget: (id: string) => React.ReactNode;
}

// Default layout spans (1 = 1/3 width, 2 = 2/3 width, 3 = Full width)
const DEFAULT_SPANS: Record<string, number> = {
    'project-5l': 3,
    'fortress-hub': 3,
    'calendar': 3,
    'wealth-simulator': 3,
    'milestone-timeline': 3,
    'runway-gauge': 3,
    'liability-watchdog': 3,
    'heatmap': 3,
    'alerts-widget': 3,
    // Hubs generally full width
    'smart-actions-widget': 3,
    // Mid-size
    'tax-harvesting': 2,
    'ai-copilot': 2,
    'fire-dashboard': 2,
    'correlation-matrix': 2,
    'rebalancing-wizard': 2,
    'goal-thermometer': 2,
    // Power User Widgets
    'xirr-time-machine': 2,
    'smart-watchlist': 2,
    'dividend-calendar': 2,
    // Moonshot Widgets
    'portfolio-constellation': 2,
    'black-swan-war-room': 2,
    'wealth-time-capsule': 2,
    // Defaults to 1 (Standard Widgets)
};

const AVAILABLE_WIDGETS = [
    // Row 1: Top KPIs
    { id: 'total-pl', label: 'Portfolio Summary', default: true },
    { id: 'top-performer', label: 'Top Performer', default: true },
    { id: 'total-holdings', label: 'Total Holdings', default: true },
    // Row 2: Tax & Liabilities
    { id: 'tax-harvesting', label: 'Tax Alpha', default: true },
    { id: 'loan-widget', label: 'Liabilities', default: true },
    // Row 3: Quick Actions
    { id: 'spending-widget', label: 'Spending Trend', default: true },
    { id: 'market-widget', label: 'Market Insights', default: true },
    { id: 'community-widget', label: 'Community', default: true },
    // Row 4: Growth & AI
    { id: 'fire-dashboard', label: 'FIRE Progress', default: true },
    { id: 'ai-copilot', label: 'AI Copilot', default: true },
    // Row 5: Planning
    { id: 'project-5l', label: 'Project 5L', default: true },
    { id: 'alerts-widget', label: 'Smart Alerts', default: true },
    // Row 6: Charts
    { id: 'exposure-chart', label: 'Asset Exposure', default: true },
    { id: 'platform-chart', label: 'Platform Split', default: true },
    { id: 'rebalancing-wizard', label: 'Rebalancing', default: true },
    // Row 7: Calendar
    { id: 'calendar', label: 'Financial Calendar', default: true },
    // Row 8: Analysis
    { id: 'heatmap', label: 'Market Heatmap', default: true },
    { id: 'runway-gauge', label: 'Runway Gauge', default: true },
    { id: 'liability-watchdog', label: 'Liability Watchdog', default: true },
    // Row 9: Goals
    { id: 'goal-thermometer', label: 'Goal Thermometer', default: true },
    { id: 'milestone-timeline', label: 'Milestone Timeline', default: true },
    // Row 10: Advanced
    { id: 'fortress-hub', label: 'Fortress Hub', default: true },
    { id: 'wealth-simulator', label: 'Wealth Simulator', default: true },
    // Power User Widgets
    { id: 'xirr-time-machine', label: 'XIRR Time-Machine', default: true },
    { id: 'smart-watchlist', label: 'Smart Watchlist', default: true },
    { id: 'dividend-calendar', label: 'Dividend Hub', default: true },
    // Moonshot Widgets
    { id: 'portfolio-constellation', label: 'Portfolio Constellation', default: true },
    { id: 'black-swan-war-room', label: 'Black Swan War Room', default: true },
    { id: 'wealth-time-capsule', label: 'Time Capsule', default: true },
];

export const DashboardGrid: React.FC<DashboardGridProps> = ({ renderWidget }) => {
    const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
        const savedOrder = localStorage.getItem('dash_widget_order_v4');
        return savedOrder ? JSON.parse(savedOrder) : AVAILABLE_WIDGETS.map(w => w.id);
    });
    const [hiddenWidgets, setHiddenWidgets] = useState<string[]>(() => {
        const savedHidden = localStorage.getItem('dash_hidden_widgets_v4');
        return savedHidden ? JSON.parse(savedHidden) : [];
    });
    const [widgetSpans, setWidgetSpans] = useState<Record<string, number>>(() => {
        const savedSpans = localStorage.getItem('dash_widget_spans_v1');
        return savedSpans ? JSON.parse(savedSpans) : DEFAULT_SPANS;
    });
    const [isCustomizing, setIsCustomizing] = useState(false);

    // Save needs to track AVAILABLE_WIDGETS changes if we want new defaults to show up, 
    // but for now we just load what's saved. If 'tax-harvesting' isn't in savedOrder, it won't show.
    // We might need to force append it if it's missing and we heavily rely on saved order.
    // Actually, line 70 maps AVAILABLE_WIDGETS if no saved order. 
    // If user has saved order, 'tax-harvesting' won't appear unless they reset.
    // I should inject it if missing from savedOrder.

    useEffect(() => {
        setWidgetOrder(prev => {
            if (prev.length === 0) return prev;
            if (!prev.includes('tax-harvesting')) {
                // Determine insertion index (e.g. after spending-widget)
                const spendIndex = prev.indexOf('spending-widget');
                const newOrder = [...prev];
                if (spendIndex !== -1) newOrder.splice(spendIndex + 1, 0, 'tax-harvesting');
                else newOrder.push('tax-harvesting');
                return newOrder;
            }
            return prev;
        })
    }, []);

    // Save
    useEffect(() => {
        if (widgetOrder.length > 0) localStorage.setItem('dash_widget_order_v4', JSON.stringify(widgetOrder));
        if (hiddenWidgets) localStorage.setItem('dash_hidden_widgets_v4', JSON.stringify(hiddenWidgets));
        if (Object.keys(widgetSpans).length > 0) localStorage.setItem('dash_widget_spans_v1', JSON.stringify(widgetSpans));
    }, [widgetOrder, hiddenWidgets, widgetSpans]);

    const moveWidget = (index: number, direction: 'UP' | 'DOWN') => {
        const newOrder = [...widgetOrder];
        if (direction === 'UP' && index > 0) {
            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
        } else if (direction === 'DOWN' && index < newOrder.length - 1) {
            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
        }
        setWidgetOrder(newOrder);
    };

    const toggleVisibility = (id: string) => {
        if (hiddenWidgets.includes(id)) {
            setHiddenWidgets(hiddenWidgets.filter(w => w !== id));
        } else {
            setHiddenWidgets([...hiddenWidgets, id]);
        }
    };

    const updateSpan = (id: string, span: number) => {
        setWidgetSpans(prev => ({ ...prev, [id]: span }));
    };

    const getSpanClass = (id: string) => {
        const span = widgetSpans[id] || DEFAULT_SPANS[id] || 1;
        if (span === 3) return 'md:col-span-3'; // Full width on desktop
        if (span === 2) return 'md:col-span-2'; // 2/3 width
        return 'md:col-span-1'; // 1/3 width
    };

    const restoreDefaults = () => {
        // Clear persisted data
        localStorage.removeItem('dash_widget_order_v2');
        localStorage.removeItem('dash_hidden_widgets_v2');
        localStorage.removeItem('dash_widget_spans_v1');

        // Reset to defaults
        setWidgetOrder(AVAILABLE_WIDGETS.map(w => w.id));
        setHiddenWidgets(AVAILABLE_WIDGETS.filter(w => !w.default).map(w => w.id));
        setWidgetSpans(DEFAULT_SPANS);
    };

    return (
        <div className="space-y-6">
            {/* Customization Toggle */}
            <div className="flex justify-end gap-2">
                {isCustomizing && (
                    <button
                        onClick={restoreDefaults}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm bg-white dark:bg-slate-900 text-slate-500 hover:text-amber-600 hover:shadow-md border border-slate-200 dark:border-slate-800"
                    >
                        <RotateCcw size={16} />
                        Restore Default
                    </button>
                )}
                <button
                    onClick={() => setIsCustomizing(!isCustomizing)}
                    className={`flex items - center gap - 2 px - 4 py - 2 rounded - full text - sm font - bold transition - all shadow - sm ${isCustomizing
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 dark:ring-indigo-900 shadow-indigo-200 dark:shadow-indigo-900/20'
                        : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 hover:shadow-md border border-slate-200 dark:border-slate-800'
                        } `}
                >
                    {isCustomizing ? <Check size={16} /> : <LayoutGrid size={16} />}
                    {isCustomizing ? 'Done Editing' : 'Customize Layout'}
                </button>
            </div>

            {/* Grid Area */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"
            >
                {widgetOrder.map((id, index) => {
                    const widgetDef = AVAILABLE_WIDGETS.find(w => w.id === id);
                    if (!widgetDef) return null;

                    const isHidden = hiddenWidgets.includes(id);

                    if (!isCustomizing && isHidden) return null;

                    const currentSpan = widgetSpans[id] || DEFAULT_SPANS[id] || 1;
                    const spanClass = getSpanClass(id);

                    return (
                        <motion.div
                            key={id}
                            layout
                            variants={staggerItem}
                            transition={springTransition}
                            whileHover={!isCustomizing ? layoutTactileHover.whileHover : undefined}
                            whileTap={layoutTactileHover.whileTap}
                            className={`relative transition-colors duration-300 ${spanClass} ${isCustomizing
                                ? 'rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-4 min-h-[160px]'
                                : ''
                                } ${isHidden && isCustomizing ? 'opacity-40 grayscale' : ''} `}
                        >
                            {isCustomizing ? (
                                <div className="flex flex-col h-full gap-4">
                                    {/* Header: Label & Move/Hide Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                {isHidden ? 'Hidden: ' : ''}{widgetDef.label}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
                                            <button
                                                onClick={() => moveWidget(index, 'UP')}
                                                disabled={index === 0}
                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-30 text-slate-600 dark:text-slate-400"
                                                title="Move Up"
                                            >
                                                <ArrowUp size={14} />
                                            </button>
                                            <button
                                                onClick={() => moveWidget(index, 'DOWN')}
                                                disabled={index === widgetOrder.length - 1}
                                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-30 text-slate-600 dark:text-slate-400"
                                                title="Move Down"
                                            >
                                                <ArrowDown size={14} />
                                            </button>
                                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                            <button
                                                onClick={() => toggleVisibility(id)}
                                                className={`p - 1.5 rounded - md ${isHidden ? 'text-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-700'} `}
                                                title={isHidden ? "Show Widget" : "Hide Widget"}
                                            >
                                                {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Preview/Placeholder */}
                                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/50">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                                            {isHidden ? (
                                                <EyeOff className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <LayoutGrid className="w-5 h-5 text-indigo-400" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">
                                            {isHidden ? 'Hidden from Dashboard' : 'Active Widget'}
                                        </span>
                                    </div>

                                    {/* Footer: Resize Controls */}
                                    <div className="flex justify-center">
                                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
                                            {[1, 2, 3].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => updateSpan(id, size)}
                                                    className={`px - 3 py - 1 text - [10px] font - bold rounded - full transition - all ${currentSpan === size
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                        } `}
                                                >
                                                    {size === 1 ? 'Small' : size === 2 ? 'Medium' : 'Full'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full">
                                    {renderWidget(id)}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
