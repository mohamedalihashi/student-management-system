'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Calendar,
    Search,
    Loader2,
    Users,
    TrendingUp,
    TrendingDown,
    Filter,
    Download,
    Eye,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AdminAttendance() {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [filterDate, setFilterDate] = useState('');
    const [stats, setStats] = useState({
        totalRecords: 0,
        averageAttendance: 0,
        presentToday: 0,
        absentToday: 0
    });

    useEffect(() => {
        fetchClasses();
        fetchAttendance();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get('/attendance');
            setAttendanceRecords(res.data);
            calculateStats(res.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (records) => {
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = records.filter(r =>
            new Date(r.date).toISOString().split('T')[0] === today
        );

        const presentToday = todayRecords.filter(r => r.status === 'Present').length;
        const absentToday = todayRecords.filter(r => r.status === 'Absent').length;
        const totalPresent = records.filter(r => r.status === 'Present').length;
        const averageAttendance = records.length > 0
            ? ((totalPresent / records.length) * 100).toFixed(1)
            : 0;

        setStats({
            totalRecords: records.length,
            averageAttendance,
            presentToday,
            absentToday
        });
    };

    const filteredRecords = attendanceRecords.filter(record => {
        const matchesSearch = record.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.student?.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === 'all' || record.class?._id === filterClass;
        const matchesDate = !filterDate || new Date(record.date).toISOString().split('T')[0] === filterDate;
        return matchesSearch && matchesClass && matchesDate;
    });

    const getStatusBadge = (status) => {
        const styles = {
            Present: 'bg-green-500/10 text-green-400 border-green-500/20',
            Absent: 'bg-red-500/10 text-red-400 border-red-500/20',
            Late: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        };
        const icons = {
            Present: CheckCircle,
            Absent: XCircle,
            Late: Clock
        };
        const Icon = icons[status] || CheckCircle;

        return (
            <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border', styles[status])}>
                <Icon className="w-3 h-3" />
                {status}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Attendance Overview</h1>
                <p className="text-gray-400">Monitor and analyze student attendance across all classes.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-blue-600/5 border border-blue-500/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.totalRecords}</p>
                    <p className="text-sm text-gray-400">Total Records</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-600/10 to-green-600/5 border border-green-500/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.averageAttendance}%</p>
                    <p className="text-sm text-gray-400">Average Attendance</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-emerald-600/5 border border-emerald-500/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.presentToday}</p>
                    <p className="text-sm text-gray-400">Present Today</p>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600/10 to-red-600/5 border border-red-500/20 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <XCircle className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{stats.absentToday}</p>
                    <p className="text-sm text-gray-400">Absent Today</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by student name or roll number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                    />
                </div>

                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                >
                    <option value="all">All Classes</option>
                    {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                            Grade {cls.grade} - {cls.section}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                />
            </div>

            {/* Attendance Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/[0.02]">
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Student</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Roll Number</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Class</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                                        <p className="text-gray-400">Loading attendance records...</p>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <p>No attendance records found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-gray-400">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            {record.student?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {record.student?.rollNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {record.class ? `Grade ${record.class.grade} - ${record.class.section}` : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(record.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
