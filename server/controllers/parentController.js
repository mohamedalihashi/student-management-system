const Parent = require('../models/Parent');
const Student = require('../models/Student');

// @desc    Link a student to a parent
// @route   POST /api/parents/add-student
// @access  Private/Admin
const addStudentToParent = async (req, res) => {
    const { parentId, studentId } = req.body;

    try {
        const parent = await Parent.findById(parentId);
        const student = await Student.findById(studentId);

        if (!parent || !student) {
            return res.status(404).json({ message: 'Parent or Student not found' });
        }

        // Check if already linked
        if (parent.children.includes(studentId)) {
            return res.status(400).json({ message: 'Student already linked to this parent' });
        }

        parent.children.push(studentId);
        await parent.save();

        res.status(200).json({
            message: 'Student linked successfully',
            parent: await Parent.findById(parentId).populate('children', 'name rollNumber')
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in parent's children
// @route   GET /api/parents/my-children
// @access  Private/Parent
const getMyChildren = async (req, res) => {
    try {
        // Find the Parent profile associated with the logged-in User
        const parent = await Parent.findOne({ user: req.user._id }).populate({
            path: 'children',
            select: 'name gender dob rollNumber class',
            populate: {
                path: 'class',
                select: 'grade section'
            }
        });

        if (!parent) {
            return res.status(404).json({ message: 'Parent profile not found for this user' });
        }

        res.json(parent.children);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all parents
// @route   GET /api/parents
// @access  Private/Admin
const getAllParents = async (req, res) => {
    try {
        const parents = await Parent.find({}).populate('user', 'email').populate('children', 'name rollNumber');
        res.json(parents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create/Update Parent Profile
// @route   POST /api/parents
// @access  Private/Admin
const updateParentProfile = async (req, res) => {
    const { userId, name, phone, address } = req.body;

    try {
        let parent = await Parent.findOne({ user: userId });

        const parentFields = {
            user: userId,
            name,
            phone,
            address
        };

        if (parent) {
            parent = await Parent.findOneAndUpdate(
                { user: userId },
                { $set: parentFields },
                { new: true }
            );
        } else {
            parent = new Parent(parentFields);
            await parent.save();
        }

        res.json(parent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Parent
// @route   DELETE /api/parents/:id
// @access  Private/Admin
const deleteParent = async (req, res) => {
    try {
        const parent = await Parent.findByIdAndDelete(req.params.id);
        if (!parent) return res.status(404).json({ message: 'Parent not found' });
        res.json({ message: 'Parent deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addStudentToParent,
    getMyChildren,
    getAllParents,
    updateParentProfile,
    deleteParent
};
