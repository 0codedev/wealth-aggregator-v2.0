
import React, { useState, useMemo, useEffect } from 'react';
import {
    Wallet, ChevronDown, ChevronRight, TrendingUp, Zap, Sparkles,
    LayoutDashboard, Edit2, Trash2, AlertTriangle, ArrowUpRight,
    Keyboard, RefreshCw, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Investment, InvestmentType } from '../../../types';
import { RiskEngine } from '../../../services/RiskEngine';
import { useSettingsStore } from '../../../store/settingsStore';
import Sparkline from '../../Sparkline';
import { NoiseTexture } from '../../ui/NoiseTexture';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface HoldingsViewProps {
    investments: Investment[];
    totalAssets: number;
    onAddAsset: () => void;
    onEditAsset: (inv: Investment, e: React.MouseEvent) => void;
    onDeleteAsset: (inv: Investment, e: React.MouseEvent) => void;
    onQuickUpdate?: (id: string, invData: Partial<Investment>) => void;
    onRefreshRecurring?: () => void;
    downloadCSV?: () => void;
    formatCurrency: (val: number) => string;
    calculatePercentage: (part: number, total: number) => string;
    isPrivacyMode: boolean;
    PrivacyValue: React.FC<{ value: string | number, isPrivacyMode: boolean, className?: string }>;
    setSimulatorAsset: (inv: Investment | null) => void;

    // Props passed from Parent
    searchTerm: string;
    filterType: 'ALL' | 'PROFIT' | 'LOSS';
    groupBy: 'NONE' | 'TYPE' | 'PLATFORM';
    viewMode: 'CARD' | 'TERMINAL';
    isSpotlightEnabled?: boolean;

    // New Props for Profit Booking
    onBookProfit?: (inv: Investment) => void;
    archivedInvestments?: Investment[];
    realizedPlMap?: Record<string, { pl: number, cost: number }>;
}

interface GroupedData {
    totalInv: number;
    totalCurr: number;
    items: Investment[];
}

// ============================================================================
// Component
// ============================================================================

export const HoldingsView: React.FC<HoldingsViewProps> = ({
    investments, totalAssets, onEditAsset, onDeleteAsset, onQuickUpdate,
    formatCurrency, calculatePercentage, isPrivacyMode,
    PrivacyValue, setSimulatorAsset,
    searchTerm, filterType, groupBy, viewMode, isSpotlightEnabled = true,
    onBookProfit, archivedInvestments = [], realizedPlMap = {}
}) => {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
    const [editingCell, setEditingCell] = useState<{ id: string, field: 'investedAmount' | 'currentValue' } | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    const { bullionCap, greedKillerRoi } = useSettingsStore();

    const riskEngine = useMemo(() => new RiskEngine({
        bullionCap,
        profitThreshold: greedKillerRoi
    }), [bullionCap, greedKillerRoi]);

    const toggleGroup = (groupName: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    const filteredInvestments = useMemo(() => {
        return investments.filter(inv => {
            const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.platform.toLowerCase().includes(searchTerm.toLowerCase());
            const profit = inv.currentValue - inv.investedAmount;
            const matchesFilter = filterType === 'ALL' ? true :
                filterType === 'PROFIT' ? profit >= 0 : profit < 0;
            return matchesSearch && matchesFilter;
        });
    }, [investments, searchTerm, filterType]);

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: keyof Investment | 'profit'; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: keyof Investment | 'profit') => {
        setSortConfig(current => {
            if (!current || current.key !== key) {
                return { key, direction: 'asc' };
            }
            if (current.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return null; // Reset to default
        });
    };

    const sortedInvestments = useMemo(() => {
        let sortableItems = [...filteredInvestments];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Investment];
                let bValue: any = b[sortConfig.key as keyof Investment];

                // Special handling for Profit
                if (sortConfig.key === 'profit') {
                    aValue = a.currentValue - a.investedAmount;
                    bValue = b.currentValue - b.investedAmount;
                }

                // Handle strings (case-insensitive)
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                // Handle numbers
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredInvestments, sortConfig]);

    const sortedArchivedInvestments = useMemo(() => {
        let sortableItems = [...archivedInvestments];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof Investment];
                let bValue: any = b[sortConfig.key as keyof Investment];

                // Special handling for Profit (Realized)
                if (sortConfig.key === 'profit') {
                    aValue = realizedPlMap[a.id]?.pl ?? 0;
                    bValue = realizedPlMap[b.id]?.pl ?? 0;
                }
                // Special handling for Current Value (Exit Value = Cost + Profit)
                else if (sortConfig.key === 'currentValue') {
                    const aCost = realizedPlMap[a.id]?.cost ?? a.investedAmount;
                    const bCost = realizedPlMap[b.id]?.cost ?? b.investedAmount;
                    const aProfit = realizedPlMap[a.id]?.pl ?? 0;
                    const bProfit = realizedPlMap[b.id]?.pl ?? 0;
                    aValue = aCost + aProfit;
                    bValue = bCost + bProfit;
                }
                // Special handling for Invested (Cost Basis)
                else if (sortConfig.key === 'investedAmount') {
                    aValue = realizedPlMap[a.id]?.cost ?? a.investedAmount;
                    bValue = realizedPlMap[b.id]?.cost ?? b.investedAmount;
                }

                // Handle strings (case-insensitive)
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'asc'
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }

                // Handle numbers
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [archivedInvestments, sortConfig, realizedPlMap]);

    const groupedInvestments = useMemo(() => {
        if (groupBy === 'NONE') return null;
        const groups: Record<string, GroupedData> = {};
        sortedInvestments.forEach(inv => {
            const key = groupBy === 'TYPE' ? inv.type : inv.platform;
            if (!groups[key]) groups[key] = { totalInv: 0, totalCurr: 0, items: [] };
            groups[key].items.push(inv);
            groups[key].totalInv += inv.investedAmount;
            groups[key].totalCurr += inv.currentValue;
        });
        return groups;
    }, [sortedInvestments, groupBy]);

    // Keyboard Nav
    useEffect(() => {
        if (viewMode !== 'TERMINAL' || editingCell) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).tagName === 'INPUT') return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedRowIndex(prev => Math.min(prev + 1, sortedInvestments.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedRowIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedRowIndex >= 0 && sortedInvestments[selectedRowIndex]) {
                    setSimulatorAsset(sortedInvestments[selectedRowIndex]);
                }
            } else if (e.key === '2') {
                // Shortcut to edit Current Value
                e.preventDefault();
                if (selectedRowIndex >= 0 && sortedInvestments[selectedRowIndex]) {
                    const inv = sortedInvestments[selectedRowIndex];
                    startEditing(inv.id, 'currentValue', inv.currentValue);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [viewMode, sortedInvestments, selectedRowIndex, editingCell]);

    const startEditing = (id: string, field: 'investedAmount' | 'currentValue', currentValue: number) => {
        if (isPrivacyMode) return;
        setEditingCell({ id, field });
        setEditValue(currentValue.toString());
    };

    const saveInlineEdit = () => {
        if (editingCell && onQuickUpdate) {
            const numVal = parseFloat(editValue);
            if (!isNaN(numVal)) {
                onQuickUpdate(editingCell.id, { [editingCell.field]: numVal });
            }
        }
        setEditingCell(null);
    };

    const renderTerminalRow = (inv: Investment, index: number, isArchived = false) => {
        let profit = 0;
        let profitPercent = "0.00";
        let investedAmount = inv.investedAmount;
        let currentValue = inv.currentValue;

        if (isArchived) {
            profit = realizedPlMap[inv.id]?.pl ?? 0;
            const costBasis = realizedPlMap[inv.id]?.cost ?? inv.investedAmount;
            investedAmount = costBasis;
            profitPercent = (costBasis > 0)
                ? ((profit / costBasis) * 100).toFixed(2)
                : "∞";
            currentValue = costBasis + profit;
        } else {
            profit = inv.currentValue - inv.investedAmount;
            profitPercent = calculatePercentage(profit, inv.investedAmount);
        }

        const isProfit = profit >= 0;
        const portfolioShare = calculatePercentage(inv.currentValue, totalAssets);
        const isSelected = index === selectedRowIndex;
        const isEditingInvested = editingCell?.id === inv.id && editingCell?.field === 'investedAmount';
        const isEditingCurrent = editingCell?.id === inv.id && editingCell?.field === 'currentValue';

        return (
            <motion.tr
                key={inv.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className={`group border-b border-slate-200 dark:border-slate-800/50 transition-colors ${isSelected ? 'bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'} ${isArchived ? 'opacity-60 grayscale' : ''}`}
                onClick={() => !isArchived && setSelectedRowIndex(index)}
            >
                <td className="py-3 px-4 relative cursor-pointer" onClick={() => !isArchived && setSimulatorAsset(inv)}>
                    {isSelected && <motion.div layoutId="activeRow" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {inv.type === InvestmentType.STOCKS ? <TrendingUp size={14} /> : inv.type === InvestmentType.CRYPTO ? <Zap size={14} /> : <Wallet size={14} />}
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">{inv.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase">{inv.type}</p>
                        </div>
                    </div>
                </td>
                <td className="py-3 px-4 text-sm text-slate-400">{inv.platform}</td>
                <td className="py-3 px-4 text-right font-mono text-sm text-slate-400 cursor-cell hover:bg-slate-800/50 hover:text-white transition-colors" onClick={() => !isArchived && startEditing(inv.id, 'investedAmount', inv.investedAmount)}>
                    {isEditingInvested ? <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveInlineEdit} autoFocus className="w-24 bg-slate-900 border border-indigo-500 rounded px-1 py-0.5 text-right outline-none text-white focus:ring-1 focus:ring-indigo-500" /> : <PrivacyValue value={investedAmount} isPrivacyMode={isPrivacyMode} />}
                </td>
                <td className="py-3 px-4 text-right font-mono text-sm font-bold text-white cursor-cell hover:bg-slate-800/50 hover:text-indigo-400 transition-colors" onClick={() => !isArchived && startEditing(inv.id, 'currentValue', inv.currentValue)}>
                    {isEditingCurrent ? <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveInlineEdit} autoFocus className="w-24 bg-slate-900 border border-indigo-500 rounded px-1 py-0.5 text-right outline-none text-white focus:ring-1 focus:ring-indigo-500" /> : <PrivacyValue value={currentValue} isPrivacyMode={isPrivacyMode} />}
                </td>
                <td className="py-3 px-4 text-right">
                    <div className={`font-mono text-sm font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>{isProfit ? '+' : ''}{profitPercent}%</div>
                    <div className={`text-[10px] ${isProfit ? 'text-emerald-500/60' : 'text-rose-500/60'}`}>{isProfit ? '+' : ''}{formatCurrency(profit)}</div>
                </td>
                <td className="py-3 px-4 text-center">
                    <div className="flex justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                        <Sparkline trend={isProfit ? 'UP' : 'DOWN'} width={60} height={20} />
                    </div>
                </td>
                <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-medium text-slate-500">{portfolioShare}%</span>
                        <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: `${Math.max(0, Number(portfolioShare))}%` }}></div></div>
                    </div>
                </td>
                <td className="py-3 px-4 text-right">
                    {!isArchived && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onBookProfit?.(inv); }} className="p-1.5 hover:bg-emerald-500/10 rounded text-slate-500 hover:text-emerald-400 transition-colors" title="Book Profit"><ArrowUpRight size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onEditAsset(inv, e); }} className="p-1.5 hover:bg-indigo-500/10 rounded text-slate-500 hover:text-indigo-400 transition-colors"><Edit2 size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteAsset(inv, e); }} className="p-1.5 hover:bg-rose-500/10 rounded text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                    )}
                    {isArchived && (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Archived</span>
                    )}
                </td>
            </motion.tr>
        );
    };

    const renderCardItem = (inv: Investment, isArchived = false) => {
        let profit = 0;
        let profitPercent = "0.00";
        let currentValue = inv.currentValue;

        if (isArchived) {
            profit = realizedPlMap[inv.id]?.pl ?? 0;
            const costBasis = realizedPlMap[inv.id]?.cost ?? inv.investedAmount;
            profitPercent = (costBasis > 0)
                ? ((profit / costBasis) * 100).toFixed(2)
                : "∞";
            currentValue = costBasis + profit;
        } else {
            profit = inv.currentValue - inv.investedAmount;
            profitPercent = calculatePercentage(profit, inv.investedAmount);
        }

        const isProfit = profit >= 0;
        const { shouldBookProfit, isBubbleRisk } = riskEngine.analyzeAsset(inv);

        let Icon = Wallet;
        if (inv.type === InvestmentType.STOCKS) Icon = TrendingUp;
        else if (inv.type === InvestmentType.CRYPTO) Icon = Zap;
        else if (inv.type === InvestmentType.DIGITAL_GOLD || inv.type === InvestmentType.DIGITAL_SILVER) Icon = Sparkles;
        else if (inv.type === InvestmentType.REAL_ESTATE) Icon = LayoutDashboard;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={inv.id}
                onClick={() => !isArchived && setSimulatorAsset(inv)}
                className={`bg-white dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-white/5 transition-all duration-300 group relative overflow-hidden cursor-pointer ${isSpotlightEnabled && !isArchived ? 'hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-indigo-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'} ${isArchived ? 'opacity-60 grayscale' : ''}`}
            >
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}><Icon size={20} /></div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[140px] flex items-center gap-1">{inv.name}{isBubbleRisk && !isArchived && <AlertTriangle size={12} className="text-fuchsia-500 animate-pulse" />}</h4>
                            <p className="text-xs text-slate-500">{inv.platform}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white text-base"><PrivacyValue value={currentValue} isPrivacyMode={isPrivacyMode} /></p>
                        <p className={`text-xs font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>{isProfit ? '+' : ''}{profitPercent}%</p>
                    </div>
                </div>

                {isSpotlightEnabled && !isArchived && (
                    <div className="absolute bottom-12 left-0 right-0 h-8 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                        <Sparkline trend={isProfit ? 'UP' : 'DOWN'} width={300} height={32} />
                    </div>
                )}

                {!isArchived && shouldBookProfit && (<div className="mb-3"><button onClick={(e) => { e.stopPropagation(); onBookProfit?.(inv); }} className="w-full flex items-center justify-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors"><ArrowUpRight size={12} /> TAKE PROFIT</button></div>)}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5 relative z-10">
                    <div className="flex items-center gap-2">{inv.recurring?.isEnabled && <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded flex items-center gap-1"><RefreshCw size={10} /> SIP</span>}<span className="text-[10px] text-slate-500 font-mono">{calculatePercentage(inv.currentValue, totalAssets)}%</span></div>
                    {!isArchived && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onBookProfit?.(inv); }} className="p-1.5 hover:bg-emerald-500/10 rounded text-slate-400 hover:text-emerald-400 transition-colors" title="Book Profit"><ArrowUpRight size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onEditAsset(inv, e); }} className="p-1.5 hover:bg-indigo-500/10 rounded text-slate-400 hover:text-indigo-400 transition-colors"><Edit2 size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteAsset(inv, e); }} className="p-1.5 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                    )}
                    {isArchived && (
                        <span className="text-xs font-bold text-amber-500">Archived</span>
                    )}
                </div>
            </motion.div>
        );
    };

    const SortIcon = ({ columnKey }: { columnKey: keyof Investment | 'profit' }) => {
        if (sortConfig?.key !== columnKey) return <span className="ml-1 text-slate-600 select-none opacity-0 group-hover:opacity-100 transition-opacity">⇅</span>;
        return <span className="ml-1 text-indigo-400">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
    };

    const SortableHeader = ({ label, columnKey, align = 'left', className = '' }: { label: string, columnKey: keyof Investment | 'profit', align?: 'left' | 'right' | 'center', className?: string }) => (
        <th
            className={`py-3 px-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-300 transition-colors select-none group ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} ${className}`}
            onClick={() => handleSort(columnKey)}
        >
            {label} <SortIcon columnKey={columnKey} />
        </th>
    );

    const TableHeader = () => (
        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5 relative">
            <tr>
                <SortableHeader label="Asset" columnKey="name" />
                <SortableHeader label="Platform" columnKey="platform" />
                <SortableHeader label="Invested" columnKey="investedAmount" align="right" />
                <SortableHeader label="Current" columnKey="currentValue" align="right" />
                <SortableHeader label="P&L" columnKey="profit" align="right" />
                <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase text-center">Trend</th>
                <SortableHeader label="Alloc." columnKey="currentValue" align="right" />
                <th className="py-3 px-4"></th>
            </tr>
        </thead>
    );

    return (
        <div className="space-y-4">
            {viewMode === 'TERMINAL' && (
                <div className="flex items-center gap-4 text-xs text-slate-500 px-2 mb-2 animate-in fade-in">
                    <div className="flex items-center gap-1"><span className="p-1 bg-slate-800 rounded border border-slate-700"><Keyboard size={10} /></span> <span>Nav</span></div>
                    <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono">Enter</span> <span>Simulate</span></div>
                    <div className="flex items-center gap-1"><span className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono">2</span> <span>Edit</span></div>
                </div>
            )}

            {investments.length === 0 && !showArchived ? (
                <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 text-slate-500 mb-4"><Box size={32} /></div>
                    <p className="text-slate-400 font-medium">Your portfolio is empty.</p>
                </div>
            ) : filteredInvestments.length === 0 && !showArchived ? (
                <div className="text-center py-20"><p className="text-slate-500">No assets match your search.</p></div>
            ) : groupBy === 'NONE' ? (
                viewMode === 'TERMINAL' ? (
                    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
                        <NoiseTexture opacity={0.02} />
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse relative z-10 min-w-[800px]">
                                <TableHeader />
                                <tbody>{sortedInvestments.map((inv, index) => renderTerminalRow(inv, index))}</tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {sortedInvestments.map(inv => renderCardItem(inv))}
                    </div>
                )
            ) : (
                groupedInvestments && Object.entries(groupedInvestments).map(([groupKey, groupData]: [string, GroupedData]) => (
                    <div key={groupKey} className="mb-4 rounded-2xl border border-white/5 overflow-hidden bg-slate-900/30 shadow-lg transition-all hover:border-slate-700">
                        <div
                            className="p-4 bg-slate-900/50 backdrop-blur-md flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors select-none"
                            onClick={() => toggleGroup(groupKey)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl transition-transform duration-200 ${expandedGroups[groupKey] ? 'bg-indigo-500/20 text-indigo-400 rotate-90' : 'bg-slate-800 text-slate-400'}`}>
                                    <ChevronRight size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base leading-tight">{groupKey}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{groupData.items.length} assets • {formatCurrency(groupData.totalCurr)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-mono font-bold ${(groupData.totalCurr - groupData.totalInv) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {(groupData.totalCurr - groupData.totalInv) >= 0 ? '+' : ''}{calculatePercentage(groupData.totalCurr - groupData.totalInv, groupData.totalInv)}%
                                </div>
                            </div>
                        </div>

                        {expandedGroups[groupKey] && (
                            <div className="p-4 bg-black/20 border-t border-white/5 animate-in slide-in-from-top-1 duration-200">
                                {viewMode === 'TERMINAL' ? (
                                    <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden">
                                        <div className="overflow-x-auto w-full">
                                            <table className="w-full text-left border-collapse min-w-[800px]">
                                                <TableHeader />
                                                <tbody>{groupData.items.map((inv, idx) => renderTerminalRow(inv, idx))}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                        {groupData.items.map(inv => renderCardItem(inv))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}

            {/* Archived Section Toggle */}
            {archivedInvestments.length > 0 && (
                <div className="mt-8 border-t border-slate-800 pt-6">
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mb-4 text-sm font-semibold"
                    >
                        <ChevronDown size={16} className={`transition-transform ${showArchived ? 'rotate-180' : ''}`} />
                        Show Archived Holdings ({archivedInvestments.length})
                    </button>

                    {showArchived && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            {viewMode === 'TERMINAL' ? (
                                <div>
                                    <div className="bg-slate-900/20 rounded-2xl border border-white/5 overflow-hidden shadow-sm opacity-60 hover:opacity-100 transition-opacity">
                                        <div className="overflow-x-auto w-full">
                                            <table className="w-full text-left border-collapse min-w-[800px]">
                                                <TableHeader />
                                                <tbody>{sortedArchivedInvestments.map((inv, index) => renderTerminalRow(inv, index, true))}</tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 opacity-60 hover:opacity-100 transition-opacity">
                                    {sortedArchivedInvestments.map(inv => renderCardItem(inv, true))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
