'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import {
    FileText,
    ChevronLeft,
    Trophy,
    GraduationCap,
    BookOpen,
    Loader2,
    Search,
    TrendingUp,
    Download
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ChildResultsView() {
    const params = useParams();
    const router = useRouter();
    const childId = params.id;

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (childId) {
            fetchResults();
        }
    }, [childId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/results/student/${childId}`);
            setResults(res.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGradeColor = (grade) => {
        if (grade?.startsWith('A')) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (grade === 'B') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (grade === 'C') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    const filteredResults = results.filter(r =>
        r.exam?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate Performance Stats
    const stats = {
        avgPercentage: results.length > 0
            ? (results.reduce((acc, r) => acc + (r.marksObtained / r.totalMarks), 0) / results.length * 100).toFixed(1)
            : 0,
        totalExams: results.length,
        passedExams: results.filter(r => r.grade !== 'F').length
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Exam Results</h1>
                    <p className="text-gray-400">Academic performance and report card.</p>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Average Score', value: `${stats.avgPercentage}%`, color: 'blue', icon: TrendingUp },
                    { label: 'Exams Taken', value: stats.totalExams, color: 'purple', icon: FileText },
                    { label: 'Exams Passed', value: stats.passedExams, color: 'green', icon: GraduationCap },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20", `bg-${stat.color}-500`)} />
                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", `bg-${stat.color}-500/10 text-${stat.color}-400`)}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search results by exam or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading results...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-[2rem]">
                        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p>No results recorded yet.</p>
                    </div>
                ) : (
                    filteredResults.map((result) => (
                        <div key={result._id} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className={cn('px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-tighter', getGradeColor(result.grade))}>
                                    Grade: {result.grade}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{result.subject?.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">{result.exam?.name}</p>

                            <div className="space-y-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Score</span>
                                    <span className="text-sm font-black text-white">{result.marksObtained} / {result.totalMarks}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-1000", result.grade === 'F' ? 'bg-red-500' : 'bg-blue-500')}
                                        style={{ width: `${(result.marksObtained / result.totalMarks) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-medium">
                                    <span>Percentage</span>
                                    <span>{((result.marksObtained / result.totalMarks) * 100).toFixed(1)}%</span>
                                </div>
                            </div>

                            <button className="w-full mt-6 py-3 flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-all border border-transparent hover:border-white/10">
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
