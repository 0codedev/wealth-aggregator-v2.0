import React from 'react';
import { LayoutDashboard, Wallet, Globe, BookOpen, Brain, Zap } from 'lucide-react';

export type MobileTabId = 'dashboard' | 'portfolio' | 'market' | 'ipo' | 'journal' | 'academy';

interface MobileBottomNavProps {
    activeTab: MobileTabId;
    setActiveTab: (tab: MobileTabId) => void;
}

const NAV_ITEMS = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'portfolio', icon: Wallet, label: 'Portfolio' },
    { id: 'market', icon: Globe, label: 'Market' },
    { id: 'ipo', icon: Zap, label: 'IPO' },
    { id: 'journal', icon: Brain, label: 'Journal' },
];

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as MobileTabId)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            <Icon size={22} className={isActive ? 'animate-bounce-short' : ''} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
