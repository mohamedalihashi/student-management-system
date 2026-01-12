'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    BookOpen,
    Plus,
    Search,
    Edit2,
    Trash2,
    User,
    Loader2,
    GraduationCap
} from 'lucide-react';

export default function ClassManagement() {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        grade: '',
        section: '',
        classTeacher: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [classRes, teacherRes] = await Promise.all([
                api.get('/classes'),
                api.get('/teachers')
            ]);
            setClasses(classRes.data);
            setTeachers(teacherRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClass) {
                await api.put(`/classes/${editingClass._id}`, formData);
            } else {
                await api.post('/classes', formData);
            }
            setShowModal(false);
            setEditingClass(null);
            setFormData({ grade: '', section: '', classTeacher: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                await api.delete(`/classes/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting class');
            }
        }
    };

    const openEditModal = (cls) => {
        setEditingClass(cls);
        setFormData({
            grade: cls.grade,
            section: cls.section,
            classTeacher: cls.classTeacher?._id || cls.classTeacher || ''
        });
        setShowModal(true);
    };

    const filteredClasses = classes.filter(cls =>
        cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.section.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Class Management</h1>
                    <p className="text-gray-400">Organize students into grades and sections.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClass(null);
                        setFormData({ grade: '', section: '', classTeacher: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Create New Class
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search classes by grade or section..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading classes...</p>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500">
                        No classes found.
                    </div>
                ) : (
                    filteredClasses.map((cls) => (
                        <div key={cls._id} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <BookOpen className="text-blue-500 w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(cls)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cls._id)}
                                        className="p-2 hover:bg-red-400/10 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Grade {cls.grade}</h3>
                            <p className="text-sm text-gray-400 mb-4">Section: {cls.section}</p>

                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-3 text-sm">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">Class Teacher:</span>
                                    <span className="text-white font-medium">{cls.classTeacher?.name || 'Not assigned'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <GraduationCap className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">Students:</span>
                                    <span className="text-white font-medium">{cls.students?.length || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingClass ? 'Edit Class' : 'Create New Class'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Grade</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.grade}
                                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="e.g. 10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Section</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="e.g. A"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Class Teacher</label>
                                <select
                                    value={formData.classTeacher}
                                    onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                >
                                    <option value="">Select a teacher</option>
                                    {teachers.map(t => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                                >
                                    {editingClass ? 'Save Changes' : 'Create Class'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
