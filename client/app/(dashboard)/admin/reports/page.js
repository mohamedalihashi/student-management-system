'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Loader2,
    Printer,
    Search,
    FileText,
    School,
    Calendar,
    BookOpen,
    BarChart3,
    PieChart as PieIcon,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function AdminReports() {
    const [activeTab, setActiveTab] = useState('student'); // 'student' or 'system'
    const [classes, setClasses] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Student Report State
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedExamType, setSelectedExamType] = useState('');
    const [generatedReports, setGeneratedReports] = useState(null);

    // System Report State
    const [systemStats, setSystemStats] = useState(null);
    const [timeRange, setTimeRange] = useState('monthly');

    const examTypes = ['Test', 'Midterm', 'Final', 'Quiz'];
    const COLORS = ['#3b82f6', '#ef4444', '#eab308', '#22c55e'];

    useEffect(() => {
        fetchClasses();
        if (activeTab === 'system') {
            fetchSystemStats();
        }
    }, [activeTab, timeRange]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSystemStats = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/reports/system?range=${timeRange}`);
            setSystemStats(res.data);
        } catch (error) {
            console.error('Error fetching system stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = async (e) => {
        e.preventDefault();
        if (!selectedClass || !selectedExamType) {
            alert('Please select both Class and Exam Type');
            return;
        }

        try {
            setLoading(true);
            const res = await api.get('/results');
            const allResults = res.data;

            const filtered = allResults.filter(r =>
                r.exam?.class === selectedClass &&
                r.exam?.examType === selectedExamType
            );

            const grouped = {};
            filtered.forEach(r => {
                const studentId = r.student._id;
                if (!grouped[studentId]) {
                    grouped[studentId] = {
                        student: r.student,
                        results: [],
                        totalMarksObtained: 0,
                        totalMaxMarks: 0
                    };
                }
                grouped[studentId].results.push(r);
                grouped[studentId].totalMarksObtained += r.marksObtained;
                grouped[studentId].totalMaxMarks += r.totalMarks;
            });

            setGeneratedReports(Object.values(grouped));
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">School Reports</h1>
                    <p className="text-gray-400">Comprehensive academic and administrative reporting.</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setActiveTab('student')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                            activeTab === 'student' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Student Cards
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                            activeTab === 'system' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        System Overview
                    </button>
                </div>
            </div>

            {activeTab === 'student' ? (
                <>
                    {/* Student Report Filter */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl print:hidden">
                        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Select Class</label>
                                <select
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none [&>option]:bg-gray-900"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>Grade {c.grade} - {c.section}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Exam Type</label>
                                <select
                                    value={selectedExamType}
                                    onChange={(e) => setSelectedExamType(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none [&>option]:bg-gray-900"
                                >
                                    <option value="">Select Type</option>
                                    {examTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                Generate Reports
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="space-y-8">
                    {/* System Report Controls */}
                    <div className="flex justify-between items-center print:hidden">
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                            {['daily', 'monthly', 'yearly'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                                        timeRange === range ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all"
                        >
                            <Printer className="w-4 h-4" />
                            Print Summary
                        </button>
                    </div>

                    {loading && !systemStats ? (
                        <div className="py-20 text-center">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
                        </div>
                    ) : systemStats && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Summary Cards */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="p-6 rounded-3xl bg-blue-600/10 border border-blue-500/20">
                                    <p className="text-gray-400 text-sm mb-1">Total Students</p>
                                    <h3 className="text-3xl font-bold text-white">{systemStats.summary.totalStudents}</h3>
                                    <div className="mt-2 flex items-center text-xs text-green-400">
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                        <span>New Registrations</span>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-green-600/10 border border-green-500/20">
                                    <p className="text-gray-400 text-sm mb-1">Fees Collected</p>
                                    <h3 className="text-3xl font-bold text-white">${systemStats.summary.totalFeesCollected}</h3>
                                    <div className="mt-2 flex items-center text-xs text-green-400">
                                        <ArrowUpRight className="w-3 h-3 mr-1" />
                                        <span>Current Period</span>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-purple-600/10 border border-purple-500/20">
                                    <p className="text-gray-400 text-sm mb-1">Average Attendance</p>
                                    <h3 className="text-3xl font-bold text-white">
                                        {((systemStats.attendanceStats.find(s => s._id === 'Present')?.count || 0) /
                                            (systemStats.attendanceStats.reduce((a, b) => a + b.count, 0) || 1) * 100).toFixed(1)}%
                                    </h3>
                                    <div className="mt-2 flex items-center text-xs text-purple-400">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        <span>Last 30 Days</span>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-orange-600/10 border border-orange-500/20">
                                    <p className="text-gray-400 text-sm mb-1">System Health</p>
                                    <h3 className="text-3xl font-bold text-white">Stable</h3>
                                    <div className="mt-2 flex items-center text-xs text-orange-400">
                                        <Clock className="w-3 h-3 mr-1" />
                                        <span>All systems normal</span>
                                    </div>
                                </div>
                            </div>

                            {/* Fee Collection Chart */}
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                    Fee Collection Trend
                                </h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={systemStats.feeStats}>
                                            <defs>
                                                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="_id" stroke="#6b7280" tick={{ fontSize: 12 }} />
                                            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="totalPaid" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPaid)" name="Paid ($)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Attendance Pie Chart */}
                            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <PieIcon className="w-5 h-5 text-purple-500" />
                                    Attendance Status
                                </h3>
                                <div className="h-[300px] flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={systemStats.attendanceStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="_id"
                                            >
                                                {systemStats.attendanceStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="hidden md:block space-y-2 pr-8">
                                        {systemStats.attendanceStats.map((s, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                <span className="text-gray-400 text-sm font-medium">{s._id}: {s.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Existing Student Report Card Loop (only if activeTab is 'student') */}
            {activeTab === 'student' && generatedReports && generatedReports.length > 0 && (
                <div className="space-y-8">
                    <div className="flex justify-end print:hidden">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-green-600/20"
                        >
                            <Printer className="w-5 h-5" />
                            Print All Reports
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8 print:block print:space-y-8">
                        {generatedReports.map((report, index) => (
                            <div key={index} className="p-8 rounded-3xl bg-white text-black print:break-inside-avoid print:border print:border-gray-300">
                                {/* Header */}
                                <div className="text-center border-b-2 border-gray-200 pb-6 mb-6">
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">EduGate High School</h2>
                                    <p className="text-gray-600">Official Academic Report Card</p>
                                    <p className="text-sm text-gray-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                                </div>

                                {/* Student Info */}
                                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">Student Name</p>
                                        <p className="text-lg font-bold text-gray-900">{report.student?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 mb-1">Exam Term</p>
                                        <p className="text-lg font-bold text-gray-900">{selectedExamType}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Roll / Admission No.</p>
                                        <p className="text-lg font-medium text-gray-900">{report.student?.rollNumber || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-gray-500 mb-1">Class</p>
                                        <p className="text-lg font-medium text-gray-900">
                                            {/* We can find class name from classes array if needed, using selectedClass */}
                                            {classes.find(c => c._id === selectedClass)?.grade} - {classes.find(c => c._id === selectedClass)?.section}
                                        </p>
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="mb-8">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="py-3 font-bold text-gray-700">Subject</th>
                                                <th className="py-3 font-bold text-gray-700 text-right">Marks Obtained</th>
                                                <th className="py-3 font-bold text-gray-700 text-right">Total Marks</th>
                                                <th className="py-3 font-bold text-gray-700 text-right">Grade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.results.map((r, i) => (
                                                <tr key={i} className="border-b border-gray-100">
                                                    <td className="py-3 text-gray-800 font-medium">{r.subject?.name}</td>
                                                    <td className="py-3 text-gray-800 text-right">{r.marksObtained}</td>
                                                    <td className="py-3 text-gray-500 text-right">{r.totalMarks}</td>
                                                    <td className="py-3 text-gray-800 text-right font-bold">{r.grade || '-'}</td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50">
                                                <td className="py-4 font-bold text-gray-900">Total</td>
                                                <td className="py-4 font-bold text-blue-600 text-right text-lg">{report.totalMarksObtained}</td>
                                                <td className="py-4 font-bold text-gray-900 text-right">{report.totalMaxMarks}</td>
                                                <td className="py-4 font-bold text-blue-600 text-right">
                                                    {((report.totalMarksObtained / report.totalMaxMarks) * 100).toFixed(1)}%
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200">
                                    <div className="text-center">
                                        <div className="h-10 border-b border-gray-300 mb-2"></div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Class Teacher</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-10 border-b border-gray-300 mb-2"></div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Principal</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-10 border-b border-gray-300 mb-2"></div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Parent Signature</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {generatedReports && generatedReports.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                    <School className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results found for the selected criteria.</p>
                </div>
            )}
        </div>
    );
}
