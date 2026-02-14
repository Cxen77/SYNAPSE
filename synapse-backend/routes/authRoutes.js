import express from 'express';
import { authUser, registerUser, logoutUser } from '../controllers/authController.js';
import passport from 'passport';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js'; // Import User directly here for callback logic helper if needed, or better, keep logic in controller

import { authLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router.post('/login', authLimiter, authUser);
router.post('/signup', authLimiter, registerUser);
router.post('/logout', logoutUser);

// ==========================
// GITHUB OAUTH ROUTES
// ==========================

// 1. Initiate GitHub Login
// We use a custom callback to ensure `req.user` (from our JWT auth middleware) is available if we want to link accounts.
// However, Passport standard flow redirects *to* GitHub.
// To link an account, the user clicks "Connect GitHub". 
// The frontend should send a token? No, standard OAuth is a browser redirect.
// So: User clicks link -> Browser goes to /api/auth/github?token=... (unsafe to pass token in URL?)
// Better: User clicks link -> Browser goes to /api/auth/github. 
// COOKIES? This app uses localStorage JWT. 
// Issue: Passport won't see the User if it's in localStorage.
// Solution: We pass the JWT as a query param 'token', verify it, and set req.user manually before passport.authenticate.

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

            // Pass user ID as "state" to GitHub
            // Passport will send this to GitHub, and GitHub will echo it back.
            // We can then use it in the callback.
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
        // Log the callback query for debugging
        console.log('GitHub Callback received:', req.query);
        next();
    },
    passport.authenticate('github', {
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=github_auth_failed`,
        session: false
    }),
    (req, res) => {
        // Successful authentication
        // IN OUR CASE: passport strategy currently only succeeds if req.user exists (via our custom logic usually)
        // BUT invalidating that plan: req.user is populated by session usually. We have no session.
        // 
        // LET'S SIMPLIFY for this "Agentic" sprint:
        // We will just Redirect to frontend with the Github Access Token in query param?
        // No, that exposes it.
        // 
        // BACKTRACK:
        // Check `config/passport.js`. It tries to find user by `req.user`.
        // This won't work without sessions or passing token.
        // 
        // FIX: We need to handle the linkage MANUALLY in the callback if using JWT.
        // Or we use the strategy which returns the "GitHub Profile".
        // Then in this callback, we decide what to do.

        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/profile?github=success`);
    }
);

export default router;
