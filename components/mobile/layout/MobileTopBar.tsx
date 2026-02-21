import React from 'react';
import { Settings, TrendingUp } from 'lucide-react';

interface MobileTopBarProps {
    totalNetWorth: string;
    isPrivacyMode: boolean;
    onTogglePrivacy: () => void;
    onOpenSettings: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({
    totalNetWorth,
    isPrivacyMode,
    onTogglePrivacy,
    onOpenSettings
}) => {
    return (
        <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 pb-2 flex items-center justify-between">
            {/* Logo area */}
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <TrendingUp className="text-white" size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider leading-none mb-0.5">Net Worth</span>
                    <span className="font-mono font-bold text-emerald-400 leading-none text-base">
                        {isPrivacyMode ? '••••••' : totalNetWorth}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onOpenSettings}
                    className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full transition-colors"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default MobileTopBar;
