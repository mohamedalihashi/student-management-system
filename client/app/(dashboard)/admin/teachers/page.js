'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    BookOpen,
    Loader2,
    Phone,
    MapPin,
    GraduationCap,
    Award,
    Mail
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function TeacherManagement() {
    const [teachers, setTeachers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        qualification: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [teacherRes, userRes] = await Promise.all([
                api.get('/teachers'),
                api.get('/users')
            ]);
            setTeachers(teacherRes.data);
            setUsers(userRes.data.filter(u => u.role === 'teacher'));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teachers', formData);
            setShowModal(false);
            setEditingTeacher(null);
            setFormData({
                userId: '',
                name: '',
                qualification: '',
                phone: '',
                address: ''
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher profile? This will not delete the user account.')) {
            try {
                await api.delete(`/teachers/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting teacher profile');
            }
        }
    };

    const openEditModal = (teacher) => {
        setEditingTeacher(teacher);
        setFormData({
            userId: teacher.user?._id || teacher.user || '',
            name: teacher.name,
            qualification: teacher.qualification,
            phone: teacher.phone,
            address: teacher.address
        });
        setShowModal(true);
    };

    const filteredTeachers = teachers.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.qualification.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Teacher Management</h1>
                    <p className="text-gray-400">Manage faculty profiles, qualifications, and contact information.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTeacher(null);
                        setFormData({
                            userId: '',
                            name: '',
                            qualification: '',
                            phone: '',
                            address: ''
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-600/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Create Profile
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search teachers by name or qualification..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all outline-none"
                />
            </div>

            {/* Teachers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading teacher profiles...</p>
                    </div>
                ) : filteredTeachers.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                        No teachers found.
                    </div>
                ) : (
                    filteredTeachers.map((teacher) => (
                        <div key={teacher._id} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-purple-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => openEditModal(teacher)}
                                    className="p-2 bg-white/10 hover:bg-blue-600 text-white rounded-xl transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(teacher._id)}
                                    className="p-2 bg-white/10 hover:bg-red-600 text-white rounded-xl transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-pink-600/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/20 text-xl">
                                    {teacher.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{teacher.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Mail className="w-3 h-3" />
                                        {teacher.user?.email || 'No email linked'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Award className="w-4 h-4 text-purple-400" />
                                    <span className="text-gray-400">Qualification:</span>
                                    <span className="text-white font-medium">{teacher.qualification}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">Phone:</span>
                                    <span className="text-white">{teacher.phone || 'N/A'}</span>
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{teacher.address || 'No address provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    {editingTeacher ? 'Update Profile' : 'Create Teacher Profile'}
                                </h2>
                                <p className="text-gray-400 mt-1">Configure teacher profile and credentials.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Linked User Account</label>
                                    <select
                                        disabled={editingTeacher}
                                        value={formData.userId}
                                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none disabled:opacity-50"
                                        required
                                    >
                                        <option value="">Select a teacher user</option>
                                        {editingTeacher ? (
                                            <option value={editingTeacher.user?._id || editingTeacher.user}>
                                                {editingTeacher.user?.email || 'Current User'}
                                            </option>
                                        ) : (
                                            users.map(u => (
                                                <option key={u._id} value={u._id}>{u.email}</option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 outline-none"
                                            placeholder="Dr. Smith"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 outline-none"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Qualification</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.qualification}
                                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 outline-none"
                                        placeholder="PhD in Mathematics"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 outline-none min-h-[100px]"
                                        placeholder="Enter residence address..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-purple-600/20"
                                >
                                    {editingTeacher ? 'Update Profile' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
