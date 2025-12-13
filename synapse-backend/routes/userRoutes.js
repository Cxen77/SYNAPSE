import express from 'express';
import multer from 'multer';
import path from 'path';
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

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (file.fieldname === 'profilePic') {
            cb(null, 'uploads/profile/');
        } else if (file.fieldname === 'bannerPic') {
            cb(null, 'uploads/banners/');
        }
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

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
