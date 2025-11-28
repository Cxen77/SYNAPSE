import express from 'express';
import {
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
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Search Teams
router.get('/search', protect, searchTeams);

// Get Invites
router.get('/invites', protect, getMyInvites);

// Main Team Routes
router.route('/')
    .post(protect, createTeam)
    .get(protect, getMyTeams);

router.route('/:id')
    .get(protect, getTeamById);

// Invite Management
router.put('/:id/invite', protect, inviteUser);
router.put('/:id/accept', protect, acceptInvite);
router.put('/:id/decline', protect, declineInvite);

// Member Management
router.put('/:id/join', protect, joinTeam);
router.put('/:id/leave', protect, leaveTeam);
router.put('/:id/remove/:userId', protect, removeMember);
router.put('/:id/update', protect, updateTeam);

export default router;
