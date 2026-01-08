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
    getOnlineUsers,
    getGithubRepos,
    disconnectGithub,
    getGithubStats
} from '../controllers/userController.js';
import { updatePushToken } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

import upload from '../middleware/uploadMiddleware.js';

router.get('/me', protect, (req, res) => {
    res.json(req.user);
});

router.put('/pushtoken', protect, updatePushToken);

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile).delete(protect, deleteUser);
router.route('/profile-pic').put(protect, upload.single('profilePic'), updateProfilePic);
router.route('/banner-pic').put(protect, upload.single('bannerPic'), updateBannerPic);
router.route('/search').get(protect, searchUsers);
router.route('/recommended').get(protect, getRecommendedUsers);
router.route('/online').get(protect, getOnlineUsers);
router.route('/github/repos').get(protect, getGithubRepos);
router.delete('/github', protect, disconnectGithub);

// Public routes (or semi-public)
router.get('/:id/stats', getUserStats);
router.get('/:id/github/stats', getGithubStats);
router.get('/:username', getUserByUsername);
router.put('/:id/follow', protect, followUser);

export default router;
