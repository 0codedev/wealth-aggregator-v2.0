
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trash2, TrendingUp, TrendingDown, Shield, Target, Droplets, Sparkles, PartyPopper, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSectionProps {
    stats: any;
    isPrivacyMode: boolean;
    dynamicHealthScore: number;
    formatCurrency: (val: number) => string;
    lifeEvents?: any[];
    addLifeEvent?: any;
    deleteLifeEvent?: any;
    // Global Toggle Props
    showLiability: boolean;
    setShowLiability: (val: boolean) => void;
}

// ===================== COUNT-UP ANIMATION HOOK =====================
const useCountUp = (targetValue: number, duration: number = 1500) => {
    const [displayValue, setDisplayValue] = useState(0);
    const previousValue = useRef(0);

    useEffect(() => {
        if (targetValue === previousValue.current) return;

        const startValue = previousValue.current;
        const diff = targetValue - startValue;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (diff * easeOutQuart);

            setDisplayValue(Math.round(currentValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                previousValue.current = targetValue;
            }
        };

        requestAnimationFrame(animate);
    }, [targetValue, duration]);

    return displayValue;
};

// ===================== PRIVACY SCRAMBLER HOOK =====================
const useScrambleText = (text: string, isActive: boolean) => {
    const [scrambled, setScrambled] = useState(text);
    const chars = '!<>-_\\/[]{}—=+*^?#________';

    useEffect(() => {
        if (!isActive) {
            setScrambled(text);
            return;
        }

        let interval: NodeJS.Timeout;
        let iteration = 0;

        interval = setInterval(() => {
            setScrambled(text.split('').map((char, index) => {
                if (index < iteration) return text[index];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(''));

            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);

        return () => clearInterval(interval);
    }, [text, isActive]);

    return isActive ? '••••••••' : text; // Fallback to dots for stability after scramble
};

// ===================== MULTI-FACTOR HEALTH SCORES =====================
interface HealthScores {
    liquidity: number;
    growth: number;
    risk: number;
    goal: number;
    overall: number;
}

const calculateHealthScores = (stats: any, dynamicHealthScore: number): HealthScores => {
    // Liquidity Score: Emergency fund coverage (assume 6 months expenses = 100%)
    // Simple approximation: if total assets > 500k, assume decent liquidity
    const liquidityScore = Math.min(100, Math.round((stats?.totalAssets || 0) / 5000));

    // Growth Score: Based on P/L percentage
    const plPercent = parseFloat(stats?.totalPLPercent || '0');
    const growthScore = Math.min(100, Math.max(0, 50 + (plPercent * 2)));

    // Risk Score: Inverted - lower concentration = higher score
    const diversityScore = stats?.diversityScore || 50;
    const riskScore = Math.round(diversityScore);

    // Goal Score: Use progress toward target
    const goalScore = Math.min(100, dynamicHealthScore);

    // Overall: Weighted average
    const overall = Math.round(
        (liquidityScore * 0.2) +
        (growthScore * 0.3) +
        (riskScore * 0.25) +
        (goalScore * 0.25)
    );

    return { liquidity: liquidityScore, growth: growthScore, risk: riskScore, goal: goalScore, overall };
};

// ===================== SCORE RING COMPONENT =====================
const ScoreRing: React.FC<{
    score: number;
    label: string;
    icon: React.ReactNode;
    color: string;
    size?: 'sm' | 'md';
}> = ({ score, label, icon, color, size = 'sm' }) => {
    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className={`relative ${size === 'md' ? 'w-14 h-14' : 'w-10 h-10'}`}>
                <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="18" fill="none"
                        className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="3" />
                    <circle cx="20" cy="20" r="18" fill="none"
                        className={color} strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
            <span className={`text-xs font-mono font-bold ${color.replace('stroke-', 'text-')}`}>{score}</span>
        </div>
    );
};

// ===================== CELEBRATION OVERLAY =====================
const CelebrationOverlay: React.FC<{ show: boolean; milestone: string }> = ({ show, milestone }) => {
    if (!show) return null;

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-amber-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center">
                <PartyPopper className="w-12 h-12 text-amber-500 mx-auto mb-2 animate-bounce" />
                <p className="text-2xl font-black text-white">{milestone}</p>
                <p className="text-sm text-emerald-400 font-bold">Milestone Reached! 🎉</p>
            </div>
        </div>
    );
};

const HeroSection: React.FC<HeroSectionProps> = ({
    stats, isPrivacyMode, dynamicHealthScore, formatCurrency,
    showLiability, setShowLiability
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationMilestone, setCelebrationMilestone] = useState('');
    const previousMilestone = useRef(0);

    // Animated Net Worth Display
    const displayAmount = showLiability
        ? (stats?.totalValue || 0) // Net Worth (Assets - Liabilities)
        : (stats?.totalAssets || 0); // Gross Assets

    const animatedAmount = useCountUp(displayAmount);

    // Privacy Scramble
    // Logic: We show scrambled text if privacy mode is ON.
    // Ideally we'd actually animate the scramble, but for now simple swap is safer for React render cycles.

    // Multi-factor Health Scores
    const healthScores = useMemo(() =>
        calculateHealthScores(stats, dynamicHealthScore),
        [stats, dynamicHealthScore]
    );

    // Dynamic gradient based on overall health
    const getGradientClass = () => {
        if (healthScores.overall > 75) return 'from-emerald-500/10 via-white dark:via-slate-900 to-cyan-500/10';
        if (healthScores.overall > 50) return 'from-amber-500/10 via-white dark:via-slate-900 to-orange-500/10';
        return 'from-rose-500/10 via-white dark:via-slate-900 to-pink-500/10';
    };

    // Milestone celebration detection
    useEffect(() => {
        const milestones = [100000, 500000, 1000000, 2500000, 5000000, 10000000];
        const currentValue = stats?.totalAssets || 0;

        for (const milestone of milestones) {
            if (currentValue >= milestone && previousMilestone.current < milestone) {
                setCelebrationMilestone(`₹${(milestone / 100000).toFixed(0)}L`);
                setShowCelebration(true);
                setTimeout(() => setShowCelebration(false), 3000);
                break;
            }
        }
        previousMilestone.current = currentValue;
    }, [stats?.totalAssets]);

    return (
        <div className="mb-8 relative group">
            {/* NET WORTH CARD (Full Width) */}
            <div className={`bg-gradient-to-br ${getGradientClass()} bg-white dark:bg-slate-900 rounded-2xl p-8 relative overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-2xl transition-all duration-500`}>

                {/* Celebration Overlay */}
                <CelebrationOverlay show={showCelebration} milestone={celebrationMilestone} />

                {/* Animated Background Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" />
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse delay-700" />
                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} />
                </div>

                <div className="relative z-10">
                    {/* Header Row: Title & Top Right Controls */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {showLiability ? <Target size={14} className="text-indigo-400" /> : <Shield size={14} className="text-emerald-400" />}
                                {showLiability ? 'Net Worth' : 'Gross Assets'}
                            </p>
                            {stats?.totalPLPercent && (
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide ${parseFloat(stats.totalPLPercent) >= 0
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                    <TrendingUp size={10} />
                                    {stats.totalPLPercent}%
                                </div>
                            )}
                        </div>

                        {/* Top Right Controls: Toggle & Expand */}
                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-100 dark:bg-slate-950/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                                <button
                                    onClick={() => setShowLiability(false)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!showLiability
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Gross
                                </button>
                                <button
                                    onClick={() => setShowLiability(true)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${showLiability
                                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    Net
                                </button>
                            </div>

                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors rounded-lg bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30"
                                title={isExpanded ? "Collapse" : "Expand Details"}
                            >
                                <TrendingDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Centered Amount */}
                    <div className="flex justify-center items-center py-8 md:py-12 relative">
                        {/* Glow effect behind text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-indigo-500/5 blur-3xl rounded-full" />

                        <div className="flex items-baseline gap-3 relative z-10">
                            <AnimatePresence mode="wait">
                                {isPrivacyMode ? (
                                    <motion.h1
                                        key="privacy"
                                        initial={{ opacity: 0, filter: "blur(10px)" }}
                                        animate={{ opacity: 1, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, filter: "blur(10px)" }}
                                        className="text-6xl md:text-8xl font-black tracking-tighter text-slate-700 font-mono select-none"
                                    >
                                        ••••••••
                                    </motion.h1>
                                ) : (
                                    <motion.h1
                                        key="value"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white font-mono tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-slate-900 dark:from-white to-slate-400 drop-shadow-2xl"
                                    >
                                        {formatCurrency(animatedAmount)}
                                    </motion.h1>
                                )}
                            </AnimatePresence>

                            {!isPrivacyMode && healthScores.overall > 75 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.5 }}
                                >
                                    <Sparkles className="w-8 h-8 text-amber-400 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Expandable Section */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/50">
                                    {/* Multi-Factor Health Scores */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 backdrop-blur-sm">
                                        <ScoreRing
                                            score={healthScores.liquidity}
                                            label="Liquidity"
                                            icon={<Droplets size={12} className="text-blue-400" />}
                                            color="stroke-blue-400"
                                        />
                                        <ScoreRing
                                            score={healthScores.growth}
                                            label="Growth"
                                            icon={<TrendingUp size={12} className="text-emerald-400" />}
                                            color="stroke-emerald-400"
                                        />
                                        <ScoreRing
                                            score={healthScores.risk}
                                            label="Risk"
                                            icon={<Shield size={12} className="text-amber-400" />}
                                            color="stroke-amber-400"
                                        />
                                        <ScoreRing
                                            score={healthScores.goal}
                                            label="Goal"
                                            icon={<Target size={12} className="text-indigo-400" />}
                                            color="stroke-indigo-400"
                                        />
                                    </div>

                                    {/* Bottom Stats Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                                        <div>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Assets</p>
                                            <p className="text-slate-600 dark:text-slate-200 font-mono text-lg font-semibold tabular-nums">
                                                {isPrivacyMode ? '••••' : formatCurrency(stats?.totalAssets || 0)}
                                            </p>
                                        </div>
                                        <div className={`transition-opacity duration-300 ${!showLiability ? 'opacity-40 grayscale' : 'opacity-100'}`}>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Liabilities</p>
                                            <p className="text-rose-400 font-mono text-lg font-semibold tabular-nums">
                                                -{isPrivacyMode ? '••••' : formatCurrency(stats?.totalLiability || 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Overall Score</p>
                                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                                <div className="flex-1 max-w-[100px] h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${healthScores.overall > 75 ? 'bg-emerald-500' :
                                                            healthScores.overall > 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                            }`}
                                                        style={{ width: `${healthScores.overall}%` }}
                                                    />
                                                </div>
                                                <span className={`font-mono text-sm font-bold ${healthScores.overall > 75 ? 'text-emerald-400' :
                                                    healthScores.overall > 50 ? 'text-amber-400' : 'text-rose-400'
                                                    }`}>
                                                    {healthScores.overall}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
