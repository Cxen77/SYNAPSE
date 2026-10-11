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
    getMyInvites,
    getEventTeams,
    getOpenTeams,
    getUserTeams,
    requestJoin,
    handleJoinRequest,
    addOpenRole,
    updateOpenRole,
    deleteOpenRole,
    promoteMember,
    transferOwnership,
    deleteTeam
} from '../controllers/teamController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Existing routes (unchanged) ───────────────────────
router.get('/search', optionalProtect, searchTeams);
router.get('/invites', protect, getMyInvites);
router.get('/open', optionalProtect, getOpenTeams);
router.get('/user/:userId', optionalProtect, getUserTeams);   // profile teams tab

router.route('/')
    .post(protect, createTeam)
    .get(protect, getMyTeams);

router.route('/:id')
    .get(optionalProtect, getTeamById)
    .delete(protect, deleteTeam);

// Invite management
router.put('/:id/invite', protect, inviteUser);
router.put('/:id/accept', protect, acceptInvite);
router.put('/:id/decline', protect, declineInvite);

// Member management
router.put('/:id/join', protect, joinTeam);
router.put('/:id/leave', protect, leaveTeam);
router.put('/:id/remove/:userId', protect, removeMember);
router.put('/:id/update', protect, updateTeam);

// ── New routes ────────────────────────────────────────
router.post('/:id/request-join', protect, requestJoin);
router.put('/:id/join-requests/:reqId', protect, handleJoinRequest);

router.post('/:id/roles', protect, addOpenRole);
router.put('/:id/roles/:roleId', protect, updateOpenRole);
router.delete('/:id/roles/:roleId', protect, deleteOpenRole);

router.put('/:id/members/:userId/promote', protect, promoteMember);
router.put('/:id/transfer', protect, transferOwnership);

export default router;
