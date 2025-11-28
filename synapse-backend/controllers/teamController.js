import asyncHandler from 'express-async-handler';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private
const createTeam = asyncHandler(async (req, res) => {
    const { name, description, category, visibility } = req.body;

    const team = await Team.create({
        name,
        description,
        category,
        visibility,
        createdBy: req.user._id,
        admins: [req.user._id],
        members: [req.user._id]
    });

    // Add team to user's teams
    await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } });

    res.status(201).json(team);
});

// @desc    Get user's teams
// @route   GET /api/teams
// @access  Private
const getMyTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({ members: req.user._id })
        .populate('members', 'name username profilePic')
        .populate('admins', 'name username profilePic');
    res.json(teams);
});

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeamById = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id)
        .populate('members', 'name username profilePic')
        .populate('admins', 'name username profilePic')
        .populate('invites.userId', 'name username profilePic')
        .populate('createdBy', 'name username');

    if (team) {
        res.json(team);
    } else {
        res.status(404);
        throw new Error('Team not found');
    }
});

// @desc    Invite user to team
// @route   PUT /api/teams/:id/invite
// @access  Private
const inviteUser = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Check if requester is admin
    if (!team.admins.includes(req.user._id)) {
        res.status(401);
        throw new Error('Not authorized as admin');
    }

    // Check if user already in team
    if (team.members.includes(userId)) {
        res.status(400);
        throw new Error('User already in team');
    }

    // Check if already invited
    const alreadyInvited = team.invites.find(invite => invite.userId.toString() === userId);
    if (alreadyInvited) {
        res.status(400);
        throw new Error('User already invited');
    }

    team.invites.push({ userId, status: 'pending' });
    await team.save();

    // Create Notification
    await Notification.create({
        recipient: userId,
        sender: req.user._id,
        type: 'invite',
        team: team._id,
        message: `You have been invited to join ${team.name}`
    });

    res.json({ message: 'User invited' });
});

// @desc    Accept team invite
// @route   PUT /api/teams/:id/accept
// @access  Private
const acceptInvite = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const inviteIndex = team.invites.findIndex(
        invite => invite.userId.toString() === req.user._id.toString() && invite.status === 'pending'
    );

    if (inviteIndex === -1) {
        res.status(400);
        throw new Error('No pending invite found');
    }

    // Update invite status
    team.invites[inviteIndex].status = 'accepted';

    // Add to members
    team.members.push(req.user._id);
    await team.save();

    // Add team to user's teams
    await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } });

    res.json({ message: 'Invite accepted' });
});

// @desc    Decline team invite
// @route   PUT /api/teams/:id/decline
// @access  Private
const declineInvite = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const inviteIndex = team.invites.findIndex(
        invite => invite.userId.toString() === req.user._id.toString() && invite.status === 'pending'
    );

    if (inviteIndex === -1) {
        res.status(400);
        throw new Error('No pending invite found');
    }

    team.invites[inviteIndex].status = 'rejected';
    await team.save();

    res.json({ message: 'Invite declined' });
});

// @desc    Join a public team
// @route   PUT /api/teams/:id/join
// @access  Private
const joinTeam = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    if (team.visibility === 'private') {
        res.status(400);
        throw new Error('Cannot join private team without invite');
    }

    if (team.members.includes(req.user._id)) {
        res.status(400);
        throw new Error('User already in team');
    }

    team.members.push(req.user._id);
    await team.save();

    // Add team to user's teams
    await User.findByIdAndUpdate(req.user._id, { $push: { teams: team._id } });

    res.json({ message: 'Joined team' });
});

// @desc    Leave a team
// @route   PUT /api/teams/:id/leave
// @access  Private
const leaveTeam = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Remove from members
    team.members = team.members.filter(member => member.toString() !== req.user._id.toString());
    // Remove from admins if admin
    team.admins = team.admins.filter(admin => admin.toString() !== req.user._id.toString());

    await team.save();

    // Remove team from user's teams
    await User.findByIdAndUpdate(req.user._id, { $pull: { teams: team._id } });

    res.json({ message: 'Left team' });
});

// @desc    Remove member from team
// @route   PUT /api/teams/:id/remove/:userId
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);
    const userIdToRemove = req.params.userId;

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Check if requester is admin
    if (!team.admins.includes(req.user._id)) {
        res.status(401);
        throw new Error('Not authorized as admin');
    }

    // Remove from members
    team.members = team.members.filter(member => member.toString() !== userIdToRemove);
    // Remove from admins
    team.admins = team.admins.filter(admin => admin.toString() !== userIdToRemove);

    await team.save();

    // Remove team from user's teams
    await User.findByIdAndUpdate(userIdToRemove, { $pull: { teams: team._id } });

    res.json({ message: 'Member removed' });
});

// @desc    Update team details
// @route   PUT /api/teams/:id/update
// @access  Private
const updateTeam = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Check if requester is admin
    if (!team.admins.includes(req.user._id)) {
        res.status(401);
        throw new Error('Not authorized as admin');
    }

    const { name, description, category, visibility } = req.body;

    team.name = name || team.name;
    team.description = description || team.description;
    team.category = category || team.category;
    team.visibility = visibility || team.visibility;

    const updatedTeam = await team.save();
    res.json(updatedTeam);
});

// @desc    Search teams by name
// @route   GET /api/teams/search?q=searchQuery
// @access  Private
const searchTeams = asyncHandler(async (req, res) => {
    const searchQuery = req.query.q;

    if (!searchQuery || searchQuery.trim() === '') {
        res.status(400);
        throw new Error('Search query is required');
    }

    const teams = await Team.find({
        name: { $regex: searchQuery, $options: 'i' },
        visibility: 'public' // Only search public teams
    })
        .populate('members', 'name username profilePic')
        .limit(10);

    res.json(teams);
});

// @desc    Get user's pending invites
// @route   GET /api/teams/invites
// @access  Private
const getMyInvites = asyncHandler(async (req, res) => {
    const teams = await Team.find({
        invites: {
            $elemMatch: {
                userId: req.user._id,
                status: 'pending'
            }
        }
    })
        .populate('leader', 'name username profilePic')
        .populate('members', 'name username profilePic')
        .select('name description category members leader invites'); // Select necessary fields

    // Filter the invites array in the response to only show the user's invite (optional, but cleaner)
    // or just return the team info. The frontend needs team info to show "You are invited to join [Team Name]"

    res.json(teams);
});

export {
    createTeam,
    getMyTeams,
    getTeamById,
    inviteUser,
    acceptInvite,
    declineInvite,
    joinTeam,
    leaveTeam,
    removeMember,
    updateTeam,
    searchTeams,
    getMyInvites
};
