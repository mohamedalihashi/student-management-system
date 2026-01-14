'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    FileText,
    Plus,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Calendar,
    BookOpen,
    AlertCircle,
    Upload
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function TeacherExamManagement() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Exam Form
    const [formData, setFormData] = useState({
        name: '',
        examType: 'Test',
        classId: '',
        subjectId: '',
        examDate: '',
        duration: '',
        totalMarks: 100,
        room: ''
    });

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [mySubjects, setMySubjects] = useState([]);
    const [teacherProfile, setTeacherProfile] = useState(null);

    useEffect(() => {
        fetchExams();
        fetchAuxData();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await api.get('/exams/all'); // Ideally filtering for only this teacher's exams on backend
            // But currently the backend 'getAllExams' returns all. 
            // Better to filter client side or verify if there is a 'my-exams' endpoint (not yet). 
            // For now, let's filter client side if possible, or just show all (depending on requirements).
            // Actually, we should use 'getPendingExams' or 'getAllExams' but teachers should only see what they created?
            // Let's filter by teacher ID if available in exam object, but we need current user ID.
            // For MVP simplicity, we show all or just newly created ones.
            setExams(res.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuxData = async () => {
        try {
            const [classRes, subjectRes, teacherRes] = await Promise.all([
                api.get('/classes'),
                api.get('/subjects'),
                api.get('/teachers/me')
            ]);
            setClasses(classRes.data);
            setSubjects(subjectRes.data);
            setTeacherProfile(teacherRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (!teacherProfile) {
                alert('Could not identify your teacher profile. Please contact admin.');
                return;
            }

            await api.post('/exams', { ...formData, teacherId: teacherProfile._id });
            setShowCreateModal(false);
            setFormData({
                name: '',
                examType: 'Test',
                classId: '',
                subjectId: '',
                examDate: '',
                duration: '',
                totalMarks: 100,
                room: ''
            });
            fetchExams();
            alert('Exam submitted for approval!');
        } catch (error) {
            console.error('Create error:', error);
            alert('Error creating exam. ' + (error.response?.data?.message || ''));
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            approved: 'bg-green-500/10 text-green-400 border-green-500/20',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        const icons = {
            pending: Clock,
            approved: CheckCircle,
            rejected: XCircle
        };
        const Icon = icons[status];

        return (
            <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border capitalize', styles[status])}>
                <Icon className="w-3 h-3" />
                {status}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Exams</h1>
                    <p className="text-gray-400">Manage exams and track approval status.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    New Exam
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading your exams...</p>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">You haven't created any exams yet.</p>
                    </div>
                ) : (
                    exams.map(exam => (
                        <div key={exam._id} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-white">{exam.name}</h3>
                                        {getStatusBadge(exam.status)}
                                    </div>
                                    <div className="text-sm text-gray-400 space-y-1">
                                        <p>{exam.subject?.name} • Grade {exam.class?.grade}-{exam.class?.section}</p>
                                        <p>{new Date(exam.examDate).toLocaleDateString()} • {exam.duration} mins • {exam.room || 'No Room'}</p>
                                    </div>
                                    {exam.status === 'rejected' && (
                                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <p className="text-xs font-bold text-red-400 uppercase mb-1">Reason for Rejection</p>
                                            <p className="text-sm text-red-300">{exam.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {/* Placeholder for Upload Paper button IF approved or created */}
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium border border-white/10">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Create New Exam</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/5 rounded-full"><XCircle className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Exam Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="e.g. Finals" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Type</label>
                                    <select value={formData.examType} onChange={e => setFormData({ ...formData, examType: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                                        <option value="Test">Test</option>
                                        <option value="Midterm">Midterm</option>
                                        <option value="Final">Final</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Class</label>
                                    <select required value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c._id} value={c._id}>Grade {c.grade} - {c.section}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Subject</label>
                                    <select required value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50">
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Date</label>
                                    <input type="date" required value={formData.examDate} onChange={e => setFormData({ ...formData, examDate: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Duration (mins)</label>
                                    <input type="number" required value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Room</label>
                                    <input type="text" value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500/50" />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">Submit for Approval</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
