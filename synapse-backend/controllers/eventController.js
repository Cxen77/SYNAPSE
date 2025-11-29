import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, location, category, prize, imageUrl } = req.body;

    const event = await Event.create({
        title,
        description,
        date,
        location,
        category,
        prize,
        imageUrl,
        organizer: req.user._id,
        attendees: [req.user._id]
    });

    res.status(201).json(event);
});

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
    const pageSize = 100;
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
    const event = await Event.findById(req.params.id)
        .populate('organizer', 'name username profilePic')
        .populate('attendees', 'name username profilePic'); // Populate attendees too for the view

    if (event) {
        res.json(event);
    } else {
        res.status(404);
        throw new Error('Event not found');
    }
});

export { createEvent, getEvents, joinEvent, leaveEvent, updateEvent, getEventById };
