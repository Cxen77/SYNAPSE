import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import cloudinary from '../config/cloudinary.js';
import stream from 'stream';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    let image = req.body.image;

    if (req.file) {
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'synapse_posts' },
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
            image = result.secure_url;
        } catch (error) {
            console.error(error);
            res.status(500);
            throw new Error('Image upload failed');
        }
    }

    const post = await Post.create({
        user: req.user._id,
        content,
        image
    });

    res.status(201).json(post);
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getPosts = asyncHandler(async (req, res) => {
    const pageSize = Math.min(Number(req.query.limit) || 10, 100);
    const page = Number(req.query.pageNumber) || 1;
    const filter = req.query.filter;

    let query = { isDeleted: { $ne: true } };

    if (filter === 'following') {
        const user = await User.findById(req.user._id);
        query.user = { $in: user.following };
    } else if (req.query.userId) {
        query.user = req.query.userId;
    }

    const count = await Post.countDocuments(query);
    const posts = await Post.find(query)
        .populate('user', 'name username profilePic collegeVerified')
        .populate({
            path: 'comments.user',
            select: 'name username profilePic collegeVerified'
        })
        .populate({
            path: 'comments.replies.user',
            select: 'name username profilePic collegeVerified'
        })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 })
        .lean();

    res.json({ posts, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if (post.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // SECURITY: Soft delete — preserve record
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    res.json({ message: 'Post removed' });
});

// @desc    Like/Unlike post
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
        if (post.likes.includes(req.user._id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);

            // Create Notification
            if (post.user.toString() !== req.user._id.toString()) {
                await Notification.create({
                    recipient: post.user,
                    sender: req.user._id,
                    type: 'like',
                    post: post._id
                });
            }
        }

        await post.save();
        res.json(post.likes);
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (post) {
        const comment = {
            text,
            user: req.user._id
        };

        post.comments.push(comment);
        await post.save();

        // Create Notification
        if (post.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: post.user,
                sender: req.user._id,
                type: 'comment',
                post: post._id
            });
        }

        // Populate the user in the new comment for immediate display
        const updatedPost = await Post.findById(req.params.id)
            .populate('comments.user', 'name username profilePic collegeVerified')
            .populate('comments.replies.user', 'name username profilePic collegeVerified');

        res.status(201).json(updatedPost.comments);
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
        const comment = post.comments.find(comment => comment._id.toString() === req.params.commentId);

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        // Check user
        if (comment.user.toString() !== req.user._id.toString() && post.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized');
        }

        post.comments = post.comments.filter(comment => comment._id.toString() !== req.params.commentId);
        await post.save();
        res.json({ message: 'Comment removed' });
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

// @desc    Reply to a comment
// @route   POST /api/posts/:id/comments/:commentId/replies
// @access  Private
const replyToComment = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (post) {
        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        const reply = {
            text,
            user: req.user._id
        };

        comment.replies.push(reply);
        await post.save();

        // Create Notification for comment owner
        if (comment.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: comment.user,
                sender: req.user._id,
                type: 'reply',
                post: post._id,
                commentId: comment._id
            });
        }

        // Return updated comments with population
        const updatedPost = await Post.findById(req.params.id)
            .populate('comments.user', 'name username profilePic collegeVerified')
            .populate('comments.replies.user', 'name username profilePic collegeVerified');

        res.status(201).json(updatedPost.comments);
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

export { createPost, getPosts, deletePost, likePost, addComment, deleteComment, replyToComment };
