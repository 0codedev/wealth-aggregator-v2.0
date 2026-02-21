
import React, { useEffect, useState } from 'react';
import { TrendingUp, LayoutDashboard, Wallet, Globe, Bot, Settings, X, Target, Zap, Brain, Users, User, Baby, Building2, Lightbulb, Layers, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import { motion, AnimatePresence } from 'framer-motion';
import { springTransition } from '../ui/animations';
import { useSettingsStore } from '../../store/settingsStore';

interface SidebarProps {
    activeCategory: string;
    setActiveCategory: (id: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    onOpenSettings: () => void;
    totalNetWorth: string;
    isPrivacyMode: boolean;
    onTogglePrivacy?: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

const CATEGORIES = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'portfolio', icon: Wallet, label: 'Portfolio Hub' },
    { id: 'market', icon: Globe, label: 'Market Intel' },
    { id: 'ipo', icon: Zap, label: 'IPO' },
    { id: 'journal', icon: Brain, label: 'Trading Journal' },
    { id: 'growth', icon: Bot, label: 'Growth Engine' },
    { id: 'planning', icon: Target, label: 'Life Planner' },
    { id: 'innovation', icon: Lightbulb, label: 'Moonshot Lab' },
    { id: 'analytics', icon: Layers, label: 'Analytics' }
];

const Sidebar: React.FC<SidebarProps> = ({
    activeCategory,
    setActiveCategory,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    onOpenSettings,
    totalNetWorth,
    isPrivacyMode,
    onTogglePrivacy,
    isCollapsed,
    onToggleCollapse
}) => {
    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeCategory, setIsMobileMenuOpen]);

    const SidebarContent = ({ prefix = 'desktop' }: { prefix?: string }) => (
        <>
            <div
                className={`p-6 flex items-center justify-between ${isCollapsed ? 'justify-center cursor-pointer' : 'cursor-pointer'}`}
                onClick={onToggleCollapse}
                title="Toggle Sidebar"
            >
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/10 group-hover:scale-110 transition-transform">
                        <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                        <TrendingUp className="text-white relative z-10" size={22} />
                    </div>
                    {!isCollapsed && (
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Wealth<span className="text-indigo-500">Agg</span>
                            </h1>
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Pro Dashboard</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }}
                    className="md:hidden p-2 text-slate-400 hover:text-rose-500 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`relative flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 group border-l-4 ${isActive
                                ? 'bg-indigo-50 dark:bg-slate-800/80 border-indigo-500 text-indigo-600 dark:text-white shadow-sm'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                                } ${isCollapsed ? 'justify-center border-l-0 border-b-2' : ''}`}
                        >

                            <div className="relative z-10 flex items-center gap-3">
                                <cat.icon size={20} className={`transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />

                                {!isCollapsed && (
                                    <span className={`font-medium text-sm whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}>
                                        {cat.label}
                                    </span>
                                )}
                            </div>

                            {/* Hover Tooltip for Collapsed State */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {cat.label}
                                </div>
                            )}
                        </button>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                    onClick={onOpenSettings}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all font-medium border border-transparent hover:border-slate-200 dark:hover:border-slate-700 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <Settings size={20} />
                    {!isCollapsed && <span>Settings</span>}
                </button>

                {!isCollapsed && (
                    <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">Net Worth</p>
                        <p className="text-xl font-mono font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors truncate">
                            {isPrivacyMode ? '••••••' : totalNetWorth}
                        </p>
                    </div>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar (Static) */}
            <motion.aside
                layout
                transition={springTransition}
                className={`hidden md:flex flex-col ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full z-40`}
            >
                <SidebarContent prefix="desktop" />
            </motion.aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 pointer-events-auto">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={springTransition}
                            className="absolute top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col"
                        >
                            <div className="flex-1 overflow-y-auto">
                                <SidebarContent prefix="mobile" />
                            </div>

                            {/* Mobile Drawer Footer Utilities (Replaced Header Icons) */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-around">
                                <button
                                    onClick={onTogglePrivacy}
                                    className={`p-3 rounded-full transition-colors flex flex-col items-center gap-1 ${isPrivacyMode ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    {isPrivacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Privacy</span>
                                </button>

                                <button
                                    onClick={() => useSettingsStore.getState().updateSetting('isDarkMode', !useSettingsStore.getState().isDarkMode)}
                                    className="p-3 rounded-full text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex flex-col items-center gap-1"
                                >
                                    {useSettingsStore.getState().isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Theme</span>
                                </button>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
