const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Fee = require('../models/Fee');

// @desc    Get system-wide statistics for reports
// @route   GET /api/reports/system
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const { range = 'monthly' } = req.query; // daily, monthly, yearly
        const now = new Date();
        let startDate;

        if (range === 'daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); // Last 7 days
        } else if (range === 'yearly') {
            startDate = new Date(now.getFullYear(), 0, 1); // From beginning of year
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Last 6 months
        }

        // 1. Fee Stats
        const feeStats = await Fee.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalPaid: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] } },
                    totalUnpaid: { $sum: { $cond: [{ $eq: ["$status", "Unpaid"] }, "$amount", 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 2. Registration Stats (New Students)
        const registrationStats = await Student.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Overall Attendance Average
        const attendanceStats = await Attendance.aggregate([
            { $match: { date: { $gte: startDate } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Summaries
        const totalStudents = await Student.countDocuments();
        const totalFeesCollected = await Fee.aggregate([
            { $match: { status: "Paid" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({
            feeStats,
            registrationStats,
            attendanceStats,
            summary: {
                totalStudents,
                totalFeesCollected: totalFeesCollected[0]?.total || 0,
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats
};
