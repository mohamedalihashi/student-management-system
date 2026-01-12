'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import StatCard from '@/components/StatCard';
import { Users, Calendar, FileText, CreditCard, Loader2, ArrowRight, User } from 'lucide-react';
import Link from 'next/link';

export default function ParentDashboard() {
    const [stats, setStats] = useState({
        totalChildren: 0,
        children: []
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
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Parent Portal</h1>
                <p className="text-gray-400">Monitor your children's academic performance and attendance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Linked Children" value={stats.totalChildren} icon={Users} color="blue" />
                <StatCard title="Total Activity" value="Active" icon={Calendar} color="green" />
                <StatCard title="Security" value="Encrypted" icon={CreditCard} color="orange" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white">My Children</h2>
                </div>

                {stats.children && stats.children.length === 0 ? (
                    <div className="py-20 text-center rounded-2xl border-2 border-dashed border-white/10">
                        <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500">No children linked to your account. Please contact Admin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {stats.children.map((child, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl group hover:border-blue-500/30 transition-all shadow-xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-blue-500/10">
                                            {child.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{child.name}</h3>
                                            <p className="text-sm text-gray-400">Roll: {child.rollNumber}</p>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
                                        {child.class ? `Grade ${child.class.grade}-${child.class.section}` : 'N/A'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Link
                                        href={`/parent/attendance/${child._id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-blue-600/10 hover:border-blue-500/30 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">Attendance</p>
                                            <p className="text-xs text-gray-500">View history</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-blue-500" />
                                    </Link>
                                    <Link
                                        href={`/parent/results/${child._id}`}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-purple-600/10 hover:border-purple-500/30 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-white">Results</p>
                                            <p className="text-xs text-gray-500">Exam performance</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-purple-500" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
