import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { joinQueue, leaveQueue, getQueueStatus } from '../controllers/autoTeamController.js';

const router = express.Router();

router.post('/:eventId/join', protect, joinQueue);
router.delete('/:eventId/leave', protect, leaveQueue);
router.get('/:eventId/status', protect, getQueueStatus);

export default router;
