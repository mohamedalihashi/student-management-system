const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getAttendance,
    getAttendanceByClass,
    getAttendanceReport,
    getAttendanceSummary,
    updateAttendance,
    deleteAttendance,
    getAttendanceByDateRange,
    getAllAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Mark attendance (Teacher/Admin)
router.post('/', authorize('teacher', 'admin'), markAttendance);

// Get all attendance (Admin)
router.get('/', authorize('admin'), getAllAttendance);

// Get attendance for a student
router.get('/student/:studentId', getAttendance);

// Get attendance report with summary
router.get('/report/:studentId', getAttendanceReport);

// Get attendance summary only
router.get('/summary/:studentId', getAttendanceSummary);

// Get attendance by class
router.get('/class/:classId', authorize('teacher', 'admin'), getAttendanceByClass);

// Get attendance by date range
router.get('/range', authorize('teacher', 'admin'), getAttendanceByDateRange);

// Update and delete attendance
router.route('/:id')
    .put(authorize('teacher', 'admin'), updateAttendance)
    .delete(authorize('admin'), deleteAttendance);

module.exports = router;
