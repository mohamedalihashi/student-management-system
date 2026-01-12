'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import StatCard from '@/components/StatCard';
import { BookOpen, Users, FileText, ClipboardList, Plus, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
    const [stats, setStats] = useState({
        assignedClasses: 0,
        totalStudents: 0,
        pendingResults: 0,
        totalSubjects: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
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
                    <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
                    <p className="text-gray-400">Overview of your assigned classes and subjects.</p>
                </div>
                <Link href="/teacher/attendance" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <Plus className="w-5 h-5" />
                    Mark Attendance
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Assigned Classes" value={stats.assignedClasses} icon={BookOpen} color="blue" />
                <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="purple" />
                <StatCard title="Pending Results" value={stats.pendingResults} icon={FileText} color="orange" />
                <StatCard title="Total Subjects" value={stats.totalSubjects} icon={ClipboardList} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Upcoming Schedule</h2>
                    <div className="space-y-4">
                        {[
                            { time: '09:00 AM', subject: 'Mathematics', class: 'Grade 10-A' },
                            { time: '11:00 AM', subject: 'Physics', class: 'Grade 11-B' },
                            { time: '02:00 PM', subject: 'Advanced Algebra', class: 'Grade 12-C' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs text-center leading-tight">
                                        {item.time.split(' ')[0]}<br />{item.time.split(' ')[1]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.subject}</p>
                                        <p className="text-xs text-gray-500">{item.class}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Quick Tasks</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        <Link href="/teacher/attendance" className="p-6 rounded-2xl bg-blue-600/5 hover:bg-blue-600/10 border border-blue-600/20 text-blue-400 font-medium transition-all flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Calendar className="w-6 h-6" />
                            </div>
                            Mark Attendance
                        </Link>
                        <Link href="/teacher/results" className="p-6 rounded-2xl bg-purple-600/5 hover:bg-purple-600/10 border border-purple-600/20 text-purple-400 font-medium transition-all flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6" />
                            </div>
                            Enter Marks
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
