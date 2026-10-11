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
    getPostDetails,
    createReply,
    toggleLike,
    toggleDislike,
    toggleReplyLike,
    toggleReplyDislike,
    searchPosts,
    toggleSavePost,
    reportPost
} from '../controllers/forumController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import requireFeature from '../middleware/requireFeature.js';

const router = express.Router();

// Forum Routes
router.route('/')
    .post(protect, requireFeature('forum'), createForum)
    .get(optionalProtect, getAllForums);

router.route('/posts/feed')
    .get(optionalProtect, getAllPosts);

router.route('/posts/search')
    .get(optionalProtect, searchPosts);

router.route('/:id')
    .get(optionalProtect, getForumById);

router.route('/:id/join')
    .put(protect, joinForum);

router.route('/:id/leave')
    .put(protect, leaveForum);

// Post Routes (nested under forums for creation, but also standalone for actions)
router.route('/:id/posts')
    .post(protect, requireFeature('forum'), createPost)
    .get(optionalProtect, getForumPosts);

// Single Post Actions
router.route('/post/:id')
    .get(optionalProtect, getPostDetails);

router.route('/post/:id/reply')
    .post(protect, requireFeature('forum'), createReply);

router.route('/posts/:id/like')
    .put(protect, toggleLike);

router.route('/posts/:id/dislike')
    .put(protect, toggleDislike);

router.route('/posts/:id/save')
    .put(protect, toggleSavePost);

router.route('/posts/:id/report')
    .post(protect, reportPost);

// Reply Actions
router.route('/replies/:id/like')
    .put(protect, toggleReplyLike);

router.route('/replies/:id/dislike')
    .put(protect, toggleReplyDislike);

export default router;
