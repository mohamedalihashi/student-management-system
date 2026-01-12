const Subject = require('../models/Subject');

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res) => {
    const { name, code, class: classId, teacher } = req.body;

    try {
        const subject = await Subject.create({
            name,
            code,
            class: classId,
            teacher
        });
        res.status(201).json(subject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private/Admin/Teacher
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({})
            .populate('class', 'grade section')
            .populate('teacher', 'name');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (subject) {
            await subject.deleteOne();
            res.json({ message: 'Subject removed' });
        } else {
            res.status(404).json({ message: 'Subject not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    deleteSubject
};
