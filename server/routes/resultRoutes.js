const express = require('express');
const router = express.Router();
const { addResult, bulkAddResults, getStudentResults, updateResult, deleteResult, getAllResults } = require('../controllers/resultController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(authorize('admin'), getAllResults)
    .post(authorize('admin', 'teacher'), addResult);

router.post('/bulk', authorize('admin', 'teacher'), bulkAddResults);

router.route('/:id')
    .put(authorize('admin', 'teacher'), updateResult)
    .delete(authorize('admin'), deleteResult);

router.get('/student/:studentId', getStudentResults);

module.exports = router;
