'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import StatCard from '@/components/StatCard';
import { Users, BookOpen, GraduationCap, CreditCard, UserCheck, FileText, Loader2, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Mock data for the chart (since we don't have a 7-day history endpoint yet)
const attendanceData = [
    { day: 'Mon', present: 85, absent: 15 },
    { day: 'Tue', present: 88, absent: 12 },
    { day: 'Wed', present: 92, absent: 8 },
    { day: 'Thu', present: 85, absent: 15 },
    { day: 'Fri', present: 80, absent: 20 },
];

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/dashboard');
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Overview</h1>
                <p className="text-gray-400">Manage your institution's core operations and users.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={Users} color="blue" />
                <StatCard title="Total Teachers" value={stats?.totalTeachers || 0} icon={UserCheck} color="purple" />
                <StatCard title="Active Classes" value={stats?.totalClasses || 0} icon={BookOpen} color="green" />
                <StatCard title="Total Revenue" value={stats?.totalRevenue || '$0'} icon={CreditCard} color="orange" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Chart */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Attendance Overview (Last 5 Days)</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="day" stroke="#9ca3af" tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ fill: '#ffffff05' }}
                                />
                                <Bar dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Present (%)" />
                                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Recent System Activity</h2>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <UserCheck className="text-blue-500 w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">System update synchronized</p>
                                    <p className="text-xs text-gray-500">Just now</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Link href="/admin/users" className="block w-full p-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all text-left flex items-center justify-between group">
                            Users
                            <Users className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        </Link>
                        <Link href="/admin/classes" className="block w-full p-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all text-left flex items-center justify-between group">
                            Classes
                            <BookOpen className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        </Link>
                        <Link href="/admin/attendance" className="block w-full p-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-medium transition-all text-left flex items-center justify-between group">
                            Attendance
                            <Calendar className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        </Link>
                        <Link href="/admin/exams" className="block w-full p-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-medium transition-all text-left flex items-center justify-between group">
                            Exams
                            <FileText className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        </Link>
                        <Link href="/admin/fees" className="block w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10 text-left flex items-center justify-between group">
                            Fees
                            <CreditCard className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
