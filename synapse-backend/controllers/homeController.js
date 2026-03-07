import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Team from '../models/Team.js';
import Event from '../models/Event.js';

// Helper function to format user response (matches userController)
const formatUserResponse = (user) => {
    return {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || undefined,
        bannerPic: user.bannerPic || undefined,
        course: user.course,
        college: user.college,
        collegeId: user.collegeId,
        year: user.year,
        section: user.section,
        className: user.className,
        location: user.location,
        bio: user.bio,
        skills: user.skills,
        socials: user.socials,
        followers: user.followers,
        following: user.following,
        settings: user.settings,
        teams: user.teams || [],
        projects: user.projects || [],
        role: user.role,
        isSuspended: user.isSuspended,
        collegeVerified: user.collegeVerified,
        collegeVerificationMethod: user.collegeVerificationMethod || null,
        collegeVerifiedAt: user.collegeVerifiedAt || null,
        verificationNote: user.verificationNote || '',
        githubId: user.githubId
    };
};

// @desc    Get aggregated home data
// @route   GET /api/home
// @access  Private
const getHomeData = asyncHandler(async (req, res) => {
    const isMobile = req.query.device === 'mobile';
    const userId = req.user._id;

    // 1. Fetch Posts (Feed) - Always needed for both Desktop and Mobile
    // Default to "For You" feed (all posts) for the initial load
    const pageSize = 10;
    const postQuery = { isDeleted: { $ne: true } };

    const feedPromise = Post.find(postQuery)
        .populate('user', 'name username profilePic collegeVerified course')
        .populate({
            path: 'comments.user',
            select: 'name username profilePic collegeVerified'
        })
        .populate({
            path: 'comments.replies.user',
            select: 'name username profilePic collegeVerified'
        })
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean();

    if (isMobile) {
        // Mobile only needs Feed data
        const posts = await feedPromise;
        const count = await Post.countDocuments(postQuery);

        return res.json({
            feed: {
                posts,
                page: 1,
                pages: Math.ceil(count / pageSize)
            }
        });
    }

    // 2. Fetch Profile, Trending Events, Recommended Users, Open Teams for Desktop
    const profilePromise = User.findById(userId)
        .populate({
            path: 'teams',
            select: 'name category members admins',
            populate: { path: 'admins', select: '_id' }
        });

    const eventsPromise = Event.find({ isApproved: true, isDeleted: { $ne: true } })
        .populate('organizer', 'name username profilePic')
        .sort({ date: 1 })
        .limit(3)
        .lean();

    const recommendedUsersPromise = User.find({ _id: { $ne: userId } })
        .select('name username profilePic skills collegeVerified')
        .limit(5)
        .lean();

    const openTeamsPromise = Team.find({
        isLookingForMembers: true,
        visibility: 'public',
        teamStatus: 'active'
    })
        .select('name category openRoles members createdBy description teamStatus')
        .populate('members', '_id')
        .populate('createdBy', 'name username profilePic')
        .limit(5)
        .sort({ createdAt: -1 })
        .lean();

    // Execute all queries in parallel
    const [posts, profileUser, events, recommendedPeople, openTeams] = await Promise.all([
        feedPromise,
        profilePromise,
        eventsPromise,
        recommendedUsersPromise,
        openTeamsPromise
    ]);

    // Format profile and get post count
    let profile = null;
    if (profileUser) {
        const postsCount = await Post.countDocuments({ user: userId });
        profile = formatUserResponse(profileUser);
        profile.postsCount = postsCount;
    }

    const count = await Post.countDocuments(postQuery);

    res.json({
        profile,
        feed: {
            posts,
            page: 1,
            pages: Math.ceil(count / pageSize)
        },
        trendingEvents: events,
        recommendedPeople,
        openTeams
    });
});

export { getHomeData };
