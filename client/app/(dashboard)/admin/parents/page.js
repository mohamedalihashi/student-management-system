'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    Users,
    UserPlus,
    Search,
    Edit2,
    Trash2,
    Loader2,
    Phone,
    MapPin,
    Mail,
    Link as LinkIcon,
    UserCheck,
    GraduationCap
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ParentManagement() {
    const [parents, setParents] = useState([]);
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [editingParent, setEditingParent] = useState(null);
    const [linkingParent, setLinkingParent] = useState(null);
    const [formData, setFormData] = useState({
        userId: '',
        name: '',
        phone: '',
        address: ''
    });
    const [selectedStudent, setSelectedStudent] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [parentRes, userRes, studentRes] = await Promise.all([
                api.get('/parents'),
                api.get('/users'),
                api.get('/students')
            ]);
            setParents(parentRes.data);
            setUsers(userRes.data.filter(u => u.role === 'parent'));
            setStudents(studentRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/parents', formData);
            setShowModal(false);
            setEditingParent(null);
            setFormData({
                userId: '',
                name: '',
                phone: '',
                address: ''
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Something went wrong');
        }
    };

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/parents/add-student', {
                parentId: linkingParent._id,
                studentId: selectedStudent
            });
            setShowLinkModal(false);
            setLinkingParent(null);
            setSelectedStudent('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to link student');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this parent profile? This will not delete the user account.')) {
            try {
                await api.delete(`/parents/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting parent profile');
            }
        }
    };

    const openEditModal = (parent) => {
        setEditingParent(parent);
        setFormData({
            userId: parent.user?._id || parent.user || '',
            name: parent.name,
            phone: parent.phone,
            address: parent.address
        });
        setShowModal(true);
    };

    const openLinkModal = (parent) => {
        setLinkingParent(parent);
        setSelectedStudent('');
        setShowLinkModal(true);
    };

    const filteredParents = parents.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Parent Management</h1>
                    <p className="text-gray-400">Manage parent profiles and link them to their children.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingParent(null);
                        setFormData({
                            userId: '',
                            name: '',
                            phone: '',
                            address: ''
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/20"
                >
                    <UserPlus className="w-5 h-5" />
                    Create Profile
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search parents by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all outline-none"
                />
            </div>

            {/* Parents List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading parent profiles...</p>
                    </div>
                ) : filteredParents.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                        No parents found.
                    </div>
                ) : (
                    filteredParents.map((parent) => (
                        <div key={parent._id} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-orange-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button
                                    onClick={() => openEditModal(parent)}
                                    className="p-2 bg-white/10 hover:bg-blue-600 text-white rounded-xl transition-all"
                                    title="Edit Profile"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openLinkModal(parent)}
                                    className="p-2 bg-white/10 hover:bg-green-600 text-white rounded-xl transition-all"
                                    title="Link Student"
                                >
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(parent._id)}
                                    className="p-2 bg-white/10 hover:bg-red-600 text-white rounded-xl transition-all"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600/20 to-yellow-600/20 flex items-center justify-center text-orange-400 font-bold border border-orange-500/20 text-xl">
                                    {parent.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{parent.name}</h3>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                        <Mail className="w-3 h-3" />
                                        {parent.user?.email || 'No email linked'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-400">Phone:</span>
                                    <span className="text-white">{parent.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <GraduationCap className="w-4 h-4 text-orange-400" />
                                    <span className="text-gray-400">Children:</span>
                                    <span className="text-white font-medium">{parent.children?.length || 0}</span>
                                </div>
                                {parent.children && parent.children.length > 0 && (
                                    <div className="pt-3 border-t border-white/5">
                                        <p className="text-xs text-gray-500 mb-2">Linked Students:</p>
                                        <div className="space-y-1">
                                            {parent.children.map((child) => (
                                                <div key={child._id} className="flex items-center gap-2 text-xs">
                                                    <UserCheck className="w-3 h-3 text-green-400" />
                                                    <span className="text-white">{child.name}</span>
                                                    <span className="text-gray-500">({child.rollNumber})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{parent.address || 'No address provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    {editingParent ? 'Update Profile' : 'Create Parent Profile'}
                                </h2>
                                <p className="text-gray-400 mt-1">Configure parent profile and contact details.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Linked User Account</label>
                                    <select
                                        disabled={editingParent}
                                        value={formData.userId}
                                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none disabled:opacity-50"
                                        required
                                    >
                                        <option value="">Select a parent user</option>
                                        {editingParent ? (
                                            <option value={editingParent.user?._id || editingParent.user}>
                                                {editingParent.user?.email || 'Current User'}
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
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 outline-none"
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 outline-none min-h-[100px]"
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
                                    className="flex-1 px-6 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-orange-600/20"
                                >
                                    {editingParent ? 'Update Profile' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Link Student Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Link Student</h2>
                            <p className="text-gray-400">Connect a student to {linkingParent?.name}</p>
                        </div>

                        <form onSubmit={handleLinkStudent} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Select Student</label>
                                <select
                                    value={selectedStudent}
                                    onChange={(e) => setSelectedStudent(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 appearance-none"
                                    required
                                >
                                    <option value="">Choose a student</option>
                                    {students
                                        .filter(s => !linkingParent?.children?.some(c => c._id === s._id))
                                        .map(s => (
                                            <option key={s._id} value={s._id}>
                                                {s.name} ({s.rollNumber}) - Grade {s.class?.grade || 'N/A'}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkModal(false)}
                                    className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-semibold transition-all border border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-green-600/20"
                                >
                                    Link Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
