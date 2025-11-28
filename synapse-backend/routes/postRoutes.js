import express from 'express';
import multer from 'multer';
import path from 'path';
import { createPost, getPosts, deletePost, likePost, addComment, deleteComment } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { postSchema, commentSchema } from '../utils/validationSchemas.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/posts/');
    },
    filename(req, file, cb) {
        cb(null, `post-${Date.now()}${path.extname(file.originalname)}`);
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

router.route('/')
    .post(protect, upload.single('image'), validate(postSchema), createPost)
    .get(protect, getPosts);

router.route('/:id')
    .delete(protect, deletePost);

router.put('/:id/like', protect, likePost);

router.route('/:id/comments')
    .post(protect, validate(commentSchema), addComment);

router.route('/:id/comments/:commentId')
    .delete(protect, deleteComment);

export default router;
