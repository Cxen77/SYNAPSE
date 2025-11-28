import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name username profilePic')
        .populate('post', 'content')
        .populate('team', 'name')
        .populate('event', 'title');

    res.json(notifications);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        if (notification.recipient.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized');
        }

        notification.read = true;
        await notification.save();
        res.json(notification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

export { getNotifications, markAsRead };
