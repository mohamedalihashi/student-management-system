const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Fee = require('../models/Fee');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const { role, _id: userId } = req.user;
        let stats = {};

        if (role === 'admin') {
            const fees = await Fee.find({ status: 'Paid' });
            const totalRevenue = fees.reduce((acc, f) => acc + f.amount, 0);
            stats = {
                totalStudents: await Student.countDocuments(),
                totalTeachers: await Teacher.countDocuments(),
                totalParents: await Parent.countDocuments(),
                totalClasses: await Class.countDocuments(),
                totalRevenue: `$${totalRevenue.toLocaleString()}`
            };
        } else if (role === 'teacher') {
            const teacher = await Teacher.findOne({ user: userId });
            if (teacher) {
                const subjects = await Subject.find({ teacher: teacher._id });
                const classIds = [...new Set(subjects.map(s => s.class.toString()))];
                stats = {
                    assignedClasses: classIds.length,
                    totalStudents: await Student.countDocuments({ class: { $in: classIds } }),
                    pendingResults: 0, // Logic for pending results could be added
                    totalSubjects: subjects.length,
                };
            }
        } else if (role === 'student') {
            const student = await Student.findOne({ user: userId });
            if (student) {
                const attendance = await Attendance.find({ student: student._id });
                const presentCount = attendance.filter(a => a.status === 'Present').length;
                const attendanceRate = attendance.length > 0 ? (presentCount / attendance.length) * 100 : 0;

                const results = await Result.find({ student: student._id });
                const gpa = results.length > 0 ? (results.reduce((acc, r) => acc + r.marksObtained, 0) / (results.length * 100)) * 4 : 0;

                const fee = await Fee.findOne({ student: student._id }).sort({ createdAt: -1 });

                stats = {
                    attendance: `${attendanceRate.toFixed(1)}%`,
                    gpa: gpa.toFixed(2),
                    documents: 0, // Placeholder
                    feeStatus: fee ? fee.status : 'N/A',
                };
            }
        } else if (role === 'parent') {
            const parent = await Parent.findOne({ user: userId }).populate('children');
            if (parent) {
                stats = {
                    totalChildren: parent.children.length,
                    children: parent.children.map(c => ({
                        name: c.name,
                        rollNumber: c.rollNumber,
                        class: c.class
                    }))
                };
            }
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats
};
