import asyncHandler from 'express-async-handler';

/**
 * requireAdmin middleware
 * Must be used AFTER the `protect` middleware (req.user is already set)
 * Verifies that the authenticated user has the "admin" role.
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Unauthorized — no user found');
    }

    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Forbidden — admin access required');
    }

    next();
});
