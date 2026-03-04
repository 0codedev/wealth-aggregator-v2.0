import React, { useState } from 'react';
import {
    BookOpen, GraduationCap, Play, CheckCircle, Lock, Star,
    TrendingUp, PieChart, Shield, Calculator, Award, Clock,
    ChevronRight, Flame, Target, Zap
} from 'lucide-react';

type CourseCategory = 'basics' | 'intermediate' | 'advanced' | 'strategies';

interface Course {
    id: string;
    title: string;
    lessons: number;
    completed: number;
    duration: string;
    category: CourseCategory;
    icon: string;
    locked: boolean;
}

const COURSES: Course[] = [
    { id: '1', title: 'Investing 101', lessons: 8, completed: 8, duration: '2h', category: 'basics', icon: '📈', locked: false },
    { id: '2', title: 'Understanding Mutual Funds', lessons: 6, completed: 4, duration: '1.5h', category: 'basics', icon: '📊', locked: false },
    { id: '3', title: 'Tax Planning for Investors', lessons: 5, completed: 0, duration: '1h', category: 'basics', icon: '🧾', locked: false },
    { id: '4', title: 'Technical Analysis Basics', lessons: 10, completed: 2, duration: '3h', category: 'intermediate', icon: '📉', locked: false },
    { id: '5', title: 'Portfolio Diversification', lessons: 7, completed: 0, duration: '2h', category: 'intermediate', icon: '🎯', locked: false },
    { id: '6', title: 'Options & Derivatives', lessons: 12, completed: 0, duration: '4h', category: 'advanced', icon: '⚡', locked: true },
    { id: '7', title: 'Algorithmic Trading', lessons: 15, completed: 0, duration: '5h', category: 'advanced', icon: '🤖', locked: true },
    { id: '8', title: 'Value Investing Strategy', lessons: 8, completed: 0, duration: '2.5h', category: 'strategies', icon: '💎', locked: false },
    { id: '9', title: 'Momentum Trading', lessons: 6, completed: 0, duration: '2h', category: 'strategies', icon: '🚀', locked: true },
];

export const MobileAcademy: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<CourseCategory>('basics');

    const totalCompleted = COURSES.reduce((s, c) => s + c.completed, 0);
    const totalLessons = COURSES.reduce((s, c) => s + c.lessons, 0);
    const overallProgress = totalLessons > 0 ? (totalCompleted / totalLessons * 100) : 0;
    const filteredCourses = COURSES.filter(c => c.category === activeCategory);

    return (
        <div className="pb-24">
            <div className="px-4 pt-4 space-y-4">
                {/* Progress Banner */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-5 h-5" />
                            <h2 className="text-sm font-bold">Your Learning Journey</h2>
                        </div>
                        <div className="flex items-end gap-3 mb-3">
                            <span className="text-3xl font-black">{overallProgress.toFixed(0)}%</span>
                            <span className="text-xs text-indigo-200 pb-1">{totalCompleted}/{totalLessons} lessons</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {([
                        { id: 'basics' as const, label: 'Basics', icon: BookOpen },
                        { id: 'intermediate' as const, label: 'Intermediate', icon: TrendingUp },
                        { id: 'advanced' as const, label: 'Advanced', icon: Zap },
                        { id: 'strategies' as const, label: 'Strategies', icon: Target },
                    ]).map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                            <cat.icon className="w-3.5 h-3.5" /> {cat.label}
                        </button>
                    ))}
                </div>

                {/* Course List */}
                <div className="space-y-3">
                    {filteredCourses.map(course => {
                        const progress = course.lessons > 0 ? (course.completed / course.lessons * 100) : 0;
                        const isComplete = progress >= 100;
                        return (
                            <div key={course.id} className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 ${course.locked ? 'opacity-60' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                                        {course.locked ? '🔒' : course.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{course.title}</h3>
                                            {isComplete && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                                            <span>{course.lessons} lessons</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{course.duration}</span>
                                        </div>
                                        {!course.locked && (
                                            <div>
                                                <div className="flex justify-between text-[9px] mb-1">
                                                    <span className="text-slate-400">{course.completed}/{course.lessons} completed</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!course.locked && (
                                    <button className="w-full mt-3 py-2 bg-indigo-500/10 text-indigo-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-indigo-500/20 transition-colors">
                                        <Play className="w-3.5 h-3.5" /> {progress > 0 && progress < 100 ? 'Continue' : progress >= 100 ? 'Review' : 'Start'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
