import express from 'express';

import { createPost, getPosts, deletePost, likePost, addComment, deleteComment, replyToComment } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import requireFeature from '../middleware/requireFeature.js';
import validate from '../middleware/validate.js';
import { postSchema, commentSchema } from '../utils/validationSchemas.js';

const router = express.Router();

import upload from '../middleware/uploadMiddleware.js';

router.route('/')
    .post(protect, requireFeature('textPost'), upload.single('image'), validate(postSchema), createPost)
    .get(protect, getPosts);

router.route('/:id')
    .delete(protect, deletePost);

router.put('/:id/like', protect, likePost);

router.route('/:id/comments')
    .post(protect, validate(commentSchema), addComment);

router.route('/:id/comments/:commentId')
    .delete(protect, deleteComment);

router.route('/:id/comments/:commentId/replies')
    .post(protect, validate(commentSchema), replyToComment);

export default router;
