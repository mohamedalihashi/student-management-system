'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import {
    Calendar,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    ChevronLeft,
    Search
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ChildAttendanceView() {
    const params = useParams();
    const router = useRouter();
    const childId = params.id;

    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState({
        records: [],
        summary: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            percentage: 0
        }
    });
    const [filterDate, setFilterDate] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (childId) {
            fetchAttendance();
        }
    }, [childId]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const query = filterDate.startDate && filterDate.endDate
                ? `?startDate=${filterDate.startDate}&endDate=${filterDate.endDate}`
                : '';
            const res = await api.get(`/attendance/report/${childId}${query}`);
            setAttendance(res.data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'Absent': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'Late': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Excused': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'Present': return <CheckCircle2 className="w-4 h-4" />;
            case 'Absent': return <XCircle className="w-4 h-4" />;
            case 'Late': return <Clock className="w-4 h-4" />;
            case 'Excused': return <AlertCircle className="w-4 h-4" />;
            default: return null;
        }
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
                    <h1 className="text-3xl font-bold text-white">Attendance History</h1>
                    <p className="text-gray-400">Detailed attendance records for your child.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Attendance Rate', value: `${attendance.summary.percentage}%`, color: 'blue', icon: Calendar },
                    { label: 'Days Present', value: attendance.summary.present, color: 'green', icon: CheckCircle2 },
                    { label: 'Days Absent', value: attendance.summary.absent, color: 'red', icon: XCircle },
                    { label: 'Late Arrivals', value: attendance.summary.late, color: 'yellow', icon: Clock },
                ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", `bg-${stat.color}-500/10 text-${stat.color}-400`)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters and List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium text-gray-500">Start Date</label>
                        <input
                            type="date"
                            value={filterDate.startDate}
                            onChange={(e) => setFilterDate({ ...filterDate, startDate: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium text-gray-500">End Date</label>
                        <input
                            type="date"
                            value={filterDate.endDate}
                            onChange={(e) => setFilterDate({ ...filterDate, endDate: e.target.value })}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                    <button
                        onClick={fetchAttendance}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                    >
                        Apply Filter
                    </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Date</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Subject</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                                            Loading history...
                                        </td>
                                    </tr>
                                ) : attendance.records.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500 text-sm">
                                            No attendance records found for this period.
                                        </td>
                                    </tr>
                                ) : (
                                    attendance.records.map((record) => (
                                        <tr key={record._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                {new Date(record.date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-white">
                                                {record.subject?.name || 'General'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                                    getStatusColor(record.status)
                                                )}>
                                                    <StatusIcon status={record.status} />
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 italic">
                                                {record.remarks || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
