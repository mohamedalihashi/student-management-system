const Result = require('../models/Result');

// @desc    Add Result
// @route   POST /api/results
// @access  Private/Teacher/Admin
const addResult = async (req, res) => {
    const { examId, studentId, subjectId, marksObtained, totalMarks } = req.body;

    try {
        // Calculate grade
        const percentage = (marksObtained / totalMarks) * 100;
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';

        const result = await Result.create({
            exam: examId,
            student: studentId,
            subject: subjectId,
            marksObtained,
            totalMarks,
            grade
        });

        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bulk Add Results
// @route   POST /api/results/bulk
// @access  Private/Teacher/Admin
const bulkAddResults = async (req, res) => {
    const { results } = req.body; // Array of { examId, studentId, subjectId, marksObtained, totalMarks }

    try {
        const operations = results.map(result => {
            const percentage = (result.marksObtained / result.totalMarks) * 100;
            let grade = 'F';
            if (percentage >= 90) grade = 'A+';
            else if (percentage >= 80) grade = 'A';
            else if (percentage >= 70) grade = 'B';
            else if (percentage >= 60) grade = 'C';
            else if (percentage >= 50) grade = 'D';

            return {
                updateOne: {
                    filter: {
                        exam: result.examId,
                        student: result.studentId,
                        subject: result.subjectId
                    },
                    update: {
                        $set: {
                            marksObtained: result.marksObtained,
                            totalMarks: result.totalMarks,
                            grade
                        }
                    },
                    upsert: true
                }
            };
        });

        await Result.bulkWrite(operations);
        res.status(201).json({ message: 'Results saved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Results for Student (Report Card)
// @route   GET /api/results/student/:studentId
// @access  Private
const getStudentResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.params.studentId })
            .populate('exam', 'name')
            .populate('subject', 'name code');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Result
// @route   PUT /api/results/:id
// @access  Private/Teacher/Admin
const updateResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!result) return res.status(404).json({ message: 'Result not found' });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Result
// @route   DELETE /api/results/:id
// @access  Private/Admin
const deleteResult = async (req, res) => {
    try {
        const result = await Result.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Result not found' });
        res.json({ message: 'Result deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Results
// @route   GET /api/results
// @access  Private/Admin
const getAllResults = async (req, res) => {
    try {
        const results = await Result.find({})
            .populate('exam', 'name')
            .populate('subject', 'name code')
            .populate('student', 'name rollNumber');
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addResult,
    bulkAddResults,
    getStudentResults,
    updateResult,
    deleteResult,
    getAllResults
};


