/**
 * XIRR (Extended Internal Rate of Return) Calculator
 * 
 * Uses Newton-Raphson method to calculate the annualized return
 * for a series of irregular cash flows.
 */

export interface CashFlow {
    date: Date;
    amount: number; // negative for outflows (investments), positive for inflows (returns/withdrawals)
}

/**
 * Calculate the difference in years between two dates (actual/365)
 */
const yearFraction = (d1: Date, d2: Date): number => {
    return (d2.getTime() - d1.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
};

/**
 * Net Present Value of cash flows at a given rate
 */
const npv = (rate: number, cashFlows: CashFlow[], baseDate: Date): number => {
    return cashFlows.reduce((sum, cf) => {
        const years = yearFraction(baseDate, cf.date);
        return sum + cf.amount / Math.pow(1 + rate, years);
    }, 0);
};

/**
 * Derivative of NPV with respect to rate
 */
const npvDerivative = (rate: number, cashFlows: CashFlow[], baseDate: Date): number => {
    return cashFlows.reduce((sum, cf) => {
        const years = yearFraction(baseDate, cf.date);
        if (years === 0) return sum;
        return sum - years * cf.amount / Math.pow(1 + rate, years + 1);
    }, 0);
};

/**
 * Calculate XIRR using Newton-Raphson method
 * 
 * @param cashFlows Array of {date, amount} objects. Investments should be negative, current value positive.
 * @param guess Initial guess for the rate (default 0.1 = 10%)
 * @param tolerance Convergence tolerance (default 1e-7)
 * @param maxIterations Maximum iterations (default 100)
 * @returns Annualized return as a decimal (0.15 = 15%), or null if no convergence
 */
export const calculateXIRR = (
    cashFlows: CashFlow[],
    guess: number = 0.1,
    tolerance: number = 1e-7,
    maxIterations: number = 100
): number | null => {
    if (cashFlows.length < 2) return null;

    // Need both positive and negative cash flows
    const hasPositive = cashFlows.some(cf => cf.amount > 0);
    const hasNegative = cashFlows.some(cf => cf.amount < 0);
    if (!hasPositive || !hasNegative) return null;

    const baseDate = cashFlows[0].date;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
        const value = npv(rate, cashFlows, baseDate);
        const derivative = npvDerivative(rate, cashFlows, baseDate);

        if (Math.abs(derivative) < 1e-10) {
            // Try a different starting point
            rate = rate + 0.1;
            continue;
        }

        const newRate = rate - value / derivative;

        if (Math.abs(newRate - rate) < tolerance) {
            // Guard against unrealistic results
            if (newRate < -0.99 || newRate > 100) return null;
            return newRate;
        }

        rate = newRate;

        // Guard against divergence
        if (rate < -0.99) rate = -0.9;
        if (rate > 100) rate = 10;
    }

    // If Newton-Raphson didn't converge, try bisection method
    return bisectionXIRR(cashFlows, baseDate);
};

/**
 * Fallback bisection method for when Newton-Raphson doesn't converge
 */
const bisectionXIRR = (
    cashFlows: CashFlow[],
    baseDate: Date,
    tolerance: number = 1e-5
): number | null => {
    let low = -0.9;
    let high = 10.0;

    for (let i = 0; i < 200; i++) {
        const mid = (low + high) / 2;
        const value = npv(mid, cashFlows, baseDate);

        if (Math.abs(value) < tolerance) return mid;

        if (value > 0) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return null;
};

/**
 * Build cash flows from investment history for XIRR calculation
 * 
 * Takes an array of investment events (purchases with dates and amounts)
 * and a current portfolio value, returns formatted cash flows.
 */
export const buildPortfolioCashFlows = (
    investments: Array<{ investedAmount: number; lastUpdated: string; currentValue: number }>,
    totalCurrentValue: number
): CashFlow[] => {
    const flows: CashFlow[] = [];

    // Each investment is an outflow (negative) on its purchase date
    for (const inv of investments) {
        const date = new Date(inv.lastUpdated);
        if (!isNaN(date.getTime()) && inv.investedAmount > 0) {
            flows.push({ date, amount: -inv.investedAmount });
        }
    }

    // Current portfolio value is an inflow (positive) today
    if (totalCurrentValue > 0) {
        flows.push({ date: new Date(), amount: totalCurrentValue });
    }

    // Sort by date
    flows.sort((a, b) => a.date.getTime() - b.date.getTime());

    return flows;
};

/**
 * Calculate rolling XIRR for different time periods
 */
export const calculateRollingXIRR = (
    investments: Array<{ investedAmount: number; lastUpdated: string; currentValue: number }>,
    totalCurrentValue: number
): Record<string, number | null> => {
    const now = new Date();
    const periods: Record<string, number> = {
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '1Y': 365,
        '3Y': 1095,
        '5Y': 1825,
        'ALL': Infinity,
    };

    const result: Record<string, number | null> = {};

    for (const [label, days] of Object.entries(periods)) {
        const cutoffDate = days === Infinity
            ? new Date(0)
            : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const filteredInvestments = investments.filter(inv => {
            const d = new Date(inv.lastUpdated);
            return d >= cutoffDate;
        });

        if (filteredInvestments.length === 0) {
            result[label] = null;
            continue;
        }

        // Calculate invested & current for filtered period
        const periodInvested = filteredInvestments.reduce((s, i) => s + i.investedAmount, 0);
        const periodCurrent = filteredInvestments.reduce((s, i) => s + i.currentValue, 0);

        const flows = buildPortfolioCashFlows(filteredInvestments, periodCurrent);
        result[label] = calculateXIRR(flows);
    }

    return result;
};

/**
 * Simple CAGR calculation as a comparison benchmark
 */
export const calculateCAGR = (
    beginningValue: number,
    endingValue: number,
    years: number
): number | null => {
    if (beginningValue <= 0 || years <= 0) return null;
    return Math.pow(endingValue / beginningValue, 1 / years) - 1;
};
