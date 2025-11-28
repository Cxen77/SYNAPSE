import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
            token
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password, course, year, bio, skills, socials } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
        res.status(400);
        throw new Error('Username already taken');
    }

    const user = await User.create({
        name,
        username,
        email,
        password,
        course,
        year,
        bio,
        skills,
        socials
    });

    if (user) {
        const token = generateToken(res, user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            profilePic: user.profilePic,
            token
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});

export { authUser, registerUser, logoutUser };
