
import React, { useState, useEffect } from 'react';
import { liveQuery } from 'dexie';
import { db, Mistake } from '../../database';
import { Download, Upload, Plus, Trash2, DollarSign, Brain, Target, ShieldAlert, Pencil, ArrowLeft, TrendingDown, BookOpen, Search, Filter, SortAsc, Calendar, Zap } from 'lucide-react';
import { formatCurrency, calculateStreaks } from '../../utils/helpers';
import { useToast } from '../shared/ToastProvider';

interface MistakesReflectorProps {
    onBack: () => void;
}

const MistakesReflector: React.FC<MistakesReflectorProps> = ({ onBack }) => {
    const { toast } = useToast();
    const [mistakes, setMistakes] = useState<Mistake[]>([]);
    const [view, setView] = useState<'LIST' | 'new'>('LIST');

    // Filter & Sort State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<'ALL' | 'TRADING' | 'LIFE'>('ALL');
    const [sortBy, setSortBy] = useState<'DATE' | 'COST'>('DATE');

    // Form State
    const [title, setTitle] = useState('');
    const [cost, setCost] = useState('');
    const [category, setCategory] = useState<'TRADING' | 'LIFE'>('TRADING');
    const [lesson, setLesson] = useState('');
    const [emotionalState, setEmotionalState] = useState('');
    const [editId, setEditId] = useState<string | null>(null);

    // Data Subscription & Migration
    useEffect(() => {
        // Subscribe to DB updates
        const subscription = liveQuery(() => db.mistakes.orderBy('date').reverse().toArray())
            .subscribe(setMistakes);

        // Migration Check: If DB is empty but localStorage has data, migrate it!
        const migrateData = async () => {
            const hasData = await db.mistakes.count();
            if (hasData === 0) {
                const saved = localStorage.getItem('financial_mistakes');
                if (saved) {
                    try {
                        const legacyMistakes: Mistake[] = JSON.parse(saved);
                        if (legacyMistakes.length > 0) {
                            await db.mistakes.bulkAdd(legacyMistakes);
                            toast.success("Migrated your lessons to the secure database!");
                        }
                    } catch (e) {
                        console.error("Migration failed", e);
                    }
                }
            }
        };
        migrateData();

        return () => subscription.unsubscribe();
    }, []);

    const saveMistakeToDB = async (mistake: Mistake) => {
        try {
            await db.mistakes.put(mistake);
        } catch (error) {
            console.error("Failed to save mistake:", error);
            toast.error("Failed to save. Please try again.");
        }
    };

    const deleteMistakeFromDB = async (id: string) => {
        try {
            await db.mistakes.delete(id);
        } catch (error) {
            console.error("Failed to delete mistake:", error);
        }
    };

    // Backup & Restore Handlers
    const handleBackup = () => {
        const dataStr = JSON.stringify(mistakes, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `MirrorOfTruth_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Lessons backed up successfully!");
    };

    const handleRestore = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const imported = JSON.parse(event.target?.result as string);
                    if (Array.isArray(imported)) {
                        if (window.confirm(`Restore ${imported.length} lessons? This will merge with existing ones.`)) {
                            await db.mistakes.bulkPut(imported); // Use put to overwrite duplicates
                            toast.success("Lessons restored successfully!");
                        }
                    } else {
                        toast.error("Invalid backup file.");
                    }
                } catch (err) {
                    toast.error("Failed to parse backup file.");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleSubmit = () => {
        if (!title || !cost || !lesson) {
            toast.warning("Please fill in all required fields.");
            return;
        }

        const mistakeData: Mistake = {
            id: editId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: editId ? (mistakes.find(m => m.id === editId)?.date || new Date().toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
            title,
            cost: parseFloat(cost),
            category,
            lesson,
            emotionalState
        };

        if (editId) {
            // Update existing
            saveMistakeToDB(mistakeData);
            toast.success("Reflection updated.");
        } else {
            // Create new
            saveMistakeToDB(mistakeData);
            toast.success("Reflection logged. Pain is the best teacher.");
        }

        resetForm();
        setView('LIST');
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (import.meta.env.DEV) console.log("Deleting mistake:", id);
        if (window.confirm('Forget this mistake? (Not recommended unless erroneous entry)')) {
            deleteMistakeFromDB(id);
            toast.success("Mistake deleted.");
        }
    };

    const handleEdit = (mistake: Mistake) => {
        setTitle(mistake.title);
        setCost(mistake.cost.toString());
        setCategory(mistake.category);
        setLesson(mistake.lesson);
        setEmotionalState(mistake.emotionalState || '');
        setEditId(mistake.id);
        setView('new');
    };

    const resetForm = () => {
        setTitle('');
        setCost('');
        setCategory('TRADING');
        setLesson('');
        setEmotionalState('');
        setEditId(null);
    };

    const totalCost = mistakes.reduce((acc, m) => acc + m.cost, 0);

    // Calculate Mistake-Free Streak (days since last mistake)
    const mistakeFreeStreak = mistakes.length > 0
        ? Math.floor((new Date().getTime() - new Date(mistakes[0].date).getTime()) / (1000 * 3600 * 24))
        : 0;

    // Filter & Sort Logic
    const filteredMistakes = mistakes
        .filter(m => {
            const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.lesson.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'ALL' || m.category === filterCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'DATE') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'COST') return b.cost - a.cost;
            return 0;
        });

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-black/20 animate-in fade-in duration-300 overflow-y-auto">
            {/* Header (Not Sticky) */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldAlert className="text-rose-500" /> Mirror of Truth
                        </h2>
                        <div className="flex items-center gap-3">
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Mistakes & Learnings Reflector</p>
                            {mistakeFreeStreak > 0 && (
                                <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/20">
                                    <Zap size={10} /> {mistakeFreeStreak} Day Streak
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleBackup}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        title="Backup Lessons to File"
                    >
                        <Download size={16} /> Backup
                    </button>
                    <button
                        onClick={handleRestore}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        title="Restore Lessons from File"
                    >
                        <Upload size={16} /> Restore
                    </button>
                    <button
                        onClick={() => setView('new')}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-transform active:scale-95 ml-2"
                    >
                        <Plus size={18} /> Log New Mistake
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full"> {/* Centered container for max width */}

                {view === 'LIST' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Summary & Insights */}
                        <div className="space-y-6">
                            {/* Summary Card */}
                            <div className="bg-rose-500 text-white p-8 rounded-3xl shadow-xl shadow-rose-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-20 transform rotate-12">
                                    <TrendingDown size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-rose-100 text-sm font-bold uppercase tracking-widest mb-2">Total Tuition Paid</p>
                                    <h3 className="text-5xl font-black mb-4">{formatCurrency(totalCost)}</h3>
                                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                                        <p className="text-sm font-medium italic opacity-95">
                                            "Experience is simply the name we give our mistakes." - Oscar Wilde
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Filters & Stats */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search lessons..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 transition-colors text-sm font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Category Filters */}
                                <div>
                                    <h4 className="text-slate-500 font-bold uppercase text-xs mb-3 flex items-center gap-2"><Filter size={12} /> Filter Category</h4>
                                    <div className="flex gap-2">
                                        {(['ALL', 'TRADING', 'LIFE'] as const).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setFilterCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sort */}
                                <div>
                                    <h4 className="text-slate-500 font-bold uppercase text-xs mb-3 flex items-center gap-2"><SortAsc size={12} /> Sort By</h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSortBy('DATE')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'DATE' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            Latest
                                        </button>
                                        <button
                                            onClick={() => setSortBy('COST')}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'COST' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                        >
                                            Highest Cost
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 my-4"></div>

                                <h4 className="text-slate-500 font-bold uppercase text-xs mb-4">Distribution</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Trading Errors</span>
                                        <span className="text-sm font-bold">{mistakes.filter(m => m.category === 'TRADING').length}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(mistakes.filter(m => m.category === 'TRADING').length / (mistakes.length || 1)) * 100}%` }}></div>
                                    </div>

                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Life Lessons</span>
                                        <span className="text-sm font-bold">{mistakes.filter(m => m.category === 'LIFE').length}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(mistakes.filter(m => m.category === 'LIFE').length / (mistakes.length || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: List of Mistakes */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-2 mb-2 justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="text-slate-400" size={20} />
                                    <h3 className="font-bold text-xl text-slate-700 dark:text-slate-300">Lesson Archive</h3>
                                    <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-full">{filteredMistakes.length}</span>
                                </div>
                                {searchTerm && (
                                    <span className="text-xs text-slate-400 font-medium">Found {filteredMistakes.length} matches</span>
                                )}
                            </div>

                            {mistakes.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50">
                                    <Brain size={64} className="mx-auto text-slate-300 mb-6" />
                                    <p className="text-slate-500 font-bold text-lg">No mistakes logged yet.</p>
                                    <p className="text-sm text-slate-400 mt-2">Either you are perfect, or you are not being honest with yourself.</p>
                                    <button
                                        onClick={() => setView('new')}
                                        className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        Start Reflecting
                                    </button>
                                </div>
                            ) : filteredMistakes.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <p className="text-slate-400 font-bold">No matching lessons found.</p>
                                    <button onClick={() => { setSearchTerm(''); setFilterCategory('ALL'); }} className="text-indigo-500 text-sm font-bold mt-2 hover:underline">Clear Filters</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredMistakes.map(mistake => (
                                        <div key={mistake.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all group relative">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${mistake.category === 'TRADING' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
                                                        {mistake.category}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-400">{mistake.date}</span>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(mistake);
                                                        }}
                                                        className="p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(e, mistake.id)}
                                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-bold text-slate-800 dark:text-white text-xl">{mistake.title}</h4>
                                                <p className="text-rose-500 font-mono font-black text-lg">-{formatCurrency(mistake.cost)}</p>
                                            </div>

                                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border-l-4 border-emerald-500">
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-2 flex items-center gap-1">
                                                    <Brain size={12} /> Key Lesson
                                                </p>
                                                <p className="text-base text-slate-700 dark:text-slate-300 italic leading-relaxed">"{mistake.lesson}"</p>
                                            </div>

                                            {mistake.emotionalState && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Context:</span>
                                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                        {mistake.emotionalState}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ADD FORM */
                    <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
                            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                                <button onClick={() => setView('LIST')} className="text-sm text-slate-500 hover:text-indigo-500 font-bold flex items-center gap-1 transition-colors">
                                    <ArrowLeft size={16} /> Back to List
                                </button>
                                <div className="h-4 w-px bg-slate-300 mx-2"></div>
                                <h3 className="font-bold text-xl">{editId ? 'Edit Reflection' : 'New Reflection'}</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Describe Context</label>
                                    <input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. FOMO into high volatility stock"
                                        className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-rose-500 transition-all font-bold text-xl"
                                        autoFocus
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Financial Loss</label>
                                        <div className="relative">
                                            <DollarSign size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="number"
                                                value={cost}
                                                onChange={e => setCost(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-slate-50 dark:bg-slate-950 p-4 pl-12 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-rose-500 transition-all font-mono text-lg"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                                        <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                            <button
                                                onClick={() => setCategory('TRADING')}
                                                className={`rounded-lg py-3 text-sm font-bold transition-all ${category === 'TRADING' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <Target size={16} className="inline mr-2" /> Trade
                                            </button>
                                            <button
                                                onClick={() => setCategory('LIFE')}
                                                className={`rounded-lg py-3 text-sm font-bold transition-all ${category === 'LIFE' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <TrendingDown size={16} className="inline mr-2" /> Life
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Emotional Context <span className="text-slate-300 font-normal lowercase">(optional)</span></label>
                                    <input
                                        value={emotionalState}
                                        onChange={e => setEmotionalState(e.target.value)}
                                        placeholder="e.g. Greedy, Tired, Euphoric, Desperate"
                                        className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-emerald-600 uppercase mb-2 flex items-center gap-2">
                                        <Brain size={16} /> The Gold: What did you learn?
                                    </label>
                                    <textarea
                                        value={lesson}
                                        onChange={e => setLesson(e.target.value)}
                                        placeholder="Reflect deeply. How will you prevent this next time? This is the most important part."
                                        className="w-full bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800/30 outline-none focus:border-emerald-500 transition-all min-h-[160px] resize-none text-slate-800 dark:text-slate-200 text-lg leading-relaxed shadow-inner"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all mt-4"
                                >
                                    {editId ? 'Update Reflection' : 'Commit to Database'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MistakesReflector;
