const express = require('express');
const router = express.Router();
const { getSystemStats } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/system', getSystemStats);

module.exports = router;
