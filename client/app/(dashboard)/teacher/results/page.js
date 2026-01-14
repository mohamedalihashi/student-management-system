'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import {
    FileText,
    Plus,
    Search,
    Loader2,
    Save,
    Users,
    GraduationCap,
    BookOpen,
    Trophy
} from 'lucide-react';
import { cn } from '@/utils/cn';

export default function ResultsEntry() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [exams, setExams] = useState([]);
    const [selectedExam, setSelectedExam] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [resultsData, setResultsData] = useState({}); // { studentId: { marksObtained, totalMarks } }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/teachers/my-classes');
            setClasses(res.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const handleClassChange = async (classId) => {
        setSelectedClass(classId);
        setSelectedExam('');
        setSelectedSubject('');
        setStudents([]);
        if (!classId) return;

        try {
            setLoading(true);
            const [examRes, subjectRes, studentRes] = await Promise.all([
                api.get(`/exams/class/${classId}`),
                api.get('/subjects'), // Should filter by class on backend ideally
                api.get(`/students?classId=${classId}`)
            ]);

            setExams(examRes.data);
            setSubjects(subjectRes.data.filter(s => s.class?._id === classId || s.class === classId));
            setStudents(studentRes.data);

            // Initialize results data
            const initialData = {};
            studentRes.data.forEach(s => {
                initialData[s._id] = { marksObtained: '', totalMarks: 100 };
            });
            setResultsData(initialData);
        } catch (error) {
            console.error('Error fetching class details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setResultsData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        if (!selectedExam || !selectedSubject) {
            alert('Please select Exam and Subject');
            return;
        }

        try {
            setSaving(true);
            const resultsToSave = Object.entries(resultsData).map(([studentId, data]) => {
                if (data.marksObtained === '' || data.marksObtained === undefined) return null;
                return {
                    examId: selectedExam,
                    studentId,
                    subjectId: selectedSubject,
                    marksObtained: Number(data.marksObtained),
                    totalMarks: Number(data.totalMarks)
                };
            }).filter(r => r !== null);

            if (resultsToSave.length === 0) {
                alert('No marks entered to save.');
                setSaving(false);
                return;
            }

            await api.post('/results/bulk', { results: resultsToSave });
            alert('Results saved successfully!');
        } catch (error) {
            console.error('Error saving results:', error);
            alert('Error saving results');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Results Entry</h1>
                <p className="text-gray-400">Record student marks for exams and subjects.</p>
            </div>

            {/* Selection Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Select Class</label>
                    <select
                        value={selectedClass}
                        onChange={(e) => handleClassChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                    >
                        <option value="">Choose Class</option>
                        {classes.map(cls => (
                            <option key={cls._id} value={cls._id}>Grade {cls.grade} - {cls.section}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Select Exam</label>
                    <select
                        disabled={!selectedClass}
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none disabled:opacity-50"
                    >
                        <option value="">Choose Exam</option>
                        {exams.map(e => (
                            <option key={e._id} value={e._id}>{e.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Select Subject</label>
                    <select
                        disabled={!selectedClass}
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none disabled:opacity-50"
                    >
                        <option value="">Choose Subject</option>
                        {subjects.map(s => (
                            <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedClass && selectedExam && selectedSubject && (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Student Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Roll Number</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Marks Obtained</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-400">Total Marks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
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
                                                <input
                                                    type="number"
                                                    value={resultsData[student._id]?.marksObtained}
                                                    onChange={(e) => handleMarkChange(student._id, 'marksObtained', e.target.value)}
                                                    placeholder="0"
                                                    className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={resultsData[student._id]?.totalMarks}
                                                    onChange={(e) => handleMarkChange(student._id, 'totalMarks', e.target.value)}
                                                    className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
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
                            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Save All Results
                        </button>
                    </div>
                </div>
            )}

            {!selectedClass && (
                <div className="py-20 text-center rounded-2xl border-2 border-dashed border-white/10">
                    <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Please select class, exam and subject to enter results.</p>
                </div>
            )}
        </div>
    );
}
