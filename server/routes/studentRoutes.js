const express = require('express');
const router = express.Router();
const { updateStudentProfile, getAllStudents, getStudentProfileByUserId } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/me', getStudentProfileByUserId);

router.route('/')
    .post(authorize('admin'), updateStudentProfile)
    .get(authorize('admin', 'teacher'), getAllStudents);

module.exports = router;
