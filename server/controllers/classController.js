const Class = require('../models/Class');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res) => {
    const { grade, section, classTeacher } = req.body;

    try {
        const classExists = await Class.findOne({ grade, section });

        if (classExists) {
            return res.status(400).json({ message: 'Class already exists' });
        }

        const newClass = await Class.create({
            grade,
            section,
            classTeacher
        });

        res.status(201).json(newClass);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private/Admin/Teacher
const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find({}).populate('classTeacher', 'name');
        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id)
            .populate('classTeacher', 'name')
            .populate('students', 'name rollNumber gender');

        if (cls) {
            res.json(cls);
        } else {
            res.status(404).json({ message: 'Class not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update class info
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id);

        if (cls) {
            cls.grade = req.body.grade || cls.grade;
            cls.section = req.body.section || cls.section;
            cls.classTeacher = req.body.classTeacher || cls.classTeacher;

            const updatedClass = await cls.save();
            res.json(updatedClass);
        } else {
            res.status(404).json({ message: 'Class not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res) => {
    try {
        const cls = await Class.findById(req.params.id);

        if (cls) {
            await cls.deleteOne();
            res.json({ message: 'Class removed' });
        } else {
            res.status(404).json({ message: 'Class not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass
};
