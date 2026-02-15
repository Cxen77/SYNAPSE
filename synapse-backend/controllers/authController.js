import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';
import { validatePassword } from '../utils/validation.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Find user (select password)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        // 2. Check Verification
        if (!user.isEmailVerified) {
            res.status(403);
            throw new Error('Email not verified. Please verify your email.');
        }

        // 3. Issue Token
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
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, username, email, password, course, year, bio, skills, socials } = req.body;

    // 1. Validate Password Strength
    if (!validatePassword(password)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    }

    // 2. Check Exists
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

    // 3. Generate OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    // 4. Create User (isEmailVerified: false)
    const user = await User.create({
        name,
        username,
        email,
        password, // Pre-save hook will hash this
        course,
        year,
        bio,
        skills,
        socials,
        otpHash,
        otpExpiresAt,
        isEmailVerified: false
    });

    // 5. Send OTP Email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Verification Code - SYNAPSE',
            message: `Your verification code is: ${otp}. It expires in 10 minutes.`
        });
    } catch (err) {
        // If email fails, we shouldn't delete user, but user needs to resend
        console.error('Email send failed:', err);
    }

    if (user) {
        res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            requiresVerification: true,
            email: user.email
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isEmailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
    }

    // Check Lockout
    if (user.otpLockUntil && user.otpLockUntil > Date.now()) {
        res.status(429);
        throw new Error('Too many failed attempts. Please try again later.');
    }

    // Check Expiry
    if (user.otpExpiresAt < Date.now()) {
        res.status(400);
        throw new Error('OTP expired. Please request a new one.');
    }

    // Verify Hash
    const isMatch = await bcrypt.compare(otp, user.otpHash);

    if (!isMatch) {
        user.otpAttempts += 1;
        if (user.otpAttempts >= 5) {
            user.otpLockUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
            user.otpAttempts = 0; // Reset attempts after lock
        }
        await user.save();
        res.status(400);
        throw new Error('Invalid OTP');
    }

    // Success
    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    user.otpLockUntil = undefined;
    await user.save();

    const token = generateToken(res, user._id);

    res.json({
        message: 'Email verified successfully',
        _id: user._id,
        name: user.name,
        email: user.email,
        token
    });
});

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent enumeration
    if (!user) {
        return res.json({ message: 'If a user with that email exists, a reset link has been sent.' });
    }

    // Generate Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    // Send Email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `You requested a password reset. Click here to reset: ${resetUrl}`
        });
        res.json({ message: 'If a user with that email exists, a reset link has been sent.' });
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(500);
        throw new Error('Email could not be sent');
    }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // Hash token to compare
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }

    // Validate New Password
    if (!validatePassword(newPassword)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    }

    // Set new password (pre-save hook hashes it)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

export {
    authUser,
    registerUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logoutUser
};
