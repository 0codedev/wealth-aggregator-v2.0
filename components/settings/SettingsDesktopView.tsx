import React from 'react';
import { RefreshCw, Cpu, Database, Signal, Eye, Save } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import DataBackupSettings from '../DataBackupSettings';

const SettingsDesktopView: React.FC = () => {
    const settings = useSettingsStore();

    const handleChange = (key: keyof typeof settings, value: string) => {
        if (key === 'targetDate' || key === 'geminiApiKey' || key === 'groqApiKey' || key === 'apiKeys') {
            settings.updateSetting(key, value);
            return;
        }
        let numValue = parseFloat(value);
        if (isNaN(numValue)) numValue = 0;
        settings.updateSetting(key, numValue);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">System Settings</h2>
                        <p className="text-sm text-slate-500 leading-tight">Configure AI, Cloud Sync, and Engine Rules</p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 max-w-5xl mx-auto w-full space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section 1: Goals */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Targets & Goals</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project 5L Target (₹)</label>
                            <input
                                type="number"
                                value={settings.targetNetWorth}
                                onChange={(e) => handleChange('targetNetWorth', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Date</label>
                            <input
                                type="date"
                                value={settings.targetDate}
                                onChange={(e) => handleChange('targetDate', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                    </div>

                    {/* Section 2: Risk Engine */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Risk Engine</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Max Risk Per Trade (%)</label>
                            <input
                                type="number"
                                value={settings.riskPerTrade}
                                onChange={(e) => handleChange('riskPerTrade', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bullion Cap (%)</label>
                            <input
                                type="number"
                                value={settings.bullionCap}
                                onChange={(e) => handleChange('bullionCap', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                    </div>

                    {/* Section 3: Liability */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Liability Manager</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Loan Principal (₹)</label>
                            <input
                                type="number"
                                value={settings.loanPrincipal}
                                onChange={(e) => handleChange('loanPrincipal', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Interest Rate (%)</label>
                            <input
                                type="number"
                                value={settings.loanInterest}
                                onChange={(e) => handleChange('loanInterest', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                    </div>

                    {/* Section 4: Rules */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-slate-800 pb-2">Execution Rules</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Greed Killer ROI (%)</label>
                            <input
                                type="number"
                                value={settings.greedKillerRoi}
                                onChange={(e) => handleChange('greedKillerRoi', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">IPO Fresh Issue Limit (%)</label>
                            <input
                                type="number"
                                value={settings.ipoFreshIssueThreshold}
                                onChange={(e) => handleChange('ipoFreshIssueThreshold', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 focus:border-indigo-500 outline-none font-mono transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-6 flex items-center gap-2">
                        <Database size={16} /> Data & Cloud Sync
                    </h3>
                    <DataBackupSettings />
                </div>

                {/* AI & Market APIs */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Market Data Feeds */}
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-6 rounded-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-2">
                                <Signal size={16} /> Market Data Feeds
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold ${settings.dataMode === 'LIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                                    {settings.dataMode === 'LIVE' ? 'LIVE MODE' : 'OFFLINE'}
                                </span>
                                <button
                                    onClick={() => settings.updateSetting('dataMode', settings.dataMode === 'LIVE' ? 'SIMULATION' : 'LIVE')}
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${settings.dataMode === 'LIVE' ? 'bg-emerald-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.dataMode === 'LIVE' ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">RapidAPI Key (Indian Stocks)</label>
                                <input
                                    type="password"
                                    placeholder="API Key..."
                                    value={settings.apiKeys?.rapidApi || ''}
                                    onChange={(e) => settings.updateSetting('apiKeys', { ...settings.apiKeys, rapidApi: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-3 focus:border-emerald-500 outline-none font-mono text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Alpha Vantage Key (Commodities)</label>
                                <input
                                    type="password"
                                    placeholder="Free API Key..."
                                    value={settings.apiKeys?.alphaVantage || ''}
                                    onChange={(e) => settings.updateSetting('apiKeys', { ...settings.apiKeys, alphaVantage: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-3 focus:border-emerald-500 outline-none font-mono text-sm transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AI Logic Core */}
                    <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 p-6 rounded-2xl">
                        <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-6 flex items-center gap-2">
                            <Cpu size={16} /> AI Configuration
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Google Gemini API Key</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="AIzaSy... (Leave empty to use shared key)"
                                    value={settings.geminiApiKey}
                                    onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl p-3 pl-3 pr-10 focus:border-indigo-500 outline-none font-mono text-sm transition-colors"
                                />
                                {settings.geminiApiKey && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                        <Save size={16} />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Get a free key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">Google AI Studio</a>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex justify-between items-center pb-8">
                    <button
                        onClick={settings.resetDefaults}
                        className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw size={16} /> Reset Default Thresholds
                    </button>
                    {/* The Apply button isn't needed here since auto-save handles it, but we can keep a success indicator */}
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                        <Save size={16} /> Auto-saving active
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsDesktopView;
