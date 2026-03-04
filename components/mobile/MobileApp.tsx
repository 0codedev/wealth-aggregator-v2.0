// MobileApp v2 — HMR Trigger
import React, { useState } from 'react';
import { Home, PieChart, Activity, Settings, Bell } from 'lucide-react';
import { useFamily } from '../../contexts/FamilyContext';
import { useSettingsStore } from '../../store/settingsStore';
import { MobileDashboard } from './views/MobileDashboard';
import { MobilePortfolio } from './views/MobilePortfolio';
import { MobileMarketIntel } from './views/MobileMarketIntel';
import { MobileIPO } from './views/MobileIPO';
import { MobileAlpha } from './views/MobileAlpha';
import { MobilePlanner } from './views/MobilePlanner';
import { MobileMoonshot } from './views/MobileMoonshot';
import { MobileMathLab } from './views/MobileMathLab';
import { MobileJournal } from './views/MobileJournal';
import { MobileAcademy } from './views/MobileAcademy';
import { MobileAdvisor } from './views/MobileAdvisor';
import {
    Rocket, Zap, Target, FlaskConical, Calculator,
    BookOpen, GraduationCap, Brain, Moon, Sun, Shield,
    Globe, ChevronRight, Eye, EyeOff, Smartphone,
    Database, Trash2, Info, LogOut, User
} from 'lucide-react';
import DataBackupSettings from '../DataBackupSettings';

// ============ SETTINGS VIEW (full mobile screen) ============
const MobileSettingsView: React.FC = () => {
    const [privacyMode, setPrivacyMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [biometric, setBiometric] = useState(false);

    const SettingRow = ({ icon, label, desc, children }: { icon: React.ReactNode, label: string, desc?: string, children?: React.ReactNode }) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    {desc && <p className="text-[10px] text-slate-500">{desc}</p>}
                </div>
            </div>
            {children}
        </div>
    );

    const Toggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
        <button onClick={() => onChange(!value)}
            className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-indigo-500' : 'bg-slate-700'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
    );

    return (
        <div className="pb-24 px-4 pt-4 space-y-4">
            {/* Profile */}
            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl font-bold text-indigo-400">U</div>
                    <div>
                        <h3 className="text-lg font-bold text-white">User Profile</h3>
                        <p className="text-xs text-slate-400">Premium Member</p>
                    </div>
                </div>
                <button className="w-full py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold">Edit Profile</button>
            </div>

            {/* Appearance */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Appearance</h3>
                <SettingRow icon={<Moon className="w-4 h-4" />} label="Dark Mode" desc="Use dark theme">
                    <Toggle value={darkMode} onChange={setDarkMode} />
                </SettingRow>
                <SettingRow icon={<Eye className="w-4 h-4" />} label="Privacy Mode" desc="Hide portfolio values">
                    <Toggle value={privacyMode} onChange={setPrivacyMode} />
                </SettingRow>
            </div>

            {/* Notifications */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Notifications</h3>
                <SettingRow icon={<Bell className="w-4 h-4" />} label="Push Notifications" desc="Market alerts & updates">
                    <Toggle value={notifications} onChange={setNotifications} />
                </SettingRow>
            </div>

            {/* Security */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Security</h3>
                <SettingRow icon={<Smartphone className="w-4 h-4" />} label="Biometric Lock" desc="Face ID / Fingerprint">
                    <Toggle value={biometric} onChange={setBiometric} />
                </SettingRow>
                <SettingRow icon={<Shield className="w-4 h-4" />} label="Change PIN">
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                </SettingRow>
            </div>

            {/* Data */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Data & Cloud Sync</h3>
                <DataBackupSettings />
            </div>

            {/* About */}
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">About</h3>
                <SettingRow icon={<Info className="w-4 h-4" />} label="Version" desc="v2.0.0">
                    <span className="text-xs text-slate-500">Build 2026.02</span>
                </SettingRow>
            </div>

            <button className="w-full py-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
    );
};

// ============ MAIN MOBILE APP ============
export const MobileApp: React.FC = () => {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <MobileDashboard />;
            case 'portfolio': return <MobilePortfolio />;
            case 'markets': return <MobileMarketIntel />;
            case 'ipo': return <MobileIPO />;
            case 'engine': return <MobileAlpha />;
            case 'planner': return <MobilePlanner />;
            case 'lab': return <MobileMoonshot />;
            case 'math': return <MobileMathLab />;
            case 'journal': return <MobileJournal />;
            case 'academy': return <MobileAcademy />;
            case 'advisor': return <MobileAdvisor />;
            case 'settings': return <MobileSettingsView />;
            default: return null;
        }
    };

    const tabLabel = (tab: string) => {
        const labels: Record<string, string> = {
            home: 'Dashboard', portfolio: 'Portfolio', markets: 'Markets', ipo: 'IPO',
            engine: 'Engine', planner: 'Planner', lab: 'Lab', math: 'Math Lab',
            journal: 'Journal', academy: 'Academy', advisor: 'Advisor', settings: 'Settings'
        };
        return labels[tab] || tab;
    };

    return (
        <div className="flex flex-col h-[100dvh] w-full bg-slate-950 text-slate-50 font-sans overflow-hidden">
            {/* Top Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-900 z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold overflow-hidden">
                        U
                    </div>
                </div>
                <h1 className="text-lg font-bold tracking-wide text-white">
                    {tabLabel(activeTab)}
                </h1>
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none">
                    <Bell className="w-5 h-5" />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-slate-950">
                {renderContent()}
            </main>

            {/* Bottom Navigation — scrollable when many tabs */}
            <nav className="shrink-0 bg-slate-900/40 backdrop-blur-xl border-t border-slate-800/60 pb-safe pt-1 px-1 shadow-lg z-20 relative">
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/80 to-transparent pointer-events-none z-10" />
                <div className="flex overflow-x-auto scrollbar-hide gap-0 pb-1.5">
                    {[
                        { id: 'home', icon: Home, label: 'Home' },
                        { id: 'portfolio', icon: PieChart, label: 'Portfolio' },
                        { id: 'markets', icon: Activity, label: 'Markets' },
                        { id: 'ipo', icon: Rocket, label: 'IPO' },
                        { id: 'engine', icon: Zap, label: 'Engine' },
                        { id: 'planner', icon: Target, label: 'Planner' },
                        { id: 'lab', icon: FlaskConical, label: 'Lab' },
                        { id: 'math', icon: Calculator, label: 'Math' },
                        { id: 'journal', icon: BookOpen, label: 'Journal' },
                        { id: 'academy', icon: GraduationCap, label: 'Academy' },
                        { id: 'advisor', icon: Brain, label: 'Advisor' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map(item => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center justify-center min-w-[44px] h-11 relative transition-all duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                <div className={`relative z-10 transition-transform duration-200 ${isActive ? '-translate-y-0.5 scale-110' : ''}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <span className={`text-[7px] font-medium mt-0.5 transition-all leading-tight ${isActive ? 'opacity-100 text-indigo-400' : 'opacity-60'}`}>{item.label}</span>
                                {isActive && <div className="absolute bottom-0 w-1 h-1 bg-indigo-400 rounded-full" />}
                            </button>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};
