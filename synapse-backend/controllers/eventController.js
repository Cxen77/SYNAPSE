import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (gated by requireFeature('events') middleware)
const createEvent = asyncHandler(async (req, res) => {

    const { title, description, date, location, category, prize, imageUrl, maxTeamSize } = req.body;

    const event = await Event.create({
        title,
        description,
        date,
        location,
        category,
        prize,
        imageUrl,
        maxTeamSize: maxTeamSize || 4,
        organizer: req.user._id,
        attendees: [req.user._id]
    });

    res.status(201).json(event);
});

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const pageSize = Math.min(Number(req.query.limit) || 20, 100);
    const page = Number(req.query.pageNumber) || 1;

    const filter = { isApproved: true, isDeleted: { $ne: true } };
    const count = await Event.countDocuments(filter);
    const events = await Event.find(filter)
        .populate('organizer', 'name username profilePic')
        .sort({ date: 1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .lean();

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

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, prize, imageUrl } = req.body;

    const event = await Event.findById(req.params.id);

    if (event) {
        if (event.organizer.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to update this event');
        }

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.location = location || event.location;
        event.category = category || event.category;
        event.prize = prize || event.prize;
        event.imageUrl = imageUrl || event.imageUrl;
        event.maxTeamSize = req.body.maxTeamSize || event.maxTeamSize;

        const updatedEvent = await event.save();
        await updatedEvent.populate('organizer', 'name username profilePic');
        res.json(updatedEvent);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
        .populate('organizer', 'name username profilePic')
        .populate('attendees', 'name username profilePic');

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        res.status(404);
        throw new Error('Event not found');
    }

    // Check if user is organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this event');
    }

    event.isDeleted = true;
    event.deletedAt = new Date();
    await event.save();
    res.json({ message: 'Event removed' });
});

export {
    createEvent,
    getEvents,
    joinEvent,
    leaveEvent,
    updateEvent,
    getEventById,
    deleteEvent
};
