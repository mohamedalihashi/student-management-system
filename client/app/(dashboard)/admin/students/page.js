'use client';

import { useState, useEffect, useRef } from 'react';
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
    Calendar,
    GraduationCap,
    MoreVertical,
    Printer,
    CreditCard,
    X,
    QrCode,
    Verified
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showIDModal, setShowIDModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        gender: 'Male',
        dob: '',
        rollNumber: '',
        admissionNumber: '',
        classId: '',
        phone: '',
        address: '',
        parentName: '',
        parentPhone: '',
        monthlyFee: 0
    });

    const printRef = useRef();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentRes, classRes] = await Promise.all([
                api.get('/students'),
                api.get('/classes')
            ]);
            setStudents(studentRes.data);
            setClasses(classRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                await api.put(`/students/${editingStudent._id}`, formData);
            } else {
                await api.post('/students', formData);
            }
            setShowModal(false);
            setEditingStudent(null);
            resetForm();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Something went wrong');
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            name: '',
            gender: 'Male',
            dob: '',
            rollNumber: '',
            admissionNumber: '',
            classId: '',
            phone: '',
            address: '',
            parentName: '',
            parentPhone: '',
            monthlyFee: 0
        });
    };

    const openEditModal = (student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            gender: student.gender,
            dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
            rollNumber: student.rollNumber,
            admissionNumber: student.admissionNumber || '',
            classId: student.class?._id || student.class || '',
            phone: student.phone,
            address: student.address,
            parentName: student.parentName || '',
            parentPhone: student.parentPhone || '',
            monthlyFee: student.monthlyFee || 0,
            email: student.user?.email || '',
            password: '' // Don't show password
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this profile?')) {
            try {
                await api.delete(`/students/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting profile');
            }
        }
    };

    const handlePrintID = () => {
        const content = printRef.current;
        const pri = window.open('', 'Print', 'height=600,width=800');
        pri.document.write('<html><head><title>Student ID Card</title>');
        pri.document.write('<style>');
        pri.document.write(`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
            body { font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; padding: 20px; background: #f0f2f5; }
            .id-card { 
                width: 500px; 
                height: 320px; 
                background: white; 
                border-radius: 24px; 
                overflow: hidden; 
                position: relative; 
                box-shadow: 0 40px 80px rgba(0,0,0,0.15);
                margin: auto;
                border: 1px solid rgba(0,0,0,0.05);
                display: flex;
            }
            .card-accent {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
                z-index: 0;
            }
            .left-panel {
                width: 180px;
                background: #1e293b;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                color: white;
                z-index: 1;
            }
            .right-panel {
                flex: 1;
                padding: 30px;
                display: flex;
                flex-direction: column;
                z-index: 1;
            }
            .school-logo {
                width: 50px;
                height: 50px;
                background: white;
                border-radius: 14px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1e293b;
                font-weight: 800;
                font-size: 20px;
            }
            .photo-box { 
                width: 90px; 
                height: 90px; 
                background: #f1f5f9; 
                border-radius: 22px; 
                border: 3px solid rgba(255,255,255,0.2);
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: #3b82f6;
                font-weight: 800;
            }
            .student-role { font-size: 8px; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 2px; }

            .school-header { margin-bottom: 20px; }
            .school-name { font-weight: 800; font-size: 14px; color: #1e293b; letter-spacing: 0.5px; text-transform: uppercase; }
            
            .name { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }

            .info-grid { 
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .field-label { font-size: 7px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 2px; }
            .field-value { font-size: 10px; font-weight: 700; color: #334155; }

            .footer-strip { 
                margin-top: auto;
                display: flex; 
                justify-content: space-between; 
                align-items: center;
            }
            .qr-code { width: 35px; height: 35px; background: #fff; padding: 5px; border-radius: 8px; border: 1px solid #eee; }
            .auth-box { text-align: right; }
            .sign-text { font-size: 7px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }

            @media print {
                body { background: white; padding: 0; }
                .id-card { box-shadow: none; border: 1px solid #eee; }
            }
        `);
        pri.document.write('</style></head><body>');
        pri.document.write(content.innerHTML);
        pri.document.write('</body></html>');
        pri.document.close();
        pri.focus();
        setTimeout(() => {
            pri.print();
            pri.close();
        }, 500);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Student Directory</h1>
                    <p className="text-gray-400">Manage {students.length} active student profiles and ID cards.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingStudent(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                    >
                        <UserPlus className="w-5 h-5" />
                        Enroll Student
                    </button>
                </div>
            </div>

            {/* Search Area */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by name, roll number, or admission ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
                />
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-400">Loading directory...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                        No students found matching your search.
                    </div>
                ) : (
                    filteredStudents.map((student) => (
                        <div key={student._id} className="group relative bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-blue-500/30 transition-all backdrop-blur-xl">
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20 text-3xl">
                                        {student.name[0].toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-gray-900 rounded-full flex items-center justify-center">
                                        <Verified className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{student.name}</h3>
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-6">ID: {student.rollNumber}</p>

                                <div className="w-full space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-xs p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                        <span className="text-gray-500">Class</span>
                                        <span className="text-white font-semibold">Grade {student.class?.grade || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                        <span className="text-gray-500">Adm No.</span>
                                        <span className="text-white font-semibold">{student.admissionNumber || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 w-full gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedStudent(student);
                                            setShowIDModal(true);
                                        }}
                                        className="flex flex-col items-center justify-center p-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-2xl transition-all"
                                        title="Print ID Card"
                                    >
                                        <CreditCard className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-bold">ID Card</span>
                                    </button>
                                    <button
                                        onClick={() => openEditModal(student)}
                                        className="flex flex-col items-center justify-center p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all"
                                        title="Edit Profile"
                                    >
                                        <Edit2 className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-bold">Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(student._id)}
                                        className="flex flex-col items-center justify-center p-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all"
                                        title="Delete Student"
                                    >
                                        <Trash2 className="w-5 h-5 mb-1" />
                                        <span className="text-[10px] font-bold">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Profile Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">
                                    {editingStudent ? 'Update Account' : 'New Enrollment'}
                                </h2>
                                <p className="text-gray-400 mt-1">Setup student credentials and academic profile.</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500 transition-colors"><X /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Account Access</label>
                                    {!editingStudent ? (
                                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl space-y-4">
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Login Email"
                                            />
                                            <input
                                                type="password"
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Access Password"
                                            />
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                            <p className="text-xs text-gray-500 mb-1">Current Login</p>
                                            <p className="text-sm font-bold text-white">{formData.email || 'No email'}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Ardayga Magaciisa"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Roll No.</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.rollNumber}
                                            onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="R-001"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Adm No.</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.admissionNumber}
                                            onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Assigned Class</label>
                                    <select
                                        value={formData.classId}
                                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white appearance-none outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Dooro Fasalka</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>Grade {c.grade} - {c.section}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Gender</label>
                                    <div className="flex gap-3">
                                        {['Male', 'Female'].map((g) => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, gender: g })}
                                                className={cn(
                                                    "flex-1 py-3.5 rounded-2xl text-sm font-bold border transition-all",
                                                    formData.gender === g
                                                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20"
                                                        : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"
                                                )}
                                            >
                                                {g === 'Male' ? 'Lab' : 'Dhedig'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Birth Date</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Parent/Phone</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.parentName}
                                            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                            className="flex-[1.5] px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Guardian"
                                        />
                                        <input
                                            type="text"
                                            required
                                            value={formData.parentPhone}
                                            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                            className="flex-1 px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="61xxxx"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Monthly Tuition ($)</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.monthlyFee}
                                        onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                                        className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-bold text-lg transition-all shadow-xl shadow-blue-600/30 mt-4 active:scale-95"
                            >
                                {editingStudent ? 'Save Changes' : 'Confirm Enrollment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ID Card Modal */}
            {showIDModal && selectedStudent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600"></div>

                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-white">Identity Pass</h2>
                                <p className="text-gray-500 text-sm">Preview before printing.</p>
                            </div>
                            <button onClick={() => setShowIDModal(false)} className="p-3 hover:bg-white/5 rounded-full text-gray-500 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex flex-col items-center mb-10 overflow-x-auto w-full">
                            <div ref={printRef}>
                                <div className="id-card">
                                    <div className="card-accent"></div>
                                    <div className="left-panel">
                                        <div className="school-logo">S</div>
                                        <div className="photo-box">
                                            {selectedStudent.name[0].toUpperCase()}
                                        </div>
                                        <div className="student-role">Student Pass</div>
                                    </div>

                                    <div className="right-panel">
                                        <div className="school-header">
                                            <div className="school-name">MODERN EXCELLENCE</div>
                                            <div className="academic-year">SESS: 2025/2026</div>
                                        </div>

                                        <div className="name">{selectedStudent.name.toUpperCase()}</div>

                                        <div className="info-grid">
                                            <div className="info-item">
                                                <div className="field-label">Student ID</div>
                                                <div className="field-value">{selectedStudent.rollNumber}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="field-label">Class</div>
                                                <div className="field-value">{selectedStudent.class?.grade}{selectedStudent.class?.section}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="field-label">Issue Date</div>
                                                <div className="field-value">{new Date().toLocaleDateString('en-GB')}</div>
                                            </div>
                                            <div className="info-item">
                                                <div className="field-label">Expiry Date</div>
                                                <div className="field-value">31/12/2026</div>
                                            </div>
                                        </div>

                                        <div className="footer-strip">
                                            <div className="qr-code">
                                                <QrCode size={24} color="#1e293b" />
                                            </div>
                                            <div className="auth-box">
                                                <div className="sign-text">Principal Authority</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handlePrintID}
                                className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black tracking-wide shadow-xl shadow-blue-600/30 transition-all active:scale-95"
                            >
                                <Printer className="w-5 h-5" />
                                PRINT ID CARD
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
