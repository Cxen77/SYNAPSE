import express from 'express';
import { authUser, registerUser, logoutUser, verifyEmail, forgotPassword, resetPassword, googleAuth } from '../controllers/authController.js';
import passport from 'passport';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import verifyCaptcha from '../middleware/captchaMiddleware.js';

const router = express.Router();

// Apply Rate Limiting & CAPTCHA to all auth routes
// Note: Google Auth skips captcha as Firebase handles it on frontend, but we keep rate limiter.
router.post('/signup', authLimiter, verifyCaptcha, registerUser);
router.post('/login', authLimiter, verifyCaptcha, authUser);
router.post('/verify-email', authLimiter, verifyCaptcha, verifyEmail);
router.post('/forgot-password', authLimiter, verifyCaptcha, forgotPassword);
router.post('/reset-password', authLimiter, verifyCaptcha, resetPassword);

// Google Auth Route (Protected by Rate Limiter)
router.post('/google', authLimiter, googleAuth);

router.post('/logout', logoutUser);

// ==========================
// GITHUB OAUTH ROUTES
// ==========================

import { admin } from '../config/firebaseAdmin.js';

router.get('/github',
    async (req, res, next) => {
        try {
            const token = req.query.token;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            // Verify Firebase Token
            const decodedToken = await admin.auth().verifyIdToken(token);
            const { email } = decodedToken;

            // Find user in DB to get _id
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const options = {
                scope: ['user:email', 'repo'],
                state: user._id.toString()
            };

            passport.authenticate('github', options)(req, res, next);
        } catch (error) {
            console.error("Token verification failed:", error);
            res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=token_failed`);
        }
    }
);

router.get('/github/callback',
    (req, res, next) => {
        console.log('GitHub Callback received:', req.query);
        next();
    },
    passport.authenticate('github', {
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_auth_failed`,
        session: false
    }),
    (req, res) => {
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?github=success`);
    }
);

export default router;
