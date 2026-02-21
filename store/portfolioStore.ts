import { create } from 'zustand';
import { db, LifeEvent } from '../database';
import { Investment, AggregatedData, InvestmentType, HistoryEntry, PortfolioStats } from '../types';
import { logger } from '../services/Logger';
import { liveQuery } from 'dexie';
import { auditTrail } from '../services/SecurityService';

interface PortfolioState {
    investments: Investment[];
    history: HistoryEntry[];
    lifeEvents: LifeEvent[];
    stats: PortfolioStats;
    allocationData: AggregatedData[];
    assetClassData: AggregatedData[];
    platformData: AggregatedData[];
    isLoading: boolean;
    error: string | null;

    // Actions
    refreshPortfolio: () => Promise<void>;
    initialize: () => () => void; // Returns unsubscribe function
    addInvestment: (investment: Investment) => Promise<void>;
    updateInvestment: (id: string, updates: Partial<Investment>) => Promise<void>;
    deleteInvestment: (id: string) => Promise<void>;
    addLifeEvent: (event: Omit<LifeEvent, 'id'>) => Promise<void>;
    deleteLifeEvent: (id: number) => Promise<void>;

    // Internal Action
    setPortfolioData: (investments: Investment[], history: HistoryEntry[], lifeEvents: LifeEvent[]) => void;
    clearError: () => void;
}

const INITIAL_STATS: PortfolioStats = {
    totalValue: 0,
    totalCurrent: 0,
    totalInvested: 0,
    totalAssets: 0,
    totalGain: 0,
    totalPL: 0,
    totalGainPercent: '0.00',
    totalPLPercent: '0.00',
    dayChange: 0,
    dayChangePercent: 0,
    diversityScore: 0,
    topAsset: { name: 'None', percent: 0 },
    totalLiability: 0
};

/**
 * Generate unique investment ID
 */
const generateInvestmentId = (): string => {
    return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Validate investment data
 */
const validateInvestment = (investment: Partial<Investment>): string | null => {
    if (!investment.name || investment.name.trim().length === 0) {
        return 'Investment name is required';
    }
    if (!investment.type) {
        return 'Investment type is required';
    }
    if (typeof investment.investedAmount !== 'number' || investment.investedAmount < 0) {
        return 'Invested amount must be a non-negative number';
    }
    if (typeof investment.currentValue !== 'number' || investment.currentValue < 0) {
        return 'Current value must be a non-negative number';
    }
    if (!investment.platform || investment.platform.trim().length === 0) {
        return 'Platform is required';
    }
    return null;
};

/**
 * Get loan principal from settings
 */
const getLoanPrincipal = (): number => {
    try {
        const settings = localStorage.getItem('wealth-aggregator-settings');
        if (!settings) return 0;
        
        const parsed = JSON.parse(settings);
        const principal = parsed?.state?.loanPrincipal;
        
        return typeof principal === 'number' && !isNaN(principal) ? principal : 0;
    } catch {
        return 0;
    }
};

/**
 * Calculate diversity score based on asset distribution
 */
const calculateDiversityScore = (investments: Investment[]): number => {
    const activeInvestments = investments.filter(i => !i.isHiddenFromTotals);
    if (activeInvestments.length === 0) return 0;

    const totalValue = activeInvestments.reduce((sum, i) => sum + (i.currentValue || 0), 0);
    if (totalValue === 0) return 0;

    // Calculate Herfindahl-Hirschman Index (HHI) for concentration
    const weights = activeInvestments.map(i => (i.currentValue || 0) / totalValue);
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);

    // Convert HHI to diversity score (0-100)
    // HHI of 1 = completely concentrated = 0 diversity
    // HHI of 1/n = perfectly diversified = 100 diversity
    const maxDiversity = 1 / activeInvestments.length;
    const normalizedScore = Math.max(0, (1 - hhi) / (1 - maxDiversity)) * 100;

    return Math.min(100, Math.round(normalizedScore));
};

/**
 * Find top performing asset
 */
const findTopAsset = (investments: Investment[]): { name: string; percent: number } => {
    const activeInvestments = investments.filter(
        i => !i.isHiddenFromTotals && (i.investedAmount || 0) > 0
    );

    if (activeInvestments.length === 0) {
        return { name: 'None', percent: 0 };
    }

    const sorted = [...activeInvestments].sort((a, b) => {
        const gainA = ((a.currentValue || 0) - (a.investedAmount || 0)) / a.investedAmount!;
        const gainB = ((b.currentValue || 0) - (b.investedAmount || 0)) / b.investedAmount!;
        return gainB - gainA;
    });

    const top = sorted[0];
    const topGainPercent = ((top.currentValue || 0) - (top.investedAmount || 0)) / (top.investedAmount || 1) * 100;

    return { name: top.name, percent: Math.round(topGainPercent * 100) / 100 };
};

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
    investments: [],
    history: [],
    lifeEvents: [],
    stats: INITIAL_STATS,
    allocationData: [],
    assetClassData: [],
    platformData: [],
    isLoading: true,
    error: null,

    clearError: () => set({ error: null }),

    // Action to handle updates and compute derived state
    setPortfolioData: (investments: Investment[], history: HistoryEntry[], lifeEvents: LifeEvent[]) => {
        try {
            const activeInvestments = investments.filter(i => !i.isHiddenFromTotals);

            // Stats Calculation
            const totalValue = activeInvestments.reduce((sum, i) => sum + (i.currentValue || 0), 0);
            const totalInvested = activeInvestments.reduce((sum, i) => sum + (i.investedAmount || 0), 0);
            const liabilityValue = getLoanPrincipal();

            const netWorth = totalValue - liabilityValue;
            const totalGain = totalValue - totalInvested;
            const totalGainPercent = totalInvested > 0 
                ? ((totalGain / totalInvested) * 100).toFixed(2) 
                : '0.00';

            const stats: PortfolioStats = {
                totalValue: netWorth,
                totalCurrent: netWorth,
                totalAssets: totalValue,
                totalLiability: liabilityValue,
                totalInvested,
                totalGain,
                totalPL: totalGain,
                totalGainPercent,
                totalPLPercent: totalGainPercent,
                dayChange: 0,
                dayChangePercent: 0,
                diversityScore: calculateDiversityScore(investments),
                topAsset: findTopAsset(investments)
            };

            // Allocations
            const allocationMap = new Map<string, number>();
            const assetClassMap = new Map<string, number>();
            const platformMap = new Map<string, number>();

            activeInvestments.forEach(inv => {
                const val = inv.currentValue || 0;
                allocationMap.set(inv.name, (allocationMap.get(inv.name) || 0) + val);
                assetClassMap.set(inv.type, (assetClassMap.get(inv.type) || 0) + val);
                const plat = inv.platform || 'Unknown';
                platformMap.set(plat, (platformMap.get(plat) || 0) + val);
            });

            const allocationData = Array.from(allocationMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            
            const assetClassData = Array.from(assetClassMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);
            
            const platformData = Array.from(platformMap.entries())
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value);

            set({
                investments,
                history,
                lifeEvents,
                stats,
                allocationData,
                assetClassData,
                platformData,
                isLoading: false,
                error: null
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process portfolio data';
            logger.error('Failed to set portfolio data', error);
            set({ error: errorMessage, isLoading: false });
        }
    },

    refreshPortfolio: async () => {
        try {
            set({ isLoading: true, error: null });
            
            const [inv, hist, events] = await Promise.all([
                db.investments.toArray(),
                db.history.toArray(),
                db.life_events.toArray()
            ]);

            get().setPortfolioData(inv, hist, events);
            logger.debug('Portfolio refreshed successfully', { count: inv.length }, 'store');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            set({ error: errorMessage, isLoading: false });
            logger.error('Failed to refresh portfolio', error);
        }
    },

    initialize: () => {
        set({ isLoading: true, error: null });

        const subscription = liveQuery(() => Promise.all([
            db.investments.toArray(),
            db.history.toArray(),
            db.life_events.toArray()
        ])).subscribe({
            next: ([inv, hist, events]) => {
                get().setPortfolioData(inv || [], hist || [], events || []);
            },
            error: (error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                set({ error: errorMessage, isLoading: false });
                logger.error('Portfolio subscription error', error);
            }
        });

        // Return unsubscribe
        return () => subscription.unsubscribe();
    },

    // CRUD Actions
    addInvestment: async (investment) => {
        // Validate
        const validationError = validateInvestment(investment);
        if (validationError) {
            throw new Error(validationError);
        }

        try {
            const investmentToAdd: Investment = {
                ...investment,
                id: investment.id || generateInvestmentId(),
                lastUpdated: investment.lastUpdated || new Date().toISOString(),
                status: investment.status || 'ACTIVE',
                owner: investment.owner || 'SELF'
            };
            
            await db.investments.add(investmentToAdd);
            
            auditTrail.log('add_investment', `Added investment: ${investmentToAdd.name}`, {
                id: investmentToAdd.id,
                type: investmentToAdd.type,
                amount: investmentToAdd.investedAmount
            });
            
            logger.debug('Added investment', { id: investmentToAdd.id }, 'store');
        } catch (error) {
            logger.error('Failed to add investment', error);
            throw error;
        }
    },

    updateInvestment: async (id, updates) => {
        // Validate updates if they contain financial data
        if (updates.investedAmount !== undefined && updates.investedAmount < 0) {
            throw new Error('Invested amount cannot be negative');
        }
        if (updates.currentValue !== undefined && updates.currentValue < 0) {
            throw new Error('Current value cannot be negative');
        }

        try {
            // Get existing investment for audit trail
            const existing = await db.investments.get(id);
            if (!existing) {
                throw new Error(`Investment with id ${id} not found`);
            }

            await db.investments.update(id, {
                ...updates,
                lastUpdated: new Date().toISOString()
            });
            
            auditTrail.log('edit_investment', `Updated investment: ${existing.name}`, {
                id,
                changes: Object.keys(updates)
            });
            
            logger.debug('Updated investment', { id }, 'store');
        } catch (error) {
            logger.error('Failed to update investment', error);
            throw error;
        }
    },

    deleteInvestment: async (id) => {
        try {
            // Get investment for audit trail before deletion
            const investment = await db.investments.get(id);
            if (!investment) {
                throw new Error(`Investment with id ${id} not found`);
            }

            await db.investments.delete(id);
            
            auditTrail.log('delete_investment', `Deleted investment: ${investment.name}`, {
                id,
                type: investment.type,
                lastValue: investment.currentValue
            });
            
            logger.debug('Deleted investment', { id }, 'store');
        } catch (error) {
            logger.error('Failed to delete investment', error);
            throw error;
        }
    },

    addLifeEvent: async (event) => {
        try {
            const eventToAdd = {
                ...event,
                date: event.date || new Date().toISOString().split('T')[0]
            };
            await db.life_events.add(eventToAdd as LifeEvent);
            logger.debug('Added life event', { name: event.name }, 'store');
        } catch (error) {
            logger.error('Failed to add life event', error);
            throw error;
        }
    },

    deleteLifeEvent: async (id) => {
        try {
            await db.life_events.delete(id);
            logger.debug('Deleted life event', { id }, 'store');
        } catch (error) {
            logger.error('Failed to delete life event', error);
            throw error;
        }
    }
}));