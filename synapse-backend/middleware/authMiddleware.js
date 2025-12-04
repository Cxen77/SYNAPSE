import asyncHandler from 'express-async-handler';
import { admin } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

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
            next();
        } catch (error) {
            console.error('Auth Error:', error);
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

export { protect };
