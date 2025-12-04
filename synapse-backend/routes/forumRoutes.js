import express from 'express';
import {
    createForum,
    getAllForums,
    getForumById,
    joinForum,
    leaveForum,
    createPost,
    getForumPosts,
    getAllPosts,
    toggleLike,
    toggleDislike
} from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Forum Routes
router.route('/')
    .post(protect, createForum)
    .get(protect, getAllForums);

router.route('/posts/feed')
    .get(protect, getAllPosts);

router.route('/:id')
    .get(protect, getForumById);

router.route('/:id/join')
    .put(protect, joinForum);

router.route('/:id/leave')
    .put(protect, leaveForum);

// Post Routes (nested under forums for creation, but also standalone for actions)
router.route('/:id/posts')
    .post(protect, createPost)
    .get(protect, getForumPosts);

router.route('/posts/:id/like')
    .put(protect, toggleLike);

router.route('/posts/:id/dislike')
    .put(protect, toggleDislike);

export default router;
