const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            // Check if active
            if (!user.isActive) {
                return res.status(401).json({ message: 'Account is deactivated' });
            }

            generateToken(res, user._id);

            res.status(200).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                message: 'Logged in successfully'
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
    };
    res.status(200).json(user);
};

module.exports = {
    loginUser,
    logoutUser,
    getMe,
};
