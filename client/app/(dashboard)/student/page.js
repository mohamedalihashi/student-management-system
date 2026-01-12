'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import StatCard from '@/components/StatCard';
import { Calendar, FileText, BookOpen, CreditCard, AlertCircle, Loader2, ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
    const [stats, setStats] = useState({
        attendance: "0%",
        gpa: "0.0",
        documents: 0,
        feeStatus: "N/A"
    });
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, studentRes] = await Promise.all([
                    api.get('/dashboard'),
                    api.get('/students/me')
                ]);
                setStats(statsRes.data);

                const resultsRes = await api.get(`/results/student/${studentRes.data._id}`);
                setResults(resultsRes.data.slice(0, 5)); // Get last 5 results
            } catch (error) {
                console.error('Error fetching student data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
                    <p className="text-gray-400">Track your learning progress and attendance.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-white">Status: Active Student</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Attendance" value={stats.attendance} icon={Calendar} color="green" />
                <StatCard title="GPA" value={stats.gpa} icon={Trophy} color="blue" />
                <StatCard title="Total Credits" value={results.length * 3} icon={BookOpen} color="purple" />
                <StatCard title="Fees Status" value={stats.feeStatus} icon={CreditCard} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-white">Recent Exam Results</h2>
                        <Link href="/student/results" className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 text-sm border-b border-white/5">
                                    <th className="pb-4 font-medium">Subject</th>
                                    <th className="pb-4 font-medium">Exam</th>
                                    <th className="pb-4 font-medium">Marks</th>
                                    <th className="pb-4 font-medium">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="text-white text-sm">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500">No results found yet.</td>
                                    </tr>
                                ) : (
                                    results.map((row, i) => (
                                        <tr key={i} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] transition-colors">
                                            <td className="py-4 font-medium">{row.subject?.name}</td>
                                            <td className="py-4 text-gray-400">{row.exam?.name}</td>
                                            <td className="py-4">{row.marksObtained}/{row.totalMarks}</td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${['A+', 'A', 'B'].includes(row.grade) ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                    }`}>
                                                    {row.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <h2 className="text-xl font-semibold text-white mb-6">Quick Links</h2>
                        <div className="space-y-3">
                            <Link href="/student/attendance" className="block w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white font-medium flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-green-400" />
                                    View Attendance
                                </div>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                            <Link href="/student/fees" className="block w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white font-medium flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-5 h-5 text-orange-400" />
                                    Fee History
                                </div>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                            </Link>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-blue-600/10 border border-blue-500/20 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="text-blue-400 w-5 h-5" />
                            <h3 className="text-lg font-semibold text-white">Notice</h3>
                        </div>
                        <p className="text-sm text-gray-400">Final exams are scheduled to start from next week. Please check the timetable.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
