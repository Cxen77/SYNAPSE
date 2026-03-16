import asyncHandler from 'express-async-handler';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import stream from 'stream';
import Comment from '../models/Comment.js';

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
        if (user && user.following) {
            query.user = { $in: user.following };
        }
    } else if (req.query.userId) {
        query.user = req.query.userId;
    }

    const count = await Post.countDocuments(query);
    const posts = await Post.find(query)
        .populate('user', 'name username profilePic collegeVerified')
        // DONT POPULATE COMMENTS — Saves DB memory and massive payload size
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 }) // Hits the new compound index ({ isDeleted: 1, createdAt: -1 })
        .select('-__v') // Exclude the version key
        .lean();

    const formattedPosts = posts.map(post => {
        const likesList = post.likes || [];
        const likedByUser = likesList.some(id => id.toString() === req.user._id.toString());

        const formatted = {
            _id: post._id,
            user: post.user,
            content: post.content,
            image: post.image,
            createdAt: post.createdAt,
            // Computed fields instead of arrays
            likesCount: likesList.length,
            commentsCount: post.commentsCount || (post.comments ? post.comments.length : 0), // Fallback map for older un-migrated posts
            likedByUser
        };
        return formatted;
    });

    res.json({ posts: formattedPosts, page, pages: Math.ceil(count / pageSize) });
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
    const userId = req.user._id;
    const postId = req.params.id;

    // Fast atomic check if the user already liked the post
    const postWithUserLike = await Post.findOne({ _id: postId, likes: userId });

    let updatedPost;
    let likedByUser;

    if (postWithUserLike) {
        // User already liked it -> secure atomic pull
        updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $pull: { likes: userId } },
            { new: true }
        );
        likedByUser = false;
    } else {
        // User hasn't liked it -> secure atomic push
        updatedPost = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );
        likedByUser = true;

        // Create Notification
        if (updatedPost && updatedPost.user.toString() !== userId.toString()) {
            await Notification.create({
                recipient: updatedPost.user,
                sender: userId,
                type: 'like',
                post: updatedPost._id
            });
        }
    }

    if (!updatedPost) {
        res.status(404);
        throw new Error('Post not found');
    }

    res.json({
        postId: updatedPost._id,
        likesCount: updatedPost.likes.length,
        likedByUser
    });
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const { text, parentCommentId } = req.body; // parentCommentId for replies
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    // 1. Create the new standalone comment
    const newComment = await Comment.create({
        post: postId,
        user: userId,
        text,
        parentComment: parentCommentId || null
    });

    // 2. Increment post commentsCount
    await Post.updateOne({ _id: postId }, { $inc: { commentsCount: 1 } });

    // 3. Create Notification
    if (post.user.toString() !== userId.toString()) {
        await Notification.create({
            recipient: post.user,
            sender: userId,
            type: parentCommentId ? 'reply' : 'comment',
            post: postId,
            commentId: newComment._id
        });
    }

    // Populate user before sending back to frontend matching old format expectations
    const populatedComment = await Comment.findById(newComment._id)
        .populate('user', 'name username profilePic collegeVerified');

    // Return the single newly created comment (frontend should append to list/cache)
    res.status(201).json(populatedComment);
});

// @desc    Delete comment
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const { id: postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    // Attempt to find it backwards-compatibly first (embedded vs standalone)
    const standaloneComment = await Comment.findById(commentId);

    if (standaloneComment) {
        // Handle new generic standalone comment deletion
        if (standaloneComment.user.toString() !== userId.toString() && post.user.toString() !== userId.toString()) {
            res.status(401);
            throw new Error('User not authorized to delete this comment');
        }
        await Comment.deleteOne({ _id: commentId });
        await Post.updateOne({ _id: postId }, { $inc: { commentsCount: -1 } });
        return res.json({ message: 'Comment removed' });

    } else {
        // Fallback: It might be a legacy embedded comment
        const embeddedComment = post.comments.find(c => c._id.toString() === commentId);
        if (!embeddedComment) {
            res.status(404);
            throw new Error('Comment not found');
        }

        if (embeddedComment.user.toString() !== userId.toString() && post.user.toString() !== userId.toString()) {
            res.status(401);
            throw new Error('User not authorized to delete this embedded comment');
        }

        post.comments = post.comments.filter(c => c._id.toString() !== commentId);
        await post.save();
        return res.json({ message: 'Legacy comment removed' });
    }
});

// @desc    Get comments for a post (Paginated)
// @route   GET /api/posts/:id/comments
// @access  Private
const getPostComments = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const pageSize = Math.min(Number(req.query.limit) || 20, 50);
    const page = Number(req.query.page) || 0; // Skip offset index

    const post = await Post.findById(postId).select('comments').lean();
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    // Merge strategy for backward compatibility:
    // Some posts still have embedded comments. We'll return them together.

    // 1. Fetch new standalone comments (paginated)
    const standaloneCommentsPromise = Comment.find({ post: postId, parentComment: null })
        .populate('user', 'name username profilePic collegeVerified')
        .sort({ createdAt: -1 })
        .skip(page * pageSize)
        .limit(pageSize)
        .lean();

    const [standaloneComments] = await Promise.all([standaloneCommentsPromise]);

    let mergedComments = [...standaloneComments];

    // 2. Format legacy embedded comments if they exist and we are on page 0
    if (page === 0 && post.comments && post.comments.length > 0) {
        // Only append legacy on the first page load so they aren't duplicated in infinite scroll
        // This is a tradeoff but completely protects old data from vaporizing.

        // Note: To deeply populate old embedded arrays requires a full Mongo hook or manual projection,
        // but since it's legacy data, we merge the IDs and the frontend normally requires populated users.
        // We'll fully populate the legacy array here just in case.
        const fullLegacyPost = await Post.findById(postId)
            .populate('comments.user', 'name username profilePic collegeVerified')
            .populate('comments.replies.user', 'name username profilePic collegeVerified')
            .lean();

        mergedComments = [...mergedComments, ...fullLegacyPost.comments];

        // Sort merged just to be sure
        mergedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(mergedComments);
});

export { createPost, getPosts, deletePost, likePost, addComment, deleteComment, getPostComments };
