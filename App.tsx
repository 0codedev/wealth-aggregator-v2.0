import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './components/ui/animations';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import { FamilyProvider, useFamily } from './contexts/FamilyContext';
import ProfileMenu from './components/layout/ProfileMenu';
import {
    LayoutDashboard, Wallet, Globe, Bot,
    Menu, Search, Eye, EyeOff, Moon, Sun, Target, Heart, Layers, Shield, Brain
} from 'lucide-react';

// Security
import { applySecurityHeaders } from './utils/security';

// Components
import { CommandPalette } from './components/ui/CommandPalette';
import Sidebar from './components/layout/Sidebar';

// Critical Path - Load eagerly
import DashboardTab from './components/tabs/DashboardTab';
import { PortfolioTab } from './components/tabs/PortfolioTab';
import JarvisOrb from './components/ai/JarvisOrb';

// Lazy Loaded Tabs (reduces initial bundle by ~40%)
const AdvisorTab = lazy(() => import('./components/tabs/AdvisorTab'));
const PsychDashboard = lazy(() => import('./components/PsychDashboard'));
const StrategyLab = lazy(() => import('./components/tabs/StrategyLab'));
const MacroPulse = lazy(() => import('./components/tabs/MacroPulse'));
const GoalGPS = lazy(() => import('./components/tabs/GoalGPS'));
const IPOWarRoom = lazy(() => import('./components/tabs/IPOWarRoom'));
const ComplianceShield = lazy(() => import('./components/tabs/ComplianceShield'));
const Academy = lazy(() => import('./components/tabs/Academy'));
const AlphaPredator = lazy(() => import('./components/growth/AlphaPredator'));
const PaperTrading = lazy(() => import('./components/tabs/market/PaperTrading').then(m => ({ default: m.PaperTrading })));
const RetirementPlanner = lazy(() => import('./components/tabs/RetirementPlanner'));
const LegacyVault = lazy(() => import('./components/tabs/LegacyVault'));
const Boardroom = lazy(() => import('./components/innovation/Boardroom').then(m => ({ default: m.Boardroom })));
const BlackSwan = lazy(() => import('./components/innovation/BlackSwan').then(m => ({ default: m.BlackSwan })));
const OpportunityCost = lazy(() => import('./components/innovation/OpportunityCost').then(m => ({ default: m.OpportunityCost })));
const DynastyMode = lazy(() => import('./components/innovation/DynastyMode').then(m => ({ default: m.DynastyMode })));
const ImpulseCheck = lazy(() => import('./components/innovation/ImpulseCheck').then(m => ({ default: m.ImpulseCheck })));
const QuantDashboard = lazy(() => import('./components/analytics/QuantDashboard').then(m => ({ default: m.QuantDashboard })));
const FortressDashboard = lazy(() => import('./components/fortress/FortressDashboard').then(m => ({ default: m.FortressDashboard })));
const MathLabHub = lazy(() => import('./components/calculators/MathLabHub').then(m => ({ default: m.MathLabHub })));

// Modals
import AddInvestmentModal from './components/AddInvestmentModal';
import LogicConfigModal from './components/LogicConfigModal';

// Shared Components
import { PrivacyValue } from './components/shared/PrivacyComponents';
import { CustomTooltip } from './components/shared/CustomTooltip';
import { DashboardSkeleton } from './components/shared/Skeleton';
import { Tabs } from './components/ui/AnimatedTabs';
import OfflineIndicator from './components/shared/OfflineIndicator';

// Hooks & Store
import { usePortfolioStore } from './store/portfolioStore'; // NEW: Use Store
import { useHotkeys } from './hooks/useHotkeys';
import { useIsMobile } from './hooks/useIsMobile';
import { useMarketSentiment } from './hooks/useMarketSentiment';
import { ASSET_CLASS_COLORS, Investment } from './types';

// Helpers
import { formatCurrency, formatCurrencyPrecise, calculatePercentage } from './utils/helpers';

// God-Tier Features
import { VoiceCommandButton, AlertsDropdown } from './components/shared/GodTierFeatures';
import { useSettingsStore } from './store/settingsStore';
import { MobileApp } from './components/mobile/MobileApp';

// ... (Constants: SUB_TABS, CATEGORY_LABELS kept same, omitting for brevity in thought but including in file)
const SUB_TABS: Record<string, { id: string, label: string, icon: any }[]> = {
    dashboard: [],
    portfolio: [
        { id: 'portfolio', label: 'Overview', icon: Wallet },
        { id: 'gps', label: 'Goal GPS', icon: Compass },
        { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    ],
    market: [
        { id: 'macro', label: 'Macro Pulse', icon: Globe },
        { id: 'strategy', label: 'Strategy Lab', icon: Activity },
        { id: 'paper', label: 'Paper Sandbox', icon: Clipboard },
    ],
    ipo: [],
    growth: [
        { id: 'predator', label: 'Predator Engine', icon: Zap },
        { id: 'advisor', label: 'AI Advisor', icon: Bot },
        { id: 'academy', label: 'Academy', icon: BookOpen },
    ],
    journal: [],
    planning: [
        { id: 'retirement', label: 'Retirement & FIRE', icon: Target },
        { id: 'legacy', label: 'Legacy Vault', icon: Heart }
    ],
    innovation: [
        { id: 'boardroom', label: 'AI Boardroom', icon: Brain },
        { id: 'blackswan', label: 'Stress Test Lab', icon: ShieldCheck },
        { id: 'oppcost', label: 'Regret Engine', icon: Compass },
        { id: 'dynasty', label: 'Dynasty View', icon: Crown },
        { id: 'impulse', label: 'Anti-Impulse', icon: AlertTriangle },
    ],
    analytics: [
        { id: 'mathlab', label: 'Math Lab', icon: Calculator },
        { id: 'quant', label: 'Deep Quant', icon: Layers },
    ],
    fortress: [
        { id: 'dashboard', label: 'Command Center', icon: Shield },
    ]
};

const CATEGORY_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    portfolio: 'Portfolio Hub',
    market: 'Market Intel',
    ipo: 'IPO War Room',
    journal: 'Psych Dashboard',
    growth: 'Growth Engine',
    planning: 'Life Planner',
    innovation: 'Moonshot Lab',
    analytics: 'Analytics Center',
    fortress: 'The Fortress'
};

import { Compass, ShieldCheck, Activity, Clipboard, Zap, BookOpen, Crown, AlertTriangle, Calculator } from 'lucide-react';

// FIX #2: Split into AppContent (auth gate) + AuthenticatedApp (all hooks)
// This prevents hooks from being called after an early return, which violates React Rules of Hooks.
const AppContent: React.FC = () => {
    const { isAuthenticated, isLocked } = useAuth();

    if (!isAuthenticated || isLocked) {
        return <LoginPage />;
    }

    return <AuthenticatedApp />;
};

const AuthenticatedApp: React.FC = () => {
    // --- UI State ---
    const isMobile = useIsMobile();
    const { activeEntity, setActiveEntity } = useFamily();
    const [activeCategory, setActiveCategory] = useState<string>('dashboard');
    const [activeSubTab, setActiveSubTab] = useState<string>('dashboard');
    const [dashboardView, setDashboardView] = useState<'MAIN' | 'SPENDING' | 'MARKETS' | 'COMMUNITY'>('MAIN');

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    const { isDarkMode, isHighContrast, updateSetting } = useSettingsStore();
    const isEditMode = useSettingsStore(s => s.isEditMode); // FIX #15: extracted from inline JSX
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // --- Modals ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // --- Data (FROM STORE) ---
    // Initialize Store
    const initializePortfolio = usePortfolioStore(state => state.initialize);
    useEffect(() => {
        const unsubscribe = initializePortfolio();
        return () => unsubscribe();
    }, [initializePortfolio]);

    // Apply security headers on mount
    useEffect(() => {
        applySecurityHeaders();
    }, []);

    const {
        investments: allInvestments,
        stats: globalStats,
        allocationData, assetClassData, platformData,
        history, lifeEvents,
        addInvestment, updateInvestment, deleteInvestment,
        addLifeEvent, deleteLifeEvent, refreshPortfolio
    } = usePortfolioStore();

    // --- Filter logic ---
    const investments = React.useMemo(() => {
        if (activeEntity === 'ALL') return allInvestments;
        return allInvestments.filter(inv => {
            const owner = inv.owner || 'SELF';
            return owner === activeEntity;
        });
    }, [allInvestments, activeEntity]);

    const stats = React.useMemo(() => {
        if (activeEntity === 'ALL') return globalStats;

        const activeInvestments = investments.filter(inv => !inv.isHiddenFromTotals);
        const totalCurrent = activeInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
        const totalInvested = activeInvestments.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0);
        const totalPL = totalCurrent - totalInvested;
        const totalPLPercent = totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : '0.00';

        return {
            ...globalStats,
            totalCurrent,
            totalAssets: totalCurrent,
            totalInvested,
            totalPL,
            totalPLPercent,
            totalGain: totalPL,
            totalGainPercent: totalPLPercent
        };
    }, [globalStats, investments, activeEntity]);

    const { vix, status: marketStatus } = useMarketSentiment();

    // FIX #17: Memoize search results to avoid re-filtering on every render
    const searchResults = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return (investments || []).filter(inv =>
            inv.name.toLowerCase().includes(q) ||
            inv.ticker?.toLowerCase().includes(q) ||
            inv.type.toLowerCase().includes(q)
        );
    }, [investments, searchQuery]);

    // ... (Hotkeys and Effects kept same)
    useHotkeys('ctrl+k', (e) => {
        e.preventDefault();
        setIsSearchFocused(true);
        document.getElementById('global-search-input')?.focus();
    });

    useHotkeys('ctrl+d', (e) => { e.preventDefault(); setActiveCategory('dashboard'); setDashboardView('MAIN'); });
    useHotkeys('ctrl+j', (e) => { e.preventDefault(); setActiveCategory('journal'); });
    useHotkeys('ctrl+p', (e) => { e.preventDefault(); setActiveCategory('portfolio'); });
    useHotkeys('ctrl+m', (e) => {
        e.preventDefault();
        setActiveCategory('dashboard');
        setDashboardView('MARKETS');
    });

    useHotkeys('escape', () => {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isSearchFocused) setIsSearchFocused(false);
    });

    useEffect(() => {
        const subTabs = SUB_TABS[activeCategory];
        if (!subTabs || subTabs.length === 0) {
            setActiveSubTab(activeCategory);
        } else {
            setActiveSubTab(subTabs[0].id);
        }
    }, [activeCategory]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        if (isHighContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [isHighContrast]);

    // --- Content Render ---
    const renderContent = () => {
        const commonProps = {
            investments, // Passed to other tabs, but Dashboard uses store
            stats,
            allocationData,
            assetClassData,
            platformData,
            history,
            lifeEvents,
            isPrivacyMode,
            isDarkMode,
            formatCurrency,
            formatCurrencyPrecise,
            calculatePercentage,
            ASSET_CLASS_COLORS,
            CustomTooltip,
            PrivacyValue,
            marketVix: vix,
            marketStatus,
            addLifeEvent,
            deleteLifeEvent,
            onAddFirstAsset: () => setIsAddModalOpen(true),
            onAddAsset: () => { setEditingInvestment(null); setIsAddModalOpen(true); },
            onEditAsset: (inv: Investment) => { setEditingInvestment(inv); setIsAddModalOpen(true); },
            onDeleteAsset: async (inv: Investment) => await deleteInvestment(inv.id),
            onQuickUpdate: updateInvestment,
            onRefreshPortfolio: refreshPortfolio,
            totalNetWorth: formatCurrency(stats?.totalCurrent || 0),
            onNavigate: (tab: string) => setActiveCategory(tab)
        };

        const dashboardProps = {
            // ONLY UI props, no data props
            isPrivacyMode,
            isDarkMode,
            onAddFirstAsset: () => setIsAddModalOpen(true),
            formatCurrency,
            formatCurrencyPrecise,
            calculatePercentage,
            ASSET_CLASS_COLORS,
            CustomTooltip,
            marketVix: vix,
            marketStatus,
            view: dashboardView,
            onViewChange: setDashboardView
        };

        switch (activeSubTab) {
            // Fixed: DashboardTab consumes store directly, minimal props
            case 'dashboard': return <DashboardTab {...dashboardProps} />;
            case 'portfolio': return <PortfolioTab {...commonProps} />;
            case 'gps': return <GoalGPS />;
            case 'compliance': return <ComplianceShield {...commonProps} />;
            case 'strategy': return <StrategyLab />;
            case 'macro': return <MacroPulse />;
            case 'paper': return <PaperTrading />;
            case 'ipo': return <IPOWarRoom {...commonProps} onRefresh={commonProps.onRefreshPortfolio} />;
            case 'advisor': return <AdvisorTab {...commonProps} />;
            case 'predator': return <AlphaPredator investments={investments} />;
            case 'journal': return <PsychDashboard />;
            case 'academy': return <Academy />;
            case 'retirement': return <RetirementPlanner {...commonProps} currentCorpus={stats?.totalCurrent || 0} />;
            case 'legacy': return <LegacyVault {...commonProps} />;
            case 'boardroom': return <Boardroom />;
            case 'blackswan': return <BlackSwan />;
            case 'oppcost': return <OpportunityCost />;
            case 'dynasty': return <DynastyMode />;
            case 'impulse': return <ImpulseCheck />;
            case 'mathlab': return <MathLabHub />;
            case 'quant': return <QuantDashboard />;
            case 'fortress': return <FortressDashboard />;
            // Default Fallback
            default: return <DashboardTab {...dashboardProps} />;
        }
    };

    // --- Mobile Layout Return ---
    if (isMobile) {
        return (
            <Suspense fallback={<DashboardSkeleton />}>
                <MobileApp />
                {/* Modals needed globally */}
                {isAddModalOpen && (
                    <AddInvestmentModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingInvestment(null); }} onSave={async (data, id) => { if (id) { await updateInvestment(id, data); } else { await addInvestment(data as Investment); } setIsAddModalOpen(false); setEditingInvestment(null); }} editingInvestment={editingInvestment} />
                )}
                <CommandPalette />
                <OfflineIndicator />
            </Suspense>
        );
    }

    // --- Desktop Layout Return ---
    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden selections:bg-indigo-500/30">
            <Sidebar
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                onOpenSettings={() => setIsSettingsOpen(true)}
                totalNetWorth={formatCurrency(stats?.totalCurrent || 0)}
                isPrivacyMode={isPrivacyMode}
                onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
                <div onClick={() => setIsSearchFocused(false)} className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent flex flex-col">

                    {/* Header */}
                    <header className="mobile-sticky-header h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between px-4 md:px-6 shrink-0 z-[60]">
                        <div className="flex items-center gap-4">
                            <button className="md:hidden p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                <Menu size={24} />
                            </button>
                            <div className="flex items-center max-w-[500px] overflow-x-auto scrollbar-none">
                                {SUB_TABS[activeCategory]?.length > 0 ? (
                                    <Tabs.Root value={activeSubTab} onValueChange={setActiveSubTab} layoutId="app-global-nav">
                                        <Tabs.List>
                                            {(SUB_TABS[activeCategory] || []).map(tab => (
                                                <Tabs.Trigger key={tab.id} value={tab.id} icon={<tab.icon size={14} />}>
                                                    {tab.label}
                                                </Tabs.Trigger>
                                            ))}
                                        </Tabs.List>
                                    </Tabs.Root>
                                ) : (
                                    <div className="px-3 py-1.5 flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-800">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {CATEGORY_LABELS[activeCategory] || 'Dashboard'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-64 relative hidden md:block group z-50">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Search size={16} /></div>
                                <input
                                    id="global-search-input"
                                    type="text"
                                    placeholder="Search assets or features... (Ctrl+K)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:w-80"
                                />
                                {(isSearchFocused && searchResults.length > 0) && (
                                    <div className="absolute top-12 left-0 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 z-[100]">
                                        {searchResults.map(inv => (
                                            <button key={inv.id} onMouseDown={() => { setEditingInvestment(inv); setIsAddModalOpen(true); setSearchQuery(''); }} className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm opacity-80`} style={{ backgroundColor: ASSET_CLASS_COLORS[inv.type] || '#6366f1' }}>{inv.name.substring(0, 2).toUpperCase()}</div>
                                                    <div><p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{inv.name}</p><p className="text-xs text-slate-500">{inv.ticker || inv.type}</p></div>
                                                </div>
                                                <div className="text-right"><p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{formatCurrency(inv.currentValue || 0)}</p></div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Secondary Desktop Actions - Hidden on Mobile */}
                            <div className="hidden md:flex items-center gap-4">
                                <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className={`p-2 rounded-full transition-colors ${isPrivacyMode ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400 hover:text-indigo-400'}`} aria-label="Toggle privacy mode"><EyeOff size={20} /></button>
                                <button onClick={() => updateSetting('isDarkMode', !isDarkMode)} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}</button>
                                <VoiceCommandButton />
                            </div>

                            {/* Primary Global Actions */}
                            <div className="flex items-center gap-2">
                                <AlertsDropdown investments={investments} />
                                <ProfileMenu />
                            </div>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${activeCategory}-${activeSubTab}`}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="p-4 md:p-8 max-w-7xl mx-auto w-full"
                        >
                            <Suspense fallback={<DashboardSkeleton />}>{renderContent()}</Suspense>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {isAddModalOpen && (
                <AddInvestmentModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingInvestment(null); }} onSave={async (data, id) => { if (id) { await updateInvestment(id, data); } else { await addInvestment(data as Investment); } setIsAddModalOpen(false); setEditingInvestment(null); }} editingInvestment={editingInvestment} />
            )}
            <LogicConfigModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <CommandPalette />
            <JarvisOrb onNavigate={setActiveCategory} onSwitchProfile={(id) => setActiveEntity(id as any)} />
            <OfflineIndicator />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <FamilyProvider>
                <AppContent />
            </FamilyProvider>
        </AuthProvider>
    );
};

export default App;
