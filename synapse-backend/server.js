import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { initSocket } from './socket/socketServer.js';

import authRoutes from './routes/authRoutes.js';
import fs from 'fs';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import postRoutes from './routes/postRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

import initDirectories from './utils/initDirectories.js';
import { initializeFirebase } from './config/firebaseAdmin.js';

dotenv.config();

connectDB();
initDirectories();
initializeFirebase();

import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import { cacheMiddleware } from './middleware/cacheMiddleware.js';
import { globalLimiter, authLimiter, searchLimiter, apiLimiter } from './middleware/rateLimiters.js';

// Initialize App
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Performance
app.use(compression());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
// app.use('/api', globalLimiter);

// Routes
// Apply specific limiters to specific routes
// app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth', authRoutes);
// app.use('/api/teams', apiLimiter, teamRoutes);
app.use('/api/teams', teamRoutes);
// app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/posts', apiLimiter, cacheMiddleware(60), postRoutes); // Cache 1 min
app.use('/api/posts', cacheMiddleware(60), postRoutes);
// app.use('/api/forums', apiLimiter, cacheMiddleware(120), forumRoutes); // Cache 2 min
app.use('/api/forums', cacheMiddleware(120), forumRoutes);
// app.use('/api/chat', apiLimiter, chatRoutes); // No cache (Real-time)
app.use('/api/chat', chatRoutes);
// app.use('/api/stories', apiLimiter, storyRoutes); // No cache (Ephemeral)
app.use('/api/stories', storyRoutes);
// app.use('/api/events', apiLimiter, cacheMiddleware(300), eventRoutes); // Cache 5 min
app.use('/api/events', cacheMiddleware(300), eventRoutes);
// app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.send('Synapse Backend API - Use /health for health check');
});

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log to file for debugging
    const logMessage = `${new Date().toISOString()} - ${statusCode} - ${err.message}\n${err.stack}\n\n`;
    try {
        fs.appendFileSync(path.join(__dirname, 'server_errors.log'), logMessage);
    } catch (e) {
        console.error("Failed to write to log file:", e);
    }
    console.error("SERVER ERROR:", err);

    res.status(statusCode);
    res.json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
