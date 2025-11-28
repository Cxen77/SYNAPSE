import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location } = req.body;

    const event = await Event.create({
        title,
        description,
        date,
        location,
        organizer: req.user._id,
        attendees: [req.user._id]
    });

    res.status(201).json(event);
});

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Event.countDocuments({});
    const events = await Event.find({})
        .populate('organizer', 'name username profilePic')
        .sort({ date: 1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ events, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Join an event
// @route   PUT /api/events/:id/join
// @access  Private
const joinEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.attendees.includes(req.user._id)) {
            res.status(400);
            throw new Error('User already attending');
        }

        event.attendees.push(req.user._id);
        await event.save();
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Leave an event
// @route   PUT /api/events/:id/leave
// @access  Private
const leaveEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (event) {
        event.attendees = event.attendees.filter(id => id.toString() !== req.user._id.toString());
        await event.save();
        res.json({ message: 'Left event' });
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

export { createEvent, getEvents, joinEvent, leaveEvent };
