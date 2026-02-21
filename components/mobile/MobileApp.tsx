import React, { useState } from 'react';
import { Home, PieChart, Activity, Settings, Bell } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import { useSettingsStore } from '../../store/settingsStore';
// Placeholder views for now, will generate with Stitch soon
import { MobileDashboard } from './views/MobileDashboard';
import { MobilePortfolio } from './views/MobilePortfolio';

export const MobileApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return <MobileDashboard />;
            case 'portfolio':
                return <MobilePortfolio />;
            case 'markets':
                return <div className="flex flex-col items-center justify-center p-8 h-full bg-slate-950 text-slate-400">Markets Module (Coming Soon)</div>;
            case 'settings':
                return <div className="flex flex-col items-center justify-center p-8 h-full bg-slate-950 text-slate-400">Settings Module (Coming Soon)</div>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-slate-950 text-slate-50 font-sans overflow-hidden">
            {/* Top Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold overflow-hidden shadow-sm shadow-indigo-500/10">
                        U
                    </div>
                </div>
                <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 capitalize">
                    {activeTab === 'home' ? 'Dashboard' : activeTab}
                </h1>
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-950 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-950">
                {renderContent()}
            </main>

            {/* Bottom Navigation */}
            <nav className="shrink-0 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/60 pb-safe pt-2 px-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] z-20">
                <div className="flex justify-between items-center max-w-md mx-auto relative pb-2">
                    <NavItem
                        icon={<Home className="w-6 h-6" />}
                        label="Home"
                        isActive={activeTab === 'home'}
                        onClick={() => setActiveTab('home')}
                    />
                    <NavItem
                        icon={<PieChart className="w-6 h-6" />}
                        label="Portfolio"
                        isActive={activeTab === 'portfolio'}
                        onClick={() => setActiveTab('portfolio')}
                    />
                    <NavItem
                        icon={<Activity className="w-6 h-6" />}
                        label="Markets"
                        isActive={activeTab === 'markets'}
                        onClick={() => setActiveTab('markets')}
                    />
                    <NavItem
                        icon={<Settings className="w-6 h-6" />}
                        label="Settings"
                        isActive={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                </div>
            </nav>
        </div>
    );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-16 h-14 relative transition-all duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                }`}
        >
            <div className={`relative z-10 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 absolute'}`}>
                {label}
            </span>
            {isActive && (
                <div className="absolute top-0 w-8 h-8 bg-indigo-500/20 rounded-full blur-md -z-0"></div>
            )}
        </button>
    );
};
