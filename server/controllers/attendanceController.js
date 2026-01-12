const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// @desc    Mark attendance for a class (Bulk)
// @route   POST /api/attendance
// @access  Private/Teacher/Admin
const markAttendance = async (req, res) => {
    const { classId, subjectId, teacherId, date, attendanceData } = req.body;
    // attendanceData: [{ studentId, status, remarks }]

    try {
        const records = [];

        for (const record of attendanceData) {
            const { studentId, status, remarks } = record;

            // Check for existing record for this student on this date for this subject
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            let attendance = await Attendance.findOne({
                student: studentId,
                subject: subjectId,
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            if (attendance) {
                attendance.status = status;
                attendance.remarks = remarks;
                await attendance.save();
            } else {
                attendance = new Attendance({
                    student: studentId,
                    class: classId,
                    subject: subjectId,
                    teacher: teacherId,
                    date: date,
                    status: status,
                    remarks: remarks
                });
                await attendance.save();
            }
            records.push(attendance);
        }

        res.status(201).json({ message: 'Attendance marked', records });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance history for a student
// @route   GET /api/attendance/student/:studentId
// @access  Private/Parent/Student/Teacher/Admin
const getAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({ student: req.params.studentId })
            .populate('student', 'name rollNumber')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ date: -1 });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a class on a specific date
// @route   GET /api/attendance/class/:classId
// @access  Private/Teacher/Admin
const getAttendanceByClass = async (req, res) => {
    try {
        const { date, subjectId } = req.query;
        const query = { class: req.params.classId };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        if (subjectId) {
            query.subject = subjectId;
        }

        const records = await Attendance.find(query)
            .populate('student', 'name rollNumber')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance report for a student (with summary)
// @route   GET /api/attendance/report/:studentId
// @access  Private/Parent/Student/Teacher/Admin
const getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { student: req.params.studentId };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const records = await Attendance.find(query)
            .populate('subject', 'name code')
            .sort({ date: -1 });

        // Calculate summary
        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const excused = records.filter(r => r.status === 'Excused').length;
        const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

        res.json({
            records,
            summary: {
                total,
                present,
                absent,
                late,
                excused,
                percentage
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance summary for a student
// @route   GET /api/attendance/summary/:studentId
// @access  Private
const getAttendanceSummary = async (req, res) => {
    try {
        const records = await Attendance.find({ student: req.params.studentId });

        const total = records.length;
        const present = records.filter(r => r.status === 'Present').length;
        const absent = records.filter(r => r.status === 'Absent').length;
        const late = records.filter(r => r.status === 'Late').length;
        const excused = records.filter(r => r.status === 'Excused').length;
        const percentage = total > 0 ? ((present + late) / total * 100).toFixed(2) : 0;

        res.json({
            total,
            present,
            absent,
            late,
            excused,
            percentage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Teacher/Admin
const updateAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate(['student', 'subject', 'teacher']);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
const deleteAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json({ message: 'Attendance record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance by date range
// @route   GET /api/attendance/range
// @access  Private/Teacher/Admin
const getAttendanceByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, classId, subjectId } = req.query;
        const query = {};

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (classId) query.class = classId;
        if (subjectId) query.subject = subjectId;

        const records = await Attendance.find(query)
            .populate('student', 'name rollNumber')
            .populate('class', 'grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all attendance records (Admin)
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
    try {
        const records = await Attendance.find({})
            .populate('student', 'name rollNumber')
            .populate('class', 'grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendance,
    getAttendanceByClass,
    getAttendanceReport,
    getAttendanceSummary,
    updateAttendance,
    deleteAttendance,
    getAttendanceByDateRange,
    getAllAttendance
};
