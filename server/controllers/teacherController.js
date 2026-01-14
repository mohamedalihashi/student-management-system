const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');

// @desc    Create/Update Teacher Profile
// @route   POST /api/teachers
// @access  Private/Admin
const updateTeacherProfile = async (req, res) => {
    const { userId, name, qualification, phone, address } = req.body;

    try {
        let teacher = await Teacher.findOne({ user: userId });

        const teacherFields = {
            user: userId,
            name,
            qualification,
            phone,
            address
        };

        if (teacher) {
            teacher = await Teacher.findOneAndUpdate(
                { user: userId },
                { $set: teacherFields },
                { new: true }
            );
        } else {
            teacher = new Teacher(teacherFields);
            await teacher.save();
        }

        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find({}).populate('user', 'email');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Private/Admin
const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).populate('user', 'email');
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json({ message: 'Teacher deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get classes assigned to the logged-in teacher
// @route   GET /api/teachers/my-classes
// @access  Private/Teacher
const getMyClasses = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user._id });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher profile not found' });
        }

        const subjects = await Subject.find({ teacher: teacher._id }).populate('class');
        const classMap = new Map();
        subjects.forEach(s => {
            if (s.class) {
                classMap.set(s.class._id.toString(), s.class);
            }
        });
        const classes = Array.from(classMap.values());

        res.json(classes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current teacher profile
// @route   GET /api/teachers/me
// @access  Private/Teacher
const getMe = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ user: req.user._id }).populate('user', 'email');
        if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateTeacherProfile,
    getAllTeachers,
    getTeacherById,
    deleteTeacher,
    getMyClasses,
    getMe
};
