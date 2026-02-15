// ==========================
// ENV (MUST BE FIRST)
// ==========================
import dotenv from 'dotenv';
dotenv.config(); // ALWAYS load env vars (safe for Render)

// ==========================
// CORE IMPORTS
// ==========================
import express from 'express'; // Force restart
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import { createServer } from 'http';
import fs from 'fs';

// ==========================
// INTERNAL IMPORTS
// ==========================
import connectDB from './config/db.js';
import { initSocket } from './socket/socketServer.js';
import initDirectories from './utils/initDirectories.js';
import { initializeFirebase } from './config/firebaseAdmin.js';

// ==========================
// SECURITY / OPTIMIZATION
// ==========================
import compression from 'compression';
import xss from 'xss-clean';
import hpp from 'hpp';
import { globalLimiter } from './middleware/rateLimiters.js';
import passport from './config/passport.js';
import mongoose from 'mongoose';

// ==========================
// INITIALIZE SERVICES
// ==========================
connectDB();
initDirectories();
initializeFirebase();

// ==========================
// APP + SERVER
// ==========================
const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

// ==========================
// DIRNAME FIX (ESM)
// ==========================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================
// HELMET
// ==========================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
);

// ==========================
// CORS
// ==========================
const allowedOrigins = [
  'http://localhost:5173',
  'https://fuseon.in',
  'https://www.fuseon.in',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ==========================
// MIDDLEWARES
// ==========================
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(globalLimiter);
app.use(morgan('dev'));

// ==========================
// STATIC FILES
// ==========================
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Re-enabled for legacy/local images

// ==========================
// ROUTES
// ==========================
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import postRoutes from './routes/postRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import autoTeamRoutes from './routes/autoTeamRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/autoteam', autoTeamRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);

// ==========================
// PASSPORT CONFIG
// ==========================
app.use(passport.initialize());

// ==========================
// HEALTH CHECK
// ==========================

app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  res.status(200).json({
    status: 'success',
    uptime: Math.floor(process.uptime()) + 's',
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
    },
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('Synapse Backend API');
});

// ==========================
// 404 HANDLER
// ==========================
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// ==========================
// GLOBAL ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const logMessage = `${new Date().toISOString()} - ${statusCode} - ${err.message
    }\n${err.stack}\n\n`;

  try {
    fs.appendFileSync(
      path.join(__dirname, 'server_errors.log'),
      logMessage
    );
  } catch (_) { }

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// ==========================
// START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});
