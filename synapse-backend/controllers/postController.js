import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    let image = req.body.image;

    if (req.file) {
        image = `/uploads/posts/${req.file.filename}`;
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
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;
    const filter = req.query.filter;

    let query = {};

    if (filter === 'following') {
        const user = await User.findById(req.user._id);
        query = { user: { $in: user.following } };
    } else if (req.query.userId) {
        query = { user: req.query.userId };
    }

    const count = await Post.countDocuments(query);
    const posts = await Post.find(query)
        .populate('user', 'name username profilePic')
        .populate('comments.user', 'name username profilePic')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({ posts, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (post) {
        if (post.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        await post.deleteOne();
        res.json({ message: 'Post removed' });
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
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
        const updatedPost = await Post.findById(req.params.id).populate('comments.user', 'name username profilePic');

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

export { createPost, getPosts, deletePost, likePost, addComment, deleteComment };
