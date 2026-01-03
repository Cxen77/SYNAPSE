import express from 'express';

import {
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
} from '../controllers/userController.js';
import { updatePushToken } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

import upload from '../middleware/uploadMiddleware.js';

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUser);

router.get('/me', protect, (req, res) => {
    res.json(req.user);
});

router.put('/pushtoken', protect, updatePushToken);

router.put('/profile-pic', protect, upload.single('profilePic'), updateProfilePic);
router.put('/banner-pic', protect, upload.single('bannerPic'), updateBannerPic);

// Search Users
router.get('/search', protect, searchUsers);

// Recommended Users
router.get('/recommended', protect, getRecommendedUsers);

// Online Users
router.get('/online', protect, getOnlineUsers);

// Follow/Unfollow
router.put('/:id/follow', protect, followUser);

// Get User Stats
router.get('/:id/stats', getUserStats);

// Get by Username
router.get('/:username', getUserByUsername);



export default router;
