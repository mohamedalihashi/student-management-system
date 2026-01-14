const Exam = require('../models/Exam');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// @desc    Create Exam
// @route   POST /api/exams
// @access  Private/Admin/Teacher
const createExam = async (req, res) => {
    const { name, examType, classId, subjectId, teacherId, examDate, duration, totalMarks, room } = req.body;

    try {
        const exam = await Exam.create({
            name,
            examType,
            class: classId,
            subject: subjectId,
            teacher: teacherId,
            examDate,
            duration,
            totalMarks,
            room,
            status: 'pending'
        });

        await exam.populate(['class', 'subject', 'teacher']);
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload Exam Paper
// @route   POST /api/exams/:id/upload-paper
// @access  Private/Teacher
const uploadExamPaper = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Delete old file if exists
        if (exam.examPaperUrl) {
            const oldPath = path.join(__dirname, '..', exam.examPaperUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new file path
        exam.examPaperUrl = `uploads/exam-papers/${req.file.filename}`;
        await exam.save();

        res.json({ message: 'Exam paper uploaded successfully', exam });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload Answer Key
// @route   POST /api/exams/:id/upload-answer-key
// @access  Private/Teacher
const uploadAnswerKey = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Delete old file if exists
        if (exam.answerKeyUrl) {
            const oldPath = path.join(__dirname, '..', exam.answerKeyUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new file path
        exam.answerKeyUrl = `uploads/answer-keys/${req.file.filename}`;
        await exam.save();

        res.json({ message: 'Answer key uploaded successfully', exam });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const Teacher = require('../models/Teacher'); // Ensure Teacher model is loaded

// @desc    Approve Exam
// @route   PUT /api/exams/:id/approve
// @access  Private/Admin
const approveExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Auto-repair: Check if teacher link is valid (it might be a User ID from earlier bug)
        // If populate fails effectively or we cant find the teacher doc by ID, try finding it by User ID
        const teacherExists = await Teacher.findById(exam.teacher);
        if (!teacherExists) {
            console.log(`Exam ${exam._id} has invalid Teacher ID ${exam.teacher}. Checking if it's a User ID...`);
            const teacherProfile = await Teacher.findOne({ user: exam.teacher });
            if (teacherProfile) {
                console.log(`Auto-repairing: Found Teacher profile ${teacherProfile._id} for User ${exam.teacher}`);
                exam.teacher = teacherProfile._id;
            } else {
                console.warn(`Could not auto-repair exam teacher link. Teacher might be missing.`);
            }
        }

        exam.status = 'approved';
        exam.approvedBy = req.user._id;
        exam.approvedAt = Date.now();
        await exam.save();

        await exam.populate(['class', 'subject', 'teacher', 'approvedBy']);
        res.json({ message: 'Exam approved successfully', exam });
    } catch (error) {
        console.error('Approve Exam Error:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Reject Exam
// @route   PUT /api/exams/:id/reject
// @access  Private/Admin
const rejectExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        exam.status = 'rejected';
        exam.rejectionReason = req.body.reason || 'No reason provided';
        await exam.save();

        await exam.populate(['class', 'subject', 'teacher']);
        res.json({ message: 'Exam rejected', exam });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Pending Exams
// @route   GET /api/exams/pending
// @access  Private/Admin
const getPendingExams = async (req, res) => {
    try {
        const exams = await Exam.find({ status: 'pending' })
            .populate('class', 'grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Approved Exams
// @route   GET /api/exams/approved
// @access  Private/Student
const getApprovedExams = async (req, res) => {
    try {
        const { classId } = req.query;
        const query = { status: 'approved' };
        if (classId) query.class = classId;

        const exams = await Exam.find(query)
            .populate('class', 'grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ examDate: 1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Exams
// @route   GET /api/exams
// @access  Private/Admin
const getAllExams = async (req, res) => {
    try {
        console.log('Fetching all exams...');
        // Ensure models are registered (just in case)
        require('../models/Class');
        require('../models/Subject');
        require('../models/Teacher');

        // Remove .lean() temporarily to see if it changes anything, or keep it if debug showed it works. 
        // Let's keep .lean() as it's safer.
        const exams = await Exam.find({})
            .populate('class', 'grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ examDate: -1 });

        res.json(exams);
    } catch (error) {
        console.error('Error in getAllExams:', error);
        res.status(500).json({
            message: 'Server Error while fetching exams',
            error: error.message
        });
    }
};

// @desc    Get Single Exam
// @route   GET /api/exams/:id
// @access  Private
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('class', 'grade section')
            .populate('subject', 'name code')
            .populate('teacher', 'name qualification')
            .populate('approvedBy', 'email');

        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Exam
// @route   PUT /api/exams/:id
// @access  Private/Admin/Teacher
const updateExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate(['class', 'subject', 'teacher']);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Exam
// @route   DELETE /api/exams/:id
// @access  Private/Admin
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        // Delete associated files
        if (exam.examPaperUrl) {
            const paperPath = path.join(__dirname, '..', exam.examPaperUrl);
            if (fs.existsSync(paperPath)) {
                fs.unlinkSync(paperPath);
            }
        }
        if (exam.answerKeyUrl) {
            const keyPath = path.join(__dirname, '..', exam.answerKeyUrl);
            if (fs.existsSync(keyPath)) {
                fs.unlinkSync(keyPath);
            }
        }

        await exam.deleteOne();
        res.json({ message: 'Exam deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Exams for a Class
// @route   GET /api/exams/class/:classId
// @access  Private
const getExamsByClass = async (req, res) => {
    try {
        const exams = await Exam.find({ class: req.params.classId })
            .populate('subject', 'name code')
            .populate('teacher', 'name')
            .sort({ examDate: 1 });
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download Exam Paper
// @route   GET /api/exams/:id/download-paper
// @access  Private/Student (only if approved)
const downloadExamPaper = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        if (exam.status !== 'approved' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Exam paper not yet approved' });
        }

        if (!exam.examPaperUrl) {
            return res.status(404).json({ message: 'No exam paper uploaded' });
        }

        const filePath = path.join(__dirname, '..', exam.examPaperUrl);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(filePath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createExam,
    uploadExamPaper,
    uploadAnswerKey,
    approveExam,
    rejectExam,
    getPendingExams,
    getApprovedExams,
    getAllExams,
    getExamsByClass,
    getExamById,
    updateExam,
    deleteExam,
    downloadExamPaper
};
