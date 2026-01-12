const Fee = require('../models/Fee');
const Student = require('../models/Student');

// @desc    Assign Fee to Student
// @route   POST /api/fees
// @access  Private/Admin
const createFee = async (req, res) => {
    const { studentId, description, amount, dueDate } = req.body;

    try {
        const fee = await Fee.create({
            student: studentId,
            description,
            amount,
            dueDate,
            balance: amount
        });
        res.status(201).json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record Fee Payment (Supports Partial)
// @route   PUT /api/fees/:id/pay
// @access  Private/Admin
const recordPayment = async (req, res) => {
    const { amount, paymentMethod, note } = req.body;

    try {
        const fee = await Fee.findById(req.params.id);

        if (!fee) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        const paymentAmount = Number(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        // Add to history
        fee.paymentHistory.push({
            amount: paymentAmount,
            method: paymentMethod || 'Cash',
            note: note || '',
            date: Date.now()
        });

        // Update totals
        fee.amountPaid += paymentAmount;
        fee.balance = Math.max(0, fee.amount - fee.amountPaid);

        // Update status
        if (fee.balance === 0) {
            fee.status = 'Paid';
        } else {
            fee.status = 'Partial';
        }

        fee.paymentDate = Date.now();
        fee.paymentMethod = paymentMethod || 'Cash';

        const updatedFee = await fee.save();
        res.json(updatedFee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Monthly Fees for all students
// @route   POST /api/fees/generate-monthly
// @access  Private/Admin
const generateMonthlyFees = async (req, res) => {
    try {
        const students = await Student.find({ monthlyFee: { $gt: 0 } });
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 28); // Due end of month

        const feePromises = students.map(student => {
            return Fee.create({
                student: student._id,
                description: `Monthly School Fee - ${monthName}`,
                amount: student.monthlyFee,
                dueDate: dueDate,
                balance: student.monthlyFee,
                status: 'Unpaid'
            });
        });

        const createdFees = await Promise.all(feePromises);
        res.json({ message: `Successfully generated ${createdFees.length} fees for ${monthName}`, count: createdFees.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Fees
// @route   GET /api/fees/student/:studentId
// @access  Private
const getStudentFees = async (req, res) => {
    try {
        const fees = await Fee.find({ student: req.params.studentId });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Fee
// @route   DELETE /api/fees/:id
// @access  Private/Admin
const deleteFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndDelete(req.params.id);
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });
        res.json({ message: 'Fee record deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Fee
// @route   PUT /api/fees/:id
// @access  Private/Admin
const updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });
        res.json(fee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Fees
// @route   GET /api/fees
// @access  Private/Admin
const getAllFees = async (req, res) => {
    try {
        const fees = await Fee.find({}).populate('student', 'name rollNumber');
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFee,
    recordPayment,
    generateMonthlyFees,
    getStudentFees,
    deleteFee,
    updateFee,
    getAllFees
};
