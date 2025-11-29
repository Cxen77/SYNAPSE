import express from 'express';
import {
    createEvent,
    getEvents,
    joinEvent,
    leaveEvent,
    updateEvent,
    getEventById
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';
import { eventSchema } from '../utils/validationSchemas.js';

const router = express.Router();

router.route('/')
    .post(protect, validate(eventSchema), createEvent)
    .get(protect, getEvents);

router.route('/:id')
    .get(protect, getEventById)
    .put(protect, validate(eventSchema), updateEvent);

router.put('/:id/join', protect, joinEvent);
router.put('/:id/leave', protect, leaveEvent);

export default router;
