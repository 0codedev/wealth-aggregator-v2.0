import { useMemo } from 'react';
import { Investment, PortfolioStats, AggregatedData } from '../types';

export const useDerivedStats = (investments: Investment[], globalStats: PortfolioStats) => {
    return useMemo(() => {
        // If no investments (or we want to rely on global stats for the 'ALL' case optimization),
        // we could potentially just return globalStats. 
        // BUT, globalStats in the store might be stale if we are filtering.
        // It's safer to recompute for the specific list of investments provided.

        const activeInvestments = investments.filter(inv => !inv.isHiddenFromTotals);

        const totalCurrent = activeInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
        const totalInvested = activeInvestments.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0);
        const totalPL = totalCurrent - totalInvested;
        const totalPLPercent = totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : '0.00';

        // Diversity Score
        const uniqueTypes = new Set(activeInvestments.map(i => i.type));
        const diversityScore = Math.min(100, uniqueTypes.size * 15);

        // Top Asset
        let topAsset = { name: 'None', percent: 0 };
        if (activeInvestments.length > 0) {
            const sorted = [...activeInvestments].sort((a, b) => {
                const gainA = ((a.currentValue || 0) - (a.investedAmount || 0)) / (a.investedAmount || 1);
                const gainB = ((b.currentValue || 0) - (b.investedAmount || 0)) / (b.investedAmount || 1);
                return gainB - gainA;
            });
            const top = sorted[0];
            const topGain = ((top.currentValue || 0) - (top.investedAmount || 0)) / (top.investedAmount || 1) * 100;
            topAsset = { name: top.name, percent: topGain };
        }

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

        const allocationData = Array.from(allocationMap.entries()).map(([name, value]) => ({ name, value }));
        const assetClassData = Array.from(assetClassMap.entries()).map(([name, value]) => ({ name, value }));
        const platformData = Array.from(platformMap.entries()).map(([name, value]) => ({ name, value }));

        const stats: PortfolioStats = {
            ...globalStats, // Keep basics like loanBalance if not recalculated
            totalValue: totalCurrent - (globalStats.totalLiability || 0), // Use global liability for now? Or should liability be filtered too?
            // Liability is typically global settings based. Let's keep it simple.
            totalCurrent,
            totalAssets: totalCurrent,
            totalInvested,
            totalPL,
            totalPLPercent,
            totalGain: totalPL, // Alias
            totalGainPercent: totalPLPercent, // Alias
            diversityScore,
            topAsset
        };

        return { stats, allocationData, assetClassData, platformData };
    }, [investments, globalStats]);
};
