import asyncHandler from 'express-async-handler';
import { admin } from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import SystemSettings from '../models/SystemSettings.js';

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token with Firebase Admin
            if (!admin.apps.length) {
                throw new Error('Firebase Admin not initialized');
            }

            const decodedToken = await admin.auth().verifyIdToken(token);
            const { uid, email, name, picture } = decodedToken;

            // Find or create user in MongoDB
            let user = await User.findOne({ email });

            if (!user) {
                // Create new user if not exists
                user = await User.create({
                    name: name || email.split('@')[0],
                    email: email,
                    username: email.split('@')[0],
                    profilePic: picture,
                    firebaseUid: uid
                });
            } else if (!user.firebaseUid) {
                // Link existing user to Firebase UID if missing
                user.firebaseUid = uid;
                await user.save();
            }

            req.user = user;

            // Block suspended users globally
            if (user.isSuspended) {
                res.status(403);
                throw new Error('Your account has been suspended. Contact support for assistance.');
            }

            // Maintenance mode — block non-admins
            const settings = await SystemSettings.getSettings();
            const maintenance = settings.features?.get('maintenance');
            if (maintenance?.enabled && user.role !== 'admin') {
                res.status(503);
                throw new Error('Service temporarily unavailable — maintenance in progress');
            }

            next();
        } catch (error) {
            console.error('Auth Error:', error);
            // Preserve original status (403 suspension, 503 maintenance) — only default to 401
            if (!res.headersSent) {
                const status = res.statusCode >= 400 ? res.statusCode : 401;
                res.status(status);
                throw new Error(error.message || 'Not authorized, token failed');
            }
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect };
