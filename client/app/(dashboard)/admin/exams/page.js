'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    FileText,
    Plus,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Eye,
    Loader2,
    Calendar,
    BookOpen,
    User,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AdminExamManagement() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    // Create Exam State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: '',
        examType: 'Test',
        classId: '',
        subjectId: '',
        teacherId: '', // Ideally current user or select from list
        examDate: '',
        duration: '',
        totalMarks: 100,
        room: ''
    });
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]); // For admin to assign teacher

    // Reject Exam State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchExams();
        fetchAuxData();
    }, []);

    const fetchAuxData = async () => {
        try {
            const [classRes, subjectRes, teacherRes] = await Promise.all([
                api.get('/classes'),
                api.get('/subjects'),
                api.get('/teachers') // Fetch actual Teacher profiles
            ]);
            setClasses(classRes.data);
            setSubjects(subjectRes.data);
            setTeachers(teacherRes.data);
        } catch (error) {
            console.error('Error fetching aux data:', error);
        }
    };

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await api.get('/exams/all');
            setExams(res.data);
        } catch (error) {
            console.error('Error fetching exams:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/exams', createFormData);
            setShowCreateModal(false);
            setCreateFormData({
                name: '',
                examType: 'Test',
                classId: '',
                subjectId: '',
                teacherId: '',
                examDate: '',
                duration: '',
                totalMarks: 100,
                room: ''
            });
            fetchExams();
            alert('Exam created successfully');
        } catch (error) {
            console.error('Error creating exam:', error);
            alert(error.response?.data?.message || 'Error creating exam');
        }
    };

    const handleApprove = async (examId) => {
        if (window.confirm('Are you sure you want to approve this exam?')) {
            try {
                await api.put(`/exams/${examId}/approve`);
                fetchExams();
            } catch (error) {
                console.error('Approve error:', error);
                alert(error.response?.data?.message || 'Error approving exam');
            }
        }
    };

    const handleReject = async () => {
        try {
            await api.put(`/exams/${selectedExam._id}/reject`, { reason: rejectionReason });
            setShowRejectModal(false);
            setRejectionReason('');
            setSelectedExam(null);
            fetchExams();
        } catch (error) {
            alert('Error rejecting exam');
        }
    };

    const openRejectModal = (exam) => {
        setSelectedExam(exam);
        setShowRejectModal(true);
    };

    const handleDownload = async (examId) => {
        try {
            const response = await api.get(`/exams/${examId}/download-paper`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `exam-paper-${examId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Error downloading exam paper');
        }
    };

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exam.subject?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || exam.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

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
                    <h1 className="text-3xl font-bold text-white mb-2">Exam Management</h1>
                    <p className="text-gray-400">Review and approve exam papers uploaded by teachers.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Exam
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search exams by name or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                'px-6 py-4 rounded-2xl font-medium transition-all capitalize',
                                filterStatus === status
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Exams List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading exams...</p>
                    </div>
                ) : filteredExams.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p>No exams found.</p>
                    </div>
                ) : (
                    filteredExams.map((exam) => (
                        <div key={exam._id} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-white">{exam.name}</h3>
                                        {getStatusBadge(exam.status)}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <BookOpen className="w-4 h-4" />
                                            <span>{exam.subject?.name} ({exam.subject?.code})</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <User className="w-4 h-4" />
                                            <span>Grade {exam.class?.grade} - {exam.class?.section}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                        <span>Teacher: {exam.teacher?.name}</span>
                                        <span>•</span>
                                        <span>Duration: {exam.duration} mins</span>
                                        <span>•</span>
                                        <span>Total Marks: {exam.totalMarks}</span>
                                        <span>•</span>
                                        <span>Room: {exam.room || 'TBD'}</span>
                                    </div>

                                    {exam.status === 'rejected' && exam.rejectionReason && (
                                        <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-medium text-red-400">Rejection Reason:</p>
                                                <p className="text-sm text-red-300">{exam.rejectionReason}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    {exam.examPaperUrl && (
                                        <button
                                            onClick={() => handleDownload(exam._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Paper
                                        </button>
                                    )}

                                    {exam.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(exam._id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-all shadow-lg shadow-green-600/20"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(exam)}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-lg shadow-red-600/20"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Exam Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-white">Create New Exam</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateExam} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Exam Name</label>
                                    <input
                                        type="text"
                                        value={createFormData.name}
                                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        placeholder="e.g. Midterm Physics"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Exam Type</label>
                                    <select
                                        value={createFormData.examType}
                                        onChange={(e) => setCreateFormData({ ...createFormData, examType: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                                    >
                                        <option value="Test">Test</option>
                                        <option value="Midterm">Midterm</option>
                                        <option value="Final">Final</option>
                                        <option value="Quiz">Quiz</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Subject</label>
                                    <select
                                        value={createFormData.subjectId}
                                        onChange={(e) => setCreateFormData({ ...createFormData, subjectId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Class</label>
                                    <select
                                        value={createFormData.classId}
                                        onChange={(e) => setCreateFormData({ ...createFormData, classId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>Grade {c.grade} - {c.section}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Teacher</label>
                                    <select
                                        value={createFormData.teacherId}
                                        onChange={(e) => setCreateFormData({ ...createFormData, teacherId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none outline-none"
                                        required
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => (
                                            <option key={t._id} value={t._id}>
                                                {t.name} ({t.user?.email || 'No Email'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Exam Room</label>
                                    <input
                                        type="text"
                                        value={createFormData.room}
                                        onChange={(e) => setCreateFormData({ ...createFormData, room: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        placeholder="e.g. Room 302"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Date</label>
                                    <input
                                        type="date"
                                        value={createFormData.examDate}
                                        onChange={(e) => setCreateFormData({ ...createFormData, examDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={createFormData.duration}
                                        onChange={(e) => setCreateFormData({ ...createFormData, duration: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                            >
                                Create Exam
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-bold text-white mb-4">Reject Exam</h2>
                        <p className="text-gray-400 mb-6">Please provide a reason for rejecting this exam.</p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 outline-none min-h-[120px] mb-6"
                        />

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all border border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-red-600/20"
                            >
                                Reject Exam
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
