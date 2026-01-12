const Student = require('../models/Student');
const Class = require('../models/Class');

const User = require('../models/User');

// @desc    Create/Update Student Profile
// @route   POST /api/students
// @access  Private/Admin
const updateStudentProfile = async (req, res) => {
    let { userId, name, email, password, gender, dob, rollNumber, admissionNumber, classId, phone, address, parentName, parentPhone, monthlyFee } = req.body;

    try {
        // If no userId provided, but email/password are, create a new User first
        if (!userId && email && password) {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            const user = await User.create({
                name,
                email,
                password,
                role: 'student'
            });
            userId = user._id;
        }

        let student = await Student.findOne({ user: userId });

        const studentFields = {
            user: userId,
            name,
            gender,
            dob,
            rollNumber,
            admissionNumber,
            class: classId,
            phone,
            address,
            parentName,
            parentPhone,
            monthlyFee
        };

        if (student) {
            // Update
            student = await Student.findOneAndUpdate(
                { user: userId },
                { $set: studentFields },
                { new: true }
            );
        } else {
            // Create
            student = new Student(studentFields);
            await student.save();

            // OPTIONAL: Add student to Class 'students' array automatically
            if (classId) {
                await Class.findByIdAndUpdate(classId, { $addToSet: { students: student._id } });
            }
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students (optional filter by class)
// @route   GET /api/students
// @access  Private/Admin/Teacher
const getAllStudents = async (req, res) => {
    const { classId } = req.query;
    let query = {};
    if (classId) query.class = classId;

    try {
        const students = await Student.find(query)
            .populate('user', 'email')
            .populate('class', 'grade section');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Student Profile by User ID
// @route   GET /api/students/me
// @access  Private
const getStudentProfileByUserId = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id })
            .populate('user', 'email')
            .populate('class', 'grade section');

        if (student) {
            res.json(student);
        } else {
            res.status(404).json({ message: 'Student profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateStudentProfile,
    getAllStudents,
    getStudentProfileByUserId
};
