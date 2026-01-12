'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    FileText,
    Plus,
    Search,
    Trash2,
    Edit,
    Save,
    X,
    Loader2,
    BookOpen,
    User,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function AdminResultManagement() {
    const [results, setResults] = useState([]);
    const [exams, setExams] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingResult, setEditingResult] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        examId: '',
        studentId: '',
        subjectId: '', // Ideally derived from Exam, but API might need it explicitly if not populated
        marksObtained: '',
        totalMarks: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [resultsRes, examsRes, studentsRes] = await Promise.all([
                api.get('/results'),
                api.get('/exams/all'),
                api.get('/students') // Corrected endpoint to fetch student profiles
            ]);

            // Log response to debug
            console.log('Results:', resultsRes.data);

            setResults(resultsRes.data);
            setExams(examsRes.data);
            setStudents(studentsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Fallback for empty results if 404/500
        } finally {
            setLoading(false);
        }
    };

    const fetchResults = async () => {
        try {
            const res = await api.get('/results');
            setResults(res.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Find exam to get subjectId if needed
            const selectedExam = exams.find(ex => ex._id === formData.examId);
            const payload = {
                ...formData,
                subjectId: selectedExam ? selectedExam.subject._id : null
            };

            if (editingResult) {
                await api.put(`/results/${editingResult._id}`, payload);
                alert('Result updated successfully');
            } else {
                await api.post('/results', payload);
                alert('Result added successfully');
            }
            setShowModal(false);
            setEditingResult(null);
            resetForm();
            fetchResults();
        } catch (error) {
            console.error('Error saving result:', error);
            alert(error.response?.data?.message || 'Error saving result');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this result?')) {
            try {
                await api.delete(`/results/${id}`);
                fetchResults();
            } catch (error) {
                console.error('Error deleting result:', error);
                alert('Error deleting result');
            }
        }
    };

    const openEditModal = (result) => {
        setEditingResult(result);
        setFormData({
            examId: result.exam._id,
            studentId: result.student._id,
            subjectId: result.subject._id,
            marksObtained: result.marksObtained,
            totalMarks: result.totalMarks
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            examId: '',
            studentId: '',
            subjectId: '',
            marksObtained: '',
            totalMarks: ''
        });
        setEditingResult(null);
    };

    const filteredResults = results.filter(result =>
        result.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.exam?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getGradeColor = (grade) => {
        if (grade?.startsWith('A')) return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (grade === 'B') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (grade === 'C') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
        return 'text-red-400 bg-red-500/10 border-red-500/20';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Result Management</h1>
                    <p className="text-gray-400">Manage student marks and exam results.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Result
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by student or exam name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                />
            </div>

            {/* Results List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading results...</p>
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p>No results found.</p>
                    </div>
                ) : (
                    filteredResults.map((result) => (
                        <div key={result._id} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                                    <GraduationCap className="w-6 h-6" />
                                </div>
                                <div className={cn('px-3 py-1 rounded-full text-sm font-bold border', getGradeColor(result.grade))}>
                                    Grade: {result.grade}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-1">{result.student?.name}</h3>
                            <p className="text-sm text-gray-400 mb-4">{result.exam?.name}</p>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subject</span>
                                    <span className="text-gray-300">{result.subject?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Marks</span>
                                    <span className="text-gray-300 font-medium">{result.marksObtained} / {result.totalMarks}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Percentage</span>
                                    <span className="text-gray-300 font-medium">{((result.marksObtained / result.totalMarks) * 100).toFixed(1)}%</span>
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => openEditModal(result)}
                                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(result._id)}
                                    className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingResult ? 'Edit Result' : 'Add New Result'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Exam</label>
                                <select
                                    value={formData.examId}
                                    onChange={(e) => {
                                        const exam = exams.find(ex => ex._id === e.target.value);
                                        setFormData({
                                            ...formData,
                                            examId: e.target.value,
                                            totalMarks: exam ? exam.totalMarks : ''
                                        });
                                    }}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&>option]:bg-gray-900"
                                    required
                                >
                                    <option value="">Select an Exam</option>
                                    {exams.map(exam => (
                                        <option key={exam._id} value={exam._id}>
                                            {exam.name} - {exam.subject?.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Select Student</label>
                                <select
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [&>option]:bg-gray-900"
                                    required
                                >
                                    <option value="">Select a Student</option>
                                    {students.map(student => (
                                        <option key={student._id} value={student._id}>
                                            {student.name} ({student.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Marks Obtained</label>
                                    <input
                                        type="number"
                                        value={formData.marksObtained}
                                        onChange={(e) => setFormData({ ...formData, marksObtained: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                        min="0"
                                        max={formData.totalMarks}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Total Marks</label>
                                    <input
                                        type="number"
                                        value={formData.totalMarks}
                                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        required
                                        readOnly // Optionally make readOnly if derived from Exam
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
                            >
                                {editingResult ? 'Update Result' : 'Save Result'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
