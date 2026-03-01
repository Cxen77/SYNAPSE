import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { getOnlineUserIds } from '../socket/socketServer.js';
import cloudinary from '../config/cloudinary.js';
import stream from 'stream';
import axios from 'axios';

// Security: Escape regex special characters to prevent ReDoS
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
        college: user.college,
        collegeId: user.collegeId,
        year: user.year,
        section: user.section,
        className: user.className,
        location: user.location,
        bio: user.bio,
        skills: user.skills,
        socials: user.socials,
        followers: user.followers,
        following: user.following,
        settings: user.settings,
        teams: user.teams || [],
        projects: user.projects || [],
        role: user.role,
        isSuspended: user.isSuspended,
        githubId: user.githubId // Include this to check connection status
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
        // --- Auto-sync teams array ---
        // The Team document is the source of truth. If any team's members
        // array includes this user but it's not in user.teams, sync it now.
        const Team = mongoose.model('Team');
        const actualTeams = await Team.find({ members: req.user._id }).select('_id');
        const actualTeamIds = actualTeams.map(t => t._id.toString());
        const storedTeamIds = (user.teams || []).map(t => (t._id || t).toString());

        const missingIds = actualTeamIds.filter(id => !storedTeamIds.includes(id));
        if (missingIds.length > 0) {
            // Silently fix the stale user.teams array
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { teams: { $each: missingIds } }
            });
            // Re-fetch with synced data
            const syncedUser = await User.findById(req.user._id)
                .populate({
                    path: 'teams',
                    select: 'name category members admins',
                    populate: { path: 'admins', select: '_id' }
                });
            const postsCount = await mongoose.model('Post').countDocuments({ user: req.user._id });
            const response = formatUserResponse(syncedUser);
            response.postsCount = postsCount;
            return res.json(response);
        }
        // ----------------------------

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

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // SECURITY: Strict field whitelist — block role, isSuspended, email, firebaseUid, etc.
    const ALLOWED_FIELDS = ['name', 'course', 'college', 'collegeId', 'year', 'section', 'className', 'location', 'bio', 'skills', 'socials', 'projects', 'settings', 'password'];
    const updates = Object.keys(req.body);
    const blocked = updates.filter(f => !ALLOWED_FIELDS.includes(f));
    if (blocked.length > 0) {
        console.warn(`[Security] Blocked fields in profile update: ${blocked.join(', ')} by user ${user._id}`);
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.course) user.course = req.body.course;
    if (req.body.college) user.college = req.body.college;
    if (req.body.collegeId) user.collegeId = req.body.collegeId;
    if (req.body.year) user.year = req.body.year;
    if (req.body.section) user.section = req.body.section;
    if (req.body.className !== undefined) user.className = req.body.className;
    if (req.body.location) user.location = req.body.location;
    if (req.body.bio) user.bio = req.body.bio;
    if (req.body.skills) user.skills = req.body.skills;
    if (req.body.socials) user.socials = req.body.socials;
    if (req.body.projects) user.projects = req.body.projects;

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
});

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // SECURITY: Soft delete — preserve record, clear sensitive data
    user.isSuspended = true;
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.bio = '';
    user.pushToken = '';
    user.githubAccessToken = undefined;
    user.name = `[Deleted User]`;
    await user.save();

    res.json({ message: 'Account deactivated' });
});

// @desc    Update profile picture
// @route   PUT /api/users/profile-pic
// @access  Private
// @desc    Update profile picture
// @route   PUT /api/users/profile-pic
// @access  Private
const updateProfilePic = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        if (!req.file) {
            res.status(400);
            throw new Error('No image file provided');
        }



        // Wrap stream in a promise to keep the async/await flow clean for the handler
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'synapse_profiles' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                const bufferStream = new stream.PassThrough();
                bufferStream.end(req.file.buffer);
                bufferStream.pipe(uploadStream);
            });
        };

        try {
            const result = await uploadToCloudinary();
            user.profilePic = result.secure_url;
            const updatedUser = await user.save();
            res.json(formatUserResponse(updatedUser));
        } catch (error) {
            console.error(error);
            res.status(500);
            throw new Error('Image upload failed');
        }

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
        if (!req.file) {
            res.status(400);
            throw new Error('No image file provided');
        }



        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'synapse_banners' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                const bufferStream = new stream.PassThrough();
                bufferStream.end(req.file.buffer);
                bufferStream.pipe(uploadStream);
            });
        };

        try {
            const result = await uploadToCloudinary();
            user.bannerPic = result.secure_url;
            const updatedUser = await user.save();
            res.json(formatUserResponse(updatedUser));
        } catch (error) {
            console.error(error);
            res.status(500);
            throw new Error('Image upload failed');
        }
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

    const safe = escapeRegex(searchQuery);
    const users = await User.find({
        $or: [
            { name: { $regex: safe, $options: 'i' } },
            { username: { $regex: safe, $options: 'i' } }
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

// @desc    Get user's GitHub repositories
// @route   GET /api/users/github/repos
// @access  Private
const getGithubRepos = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+githubAccessToken');

    if (!user || !user.githubAccessToken) {
        res.status(400);
        throw new Error('GitHub account not connected or token missing');
    }

    try {
        // Fetch ALL repos (public and private)
        const response = await axios.get('https://api.github.com/user/repos?sort=updated&visibility=all&per_page=100', {
            headers: {
                Authorization: `token ${user.githubAccessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });

        const repos = response.data.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            updated_at: repo.updated_at
        }));

        res.json(repos);
    } catch (error) {
        console.error('GitHub API Error:', error.response?.data || error.message);

        // Check for 401 Unauthorized (Token expired/revoked)
        if (error.response && error.response.status === 401) {
            console.log("GitHub token expired/invalid. Disconnecting user.");
            user.githubId = undefined;
            user.githubAccessToken = undefined;
            await user.save();

            res.status(401);
            throw new Error('GitHub token expired. Please reconnect your account.');
        }

        res.status(500);
        throw new Error('Failed to fetch GitHub repositories');
    }
});

// @desc    Disconnect GitHub account
// @route   DELETE /api/users/github
// @access  Private
const disconnectGithub = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.githubId = undefined;
        user.githubAccessToken = undefined;
        await user.save();
        res.json({ message: 'GitHub account disconnected' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user's GitHub stats
// @route   GET /api/users/:id/github/stats
// @access  Public
const getGithubStats = asyncHandler(async (req, res) => {
    // 1. Get the target user (NOT necessarily the current user)
    // We need their token to fetch *their* repos if we want private ones, 
    // BUT since this is a public endpoint (viewable by others), we should probably 
    // only use their token to fetch PUBLIC data or aggregated data.
    // HOWEVER, for simplicity and to allow showing off private stats if they granted access, 
    // we will use their stored token.
    const user = await User.findById(req.params.id).select('+githubAccessToken');

    if (!user || !user.githubId) {
        // If no GitHub connected, just return null or 404
        return res.status(404).json({ message: 'GitHub not connected' });
    }

    if (!user.githubAccessToken) {
        // Connected but no token (weird state, but possible if old auth)
        return res.status(404).json({ message: 'GitHub token missing' });
    }

    try {
        const headers = {
            Authorization: `token ${user.githubAccessToken}`,
            Accept: 'application/vnd.github.v3+json'
        };

        // Parallel fetch: User Profile & Repos
        const [userRes, reposRes] = await Promise.all([
            axios.get('https://api.github.com/user', { headers }),
            axios.get('https://api.github.com/user/repos?per_page=100&type=all', { headers })
        ]);

        const githubUser = userRes.data;
        const repos = reposRes.data;

        // Calculate Stats
        const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);

        // Language Stats
        const languages = {};
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });

        const topLanguages = Object.entries(languages)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([name, count]) => ({ name, count, percent: Math.round((count / repos.length) * 100) }));

        res.json({
            username: githubUser.login,
            totalRepos: githubUser.public_repos + (githubUser.total_private_repos || 0),
            totalStars,
            totalForks,
            followers: githubUser.followers,
            following: githubUser.following,
            topLanguages,
            profileUrl: githubUser.html_url
        });

    } catch (error) {
        console.error('GitHub Stats Error:', error.response?.data || error.message);
        if (error.response && error.response.status === 401) {
            // Token expired - clean up
            user.githubId = undefined;
            user.githubAccessToken = undefined;
            await user.save();
            return res.status(401).json({ message: 'GitHub token expired' });
        }
        res.status(500).json({ message: 'Failed to fetch GitHub stats' });
    }
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
    getOnlineUsers,
    getGithubRepos,
    disconnectGithub,
    getGithubStats
};
