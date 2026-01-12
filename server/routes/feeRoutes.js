const express = require('express');
const router = express.Router();
const { createFee, recordPayment, generateMonthlyFees, getStudentFees, deleteFee, updateFee, getAllFees } = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/generate-monthly', authorize('admin'), generateMonthlyFees);

router.route('/')
    .get(authorize('admin'), getAllFees)
    .post(authorize('admin'), createFee);

router.route('/:id')
    .put(authorize('admin'), updateFee)
    .delete(authorize('admin'), deleteFee);

router.put('/:id/pay', authorize('admin'), recordPayment);
router.get('/student/:studentId', getStudentFees);

module.exports = router;
