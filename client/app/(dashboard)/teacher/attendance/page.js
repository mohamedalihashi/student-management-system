'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Calendar,
    Check,
    X,
    Search,
    Loader2,
    Save,
    Users,
    ChevronRight,
    ClipboardCheck
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function TeacherAttendance() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/teachers/my-classes'); // Fetches only assigned classes
            setClasses(res.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (classId) => {
        if (!classId) return;
        try {
            setLoading(true);
            const res = await api.get(`/students?classId=${classId}`);
            setStudents(res.data);

            // Initialize attendance data - everyone present by default
            const initialData = {};
            res.data.forEach(s => {
                initialData[s._id] = 'Present';
            });
            setAttendanceData(initialData);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmit = async () => {
        if (!selectedClass) return;
        try {
            setSaving(true);
            const formattedData = Object.entries(attendanceData).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await api.post('/attendance', {
                classId: selectedClass,
                date,
                attendanceData: formattedData
            });
            alert('Attendance marked successfully!');
        } catch (error) {
            alert('Error saving attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Mark Attendance</h1>
                    <p className="text-gray-400">Track student presence for today's classes.</p>
                </div>
                <div className="flex gap-4">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>
            </div>

            {/* Class Selection */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="flex flex-wrap gap-4">
                    {classes.map((cls) => (
                        <button
                            key={cls._id}
                            onClick={() => {
                                setSelectedClass(cls._id);
                                fetchStudents(cls._id);
                            }}
                            className={cn(
                                "flex items-center gap-3 px-6 py-4 rounded-xl font-medium transition-all border",
                                selectedClass === cls._id
                                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20"
                                    : "bg-white/5 text-gray-400 border-white/10 hover:border-gray-600"
                            )}
                        >
                            <Users className="w-5 h-5" />
                            Grade {cls.grade} - {cls.section}
                            {selectedClass === cls._id && <ChevronRight className="w-4 h-4" />}
                        </button>
                    ))}
                    {classes.length === 0 && !loading && <p className="text-gray-500">No classes assigned to you.</p>}
                </div>
            </div>

            {selectedClass && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Student Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Roll Number</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student._id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">
                                                {student.name}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {student.rollNumber}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-4">
                                                    <button
                                                        onClick={() => handleStatusChange(student._id, 'Present')}
                                                        className={cn(
                                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                                            attendanceData[student._id] === 'Present'
                                                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                                : "text-gray-500 border-transparent hover:bg-white/5"
                                                        )}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Present
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(student._id, 'Absent')}
                                                        className={cn(
                                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                                                            attendanceData[student._id] === 'Absent'
                                                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                                : "text-gray-500 border-transparent hover:bg-white/5"
                                                        )}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        Absent
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 border-t border-white/10 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={saving || students.length === 0}
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Submit Attendance
                        </button>
                    </div>
                </div>
            )}

            {!selectedClass && (
                <div className="py-20 text-center rounded-2xl border-2 border-dashed border-white/10">
                    <ClipboardCheck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Please select a class to start marking attendance.</p>
                </div>
            )}
        </div>
    );
}
