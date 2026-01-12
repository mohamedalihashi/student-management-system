const express = require('express');
const router = express.Router();
const {
    createSubject,
    getAllSubjects,
    deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('admin'), createSubject)
    .get(authorize('admin', 'teacher', 'student', 'parent'), getAllSubjects); // Allow broader read access for subjects

router.route('/:id')
    .delete(authorize('admin'), deleteSubject);

module.exports = router;
