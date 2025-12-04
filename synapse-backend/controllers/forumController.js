import asyncHandler from 'express-async-handler';
import Forum from '../models/Forum.js';
import ForumPost from '../models/ForumPost.js';

// @desc    Create a new forum
// @route   POST /api/forums
// @access  Private
const createForum = asyncHandler(async (req, res) => {
    const { name, description, icon, banner, rules, topics } = req.body;

    const forumExists = await Forum.findOne({ name });

    if (forumExists) {
        res.status(400);
        throw new Error('Forum with this name already exists');
    }

    const forum = await Forum.create({
        name,
        description,
        icon,
        banner,
        creator: req.user._id,
        members: [req.user._id], // Creator is automatically a member
        rules,
        topics
    });

    if (forum) {
        res.status(201).json(forum);
    } else {
        res.status(400);
        throw new Error('Invalid forum data');
    }
});

// @desc    Get all forums
// @route   GET /api/forums
// @access  Private
const getAllForums = asyncHandler(async (req, res) => {
    const forums = await Forum.find({})
        .select('name description icon members')
        .sort({ members: -1 }); // Sort by popularity
    res.json(forums);
});

// @desc    Get forum by ID
// @route   GET /api/forums/:id
// @access  Private
const getForumById = asyncHandler(async (req, res) => {
    const forum = await Forum.findById(req.params.id)
        .populate('creator', 'name username profilePic');

    if (forum) {
        res.json(forum);
    } else {
        res.status(404);
        throw new Error('Forum not found');
    }
});

// @desc    Join a forum
// @route   PUT /api/forums/:id/join
// @access  Private
const joinForum = asyncHandler(async (req, res) => {
    const forum = await Forum.findById(req.params.id);

    if (forum) {
        if (forum.members.includes(req.user._id)) {
            res.status(400);
            throw new Error('User already a member');
        }

        forum.members.push(req.user._id);
        await forum.save();
        res.json(forum);
    } else {
        res.status(404);
        throw new Error('Forum not found');
    }
});

// @desc    Leave a forum
// @route   PUT /api/forums/:id/leave
// @access  Private
const leaveForum = asyncHandler(async (req, res) => {
    const forum = await Forum.findById(req.params.id);

    if (forum) {
        forum.members = forum.members.filter(
            (memberId) => memberId.toString() !== req.user._id.toString()
        );
        await forum.save();
        res.json(forum);
    } else {
        res.status(404);
        throw new Error('Forum not found');
    }
});

// @desc    Create a post in a forum
// @route   POST /api/forums/:id/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { title, content, image } = req.body;
    const forumId = req.params.id;

    const forum = await Forum.findById(forumId);
    if (!forum) {
        res.status(404);
        throw new Error('Forum not found');
    }

    const post = await ForumPost.create({
        title,
        content,
        image,
        author: req.user._id,
        forum: forumId
    });

    const populatedPost = await ForumPost.findById(post._id)
        .populate('author', 'name username profilePic')
        .populate('forum', 'name icon');

    res.status(201).json(populatedPost);
});

// @desc    Get posts for a specific forum
// @route   GET /api/forums/:id/posts
// @access  Private
const getForumPosts = asyncHandler(async (req, res) => {
    const posts = await ForumPost.find({ forum: req.params.id })
        .populate('author', 'name username profilePic')
        .populate('forum', 'name icon')
        .sort({ createdAt: -1 });

    res.json(posts);
});

// @desc    Get all posts (Feed)
// @route   GET /api/forums/posts/feed
// @access  Private
const getAllPosts = asyncHandler(async (req, res) => {
    // Ideally, filter by forums the user has joined, but for now return all (Discovery)
    const posts = await ForumPost.find({})
        .populate('author', 'name username profilePic')
        .populate('forum', 'name icon')
        .sort({ createdAt: -1 });

    res.json(posts);
});

// @desc    Toggle Like on a post
// @route   PUT /api/forums/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
    const post = await ForumPost.findById(req.params.id);

    if (post) {
        // Remove from dislikes if present
        if (post.dislikes.includes(req.user._id)) {
            post.dislikes = post.dislikes.filter(id => id.toString() !== req.user._id.toString());
        }

        // Toggle like
        if (post.likes.includes(req.user._id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }

        await post.save();
        res.json(post);
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

// @desc    Toggle Dislike on a post
// @route   PUT /api/forums/posts/:id/dislike
// @access  Private
const toggleDislike = asyncHandler(async (req, res) => {
    const post = await ForumPost.findById(req.params.id);

    if (post) {
        // Remove from likes if present
        if (post.likes.includes(req.user._id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        }

        // Toggle dislike
        if (post.dislikes.includes(req.user._id)) {
            post.dislikes = post.dislikes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.dislikes.push(req.user._id);
        }

        await post.save();
        res.json(post);
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

export {
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
};
