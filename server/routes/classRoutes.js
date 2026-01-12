const express = require('express');
const router = express.Router();
const {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(authorize('admin'), createClass)
    .get(authorize('admin', 'teacher'), getAllClasses);

router.route('/:id')
    .get(authorize('admin', 'teacher'), getClassById)
    .put(authorize('admin'), updateClass)
    .delete(authorize('admin'), deleteClass);

module.exports = router;
