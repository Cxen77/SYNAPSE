import User from '../models/User.js';
import Notification from '../models/Notification.js';
import PushDevice from '../models/PushDevice.js';
import { validDeviceId, validExpoToken } from '../services/pushService.js';

export const registerPushDevice = async (req, res, next) => {
    const { token, deviceId, platform } = req.body;
    if (!validExpoToken(token) || !validDeviceId(deviceId) || !['ios', 'android'].includes(platform)) return res.status(400).json({ message: 'A valid push token, installation ID and mobile platform are required.' });
    try {
        await PushDevice.deleteMany({ deviceId, token: { $ne: token } });
        await PushDevice.findOneAndUpdate({ token }, { $set: { user: req.user._id, token, deviceId, platform, lastSeenAt: new Date() } }, { upsert: true, new: true, runValidators: true });
        res.json({ registered: true });
    } catch (error) { next(error); }
};

export const unregisterPushDevice = async (req, res, next) => {
    if (!validDeviceId(req.body.deviceId)) return res.status(400).json({ message: 'A valid installation ID is required.' });
    try {
        await PushDevice.deleteMany({ user: req.user._id, deviceId: req.body.deviceId });
        res.json({ registered: false });
    } catch (error) { next(error); }
};

// @desc    Update User Push Token
// @route   PUT /api/users/pushtoken
// @access  Private
export const updatePushToken = async (req, res) => {
    const { pushToken } = req.body;

    if (!pushToken) {
        return res.status(400).json({ message: "No token provided" });
    }

    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.pushToken = pushToken;
            await user.save();
            res.json({ message: "Push token updated" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .populate('sender', 'name profilePic')
            .populate('post', 'content')
            .populate('team', 'name')
            .populate('event', 'title') // populate event as well just in case
            .limit(20);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            if (notification.recipient.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: "Not authorized" });
            }

            notification.read = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: "Notification not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
