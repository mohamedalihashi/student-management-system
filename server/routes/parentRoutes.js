const express = require('express');
const router = express.Router();
const { addStudentToParent, getMyChildren, getAllParents, updateParentProfile, deleteParent } = require('../controllers/parentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/add-student', authorize('admin'), addStudentToParent);
router.get('/my-children', authorize('parent'), getMyChildren);

router.route('/')
    .post(authorize('admin'), updateParentProfile)
    .get(authorize('admin'), getAllParents);

router.route('/:id')
    .delete(authorize('admin'), deleteParent);

module.exports = router;
