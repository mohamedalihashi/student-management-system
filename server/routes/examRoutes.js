const express = require('express');
const router = express.Router();
const {
    createExam,
    uploadExamPaper,
    uploadAnswerKey,
    approveExam,
    rejectExam,
    getPendingExams,
    getApprovedExams,
    getAllExams,
    getExamsByClass,
    getExamById,
    updateExam,
    deleteExam,
    downloadExamPaper
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.use(protect);

// Admin routes
router.get('/pending', authorize('admin'), getPendingExams);
router.get('/all', authorize('admin'), getAllExams);
router.put('/:id/approve', authorize('admin'), approveExam);
router.put('/:id/reject', authorize('admin'), rejectExam);

// Teacher routes
router.post('/:id/upload-paper', authorize('teacher', 'admin'), upload.single('examPaper'), uploadExamPaper);
router.post('/:id/upload-answer-key', authorize('teacher', 'admin'), upload.single('answerKey'), uploadAnswerKey);

// Student routes
router.get('/approved', getApprovedExams);
router.get('/:id/download-paper', downloadExamPaper);

// Common routes
router.route('/')
    .post(authorize('admin', 'teacher'), createExam)
    .get(authorize('admin'), getAllExams);

router.get('/class/:classId', getExamsByClass);

router.route('/:id')
    .get(getExamById)
    .put(authorize('admin', 'teacher'), updateExam)
    .delete(authorize('admin'), deleteExam);

module.exports = router;
