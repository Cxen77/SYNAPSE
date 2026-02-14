import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiters.js';

import {
    getDashboardStats,
    getUsers,
    updateUserRole,
    suspendUser,
    unsuspendUser,
    deleteUser,
    getEvents,
    approveEvent,
    rejectEvent,
    deleteEvent,
    getPosts,
    deletePost,
    getForumPosts,
    deleteForumPost,
    getSettings,
    updateSettings,
    getLogs
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role + rate limiting
router.use(protect, requireAdmin, apiLimiter);

// Dashboard
router.get('/', getDashboardStats);

// User Management
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/suspend', suspendUser);
router.patch('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);

// Event Moderation
router.get('/events', getEvents);
router.patch('/events/:id/approve', approveEvent);
router.patch('/events/:id/reject', rejectEvent);
router.delete('/events/:id', deleteEvent);

// Content Moderation — Posts
router.get('/posts', getPosts);
router.delete('/posts/:id', deletePost);

// Content Moderation — Forum Posts
router.get('/forumPosts', getForumPosts);
router.delete('/forumPosts/:id', deleteForumPost);

// Feature Flags / System Settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

// Audit Logs
router.get('/logs', getLogs);

export default router;
