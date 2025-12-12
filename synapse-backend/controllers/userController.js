import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getOnlineUserIds } from '../socket/socketServer.js';

// Helper function to format user response
// Converts empty strings to undefined for cleaner frontend handling
const formatUserResponse = (user) => {
    return {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || undefined,
        bannerPic: user.bannerPic || undefined,
        course: user.course,
        year: user.year,
        bio: user.bio,
        skills: user.skills,
        followers: user.followers,
        following: user.following,
        settings: user.settings,
        teams: user.teams || [],
        projects: user.projects || []
    };
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate({
            path: 'teams',
            select: 'name category members admins', // Select specific fields
            populate: { path: 'admins', select: '_id' } // Only need IDs to check role
        });

    if (user) {
        // Get post count
        const postsCount = await mongoose.model('Post').countDocuments({ user: req.user._id });

        const response = formatUserResponse(user);
        response.postsCount = postsCount;

        res.json(response);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.course = req.body.course || user.course;
        user.year = req.body.year || user.year;
        user.bio = req.body.bio || user.bio;
        user.skills = req.body.skills || user.skills;
        user.socials = req.body.socials || user.socials;

        if (req.body.settings) {
            user.settings = {
                privacy: { ...user.settings.privacy, ...req.body.settings.privacy },
                notifications: { ...user.settings.notifications, ...req.body.settings.notifications }
            };
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json(formatUserResponse(updatedUser));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update profile picture
// @route   PUT /api/users/profile-pic
// @access  Private
const updateProfilePic = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
        console.log('Updating profile pic to:', imagePath);
        user.profilePic = imagePath;
        const updatedUser = await user.save();
        console.log('Saved profile pic:', updatedUser.profilePic);
        console.log('Current banner pic:', updatedUser.bannerPic);

        res.json(formatUserResponse(updatedUser));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update banner picture
// @route   PUT /api/users/banner-pic
// @access  Private
const updateBannerPic = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
        console.log('Updating banner pic to:', imagePath);
        user.bannerPic = imagePath;
        const updatedUser = await user.save();
        console.log('Saved banner pic:', updatedUser.bannerPic);
        console.log('Current profile pic:', updatedUser.profilePic);

        res.json(formatUserResponse(updatedUser));
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Public
const getUserByUsername = asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: req.params.username })
        .select('-password')
        .populate({
            path: 'teams',
            select: 'name category members admins',
            populate: { path: 'admins', select: '_id' }
        });

    if (user) {
        // Get post count
        const postsCount = await mongoose.model('Post').countDocuments({ user: user._id });

        const response = formatUserResponse(user);
        response.postsCount = postsCount;

        res.json(response);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Follow/Unfollow user
// @route   PUT /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (userToFollow && currentUser) {
        if (currentUser.following.includes(userToFollow._id)) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToFollow._id.toString());
            userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUser._id.toString());
            await currentUser.save();
            await userToFollow.save();
            res.json({ message: 'Unfollowed user' });
        } else {
            // Follow
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
            await currentUser.save();
            await userToFollow.save();

            // Create Notification
            await Notification.create({
                recipient: userToFollow._id,
                sender: currentUser._id,
                type: 'follow'
            });

            res.json({ message: 'Followed user' });
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Search users by name or username
// @route   GET /api/users/search?q=searchQuery
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery || searchQuery.trim() === '') {
        res.status(400);
        throw new Error('Search query is required');
    }

    const users = await User.find({
        $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { username: { $regex: searchQuery, $options: 'i' } }
        ]
    })
        .select('-password')
        .limit(10);

    res.json(users);
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
const getUserStats = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .populate('followers', 'name username profilePic')
        .populate('following', 'name username profilePic');

    if (user) {
        res.json({
            followersCount: user.followers.length,
            followingCount: user.following.length,
            followers: user.followers,
            following: user.following
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get recommended users
// @route   GET /api/users/recommended
// @access  Private
const getRecommendedUsers = asyncHandler(async (req, res) => {
    // Simple recommendation: Get 5 random users who are not the current user
    // In a real app, this would be based on skills, mutual connections, etc.
    const count = await User.countDocuments({ _id: { $ne: req.user._id } });
    const random = Math.floor(Math.random() * count);

    const users = await User.find({ _id: { $ne: req.user._id } })
        .select('name username profilePic skills')
        .limit(5);
    // .skip(random); // Skip is expensive on large datasets, but fine for small. 
    // For now, just getting first 5 is fine or use aggregation for true random.

    res.json(users);
});

// @desc    Get online users
// @route   GET /api/users/online
// @access  Private
const getOnlineUsers = asyncHandler(async (req, res) => {
    const onlineIds = getOnlineUserIds();

    if (onlineIds.length === 0) {
        return res.json([]);
    }

    const onlineUsers = await User.find({
        _id: { $in: onlineIds },
        _id: { $ne: req.user._id } // Exclude self from list? User might want to see themselves, but usually not. Let's exclude.
    }, 'name username profilePic');

    res.json(onlineUsers);
});

export {
    getUserProfile,
    updateUserProfile,
    updateProfilePic,
    updateBannerPic,
    getUserByUsername,
    followUser,
    searchUsers,
    getUserStats,
    deleteUser,
    getRecommendedUsers,
    getOnlineUsers
};
