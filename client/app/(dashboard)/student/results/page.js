'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    FileText,
    Trophy,
    Calendar,
    BookOpen,
    Loader2,
    TrendingUp,
    Award
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function StudentResults() {
    const [results, setResults] = useState([]);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const studentRes = await api.get('/students/me');
            setStudent(studentRes.data);

            const resultsRes = await api.get(`/results/student/${studentRes.data._id}`);
            setResults(resultsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    // Group results by exam
    const examsObj = results.reduce((acc, r) => {
        const examName = r.exam?.name || 'Other';
        if (!acc[examName]) acc[examName] = [];
        acc[examName].push(r);
        return acc;
    }, {});

    const exams = Object.entries(examsObj);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">My Academic Results</h1>
                <p className="text-gray-400">View your performance across all exams and subjects.</p>
            </div>

            {exams.length === 0 ? (
                <div className="py-20 text-center rounded-2xl border-2 border-dashed border-white/10">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No results found yet. Keep up the hard work!</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {exams.map(([examName, examResults]) => {
                        const totalObtained = examResults.reduce((acc, r) => acc + r.marksObtained, 0);
                        const totalMax = examResults.reduce((acc, r) => acc + r.totalMarks, 0);
                        const percentage = ((totalObtained / totalMax) * 100).toFixed(1);

                        return (
                            <div key={examName} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                            <Award className="text-purple-500 w-5 h-5" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">{examName}</h2>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase">Overall Score</p>
                                            <p className="text-lg font-bold text-white">{totalObtained}/{totalMax}</p>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl font-bold text-lg border",
                                            percentage >= 80 ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                                percentage >= 60 ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                    "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                        )}>
                                            {percentage}%
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {examResults.map((r) => (
                                        <div key={r._id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="text-sm font-medium text-gray-500 uppercase flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    {r.subject?.code}
                                                </div>
                                                <div className={cn(
                                                    "px-2 py-1 rounded text-xs font-bold ring-1",
                                                    r.grade === 'A+' || r.grade === 'A' ? "text-green-400 ring-green-400/30" :
                                                        r.grade === 'B' || r.grade === 'C' ? "text-blue-400 ring-blue-400/30" :
                                                            "text-orange-400 ring-orange-400/30"
                                                )}>
                                                    Grade: {r.grade}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-4">{r.subject?.name}</h3>

                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-4">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-1000"
                                                    style={{ width: `${(r.marksObtained / r.totalMarks) * 100}%` }}
                                                />
                                            </div>

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Marks Obtained</span>
                                                <span className="text-white font-semibold">{r.marksObtained} / {r.totalMarks}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
