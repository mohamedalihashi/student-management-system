const express = require('express');
const router = express.Router();
const { updateTeacherProfile, getAllTeachers, getTeacherById, deleteTeacher, getMyClasses, getMe } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/my-classes', authorize('teacher'), getMyClasses);
router.get('/me', authorize('teacher'), getMe);

router.route('/')
    .post(authorize('admin'), updateTeacherProfile)
    .get(authorize('admin'), getAllTeachers);

router.route('/:id')
    .get(authorize('admin'), getTeacherById)
    .delete(authorize('admin'), deleteTeacher);

module.exports = router;
