import { Server } from 'socket.io';
import { admin } from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import SystemSettings from '../models/SystemSettings.js';

let io;
const onlineUsers = new Map(); // userId -> Set<socketId>

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://localhost:5174",
                "https://fuseon.in",
                "https://www.fuseon.in",
                process.env.CLIENT_URL
            ].filter(Boolean),
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Middleware for Auth
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                // console.error('[Socket Auth] No token provided in handshake');
                return next(new Error('Authentication error: No token provided'));
            }

            // console.log('[Socket Auth] Verifying token...');
            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.user = decodedToken; // { uid, email, etc. }
            // console.log('[Socket Auth] Token verified for UID:', decodedToken.uid);

            // Fetch full user from Mongo to get _id
            const user = await User.findOne({ firebaseUid: decodedToken.uid });
            if (!user) {
                // console.error('[Socket Auth] User not found in MongoDB for UID:', decodedToken.uid);
                return next(new Error('User not found in database'));
            }
            // console.log('[Socket Auth] User found in MongoDB:', user._id);
            socket.mongoUser = user;

            // Check if chat is disabled or role restricted
            const settings = await SystemSettings.getSettings();
            const chatFeature = settings.features?.get('chat');
            if (!chatFeature?.enabled) {
                return next(new Error('Chat is currently disabled'));
            }
            if (chatFeature.rolesAllowed && chatFeature.rolesAllowed.length > 0) {
                if (!chatFeature.rolesAllowed.includes(user.role)) {
                    return next(new Error('Chat access denied for your role'));
                }
            }

            // Check if user is suspended
            if (user.isSuspended) {
                return next(new Error('Account suspended'));
            }

            next();
        } catch (error) {
            console.error('Socket Auth Error:', error.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        const userId = socket.mongoUser._id.toString();

        // Join user-specific room
        socket.join(`user:${userId}`);

        // Track Socket ID
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
            console.log(`[Socket] New User Set Created for: ${userId} (Type: ${typeof userId})`);
        } else {
            // console.log(`[Socket] Adding socket ${socket.id} to existing user ${userId}`);
        }
        const userSockets = onlineUsers.get(userId);
        userSockets.add(socket.id);

        // Send existing online users map to the new client (Initial Sync)
        const activeUserIds = Array.from(onlineUsers.keys());
        socket.emit('online:users', activeUserIds);

        // If this is the FIRST connection for this user, broadcast Online
        if (userSockets.size === 1) {
            io.emit('user:presence', { userId, status: 'online' });
            console.log(`User ${userId} came ONLINE`);
        } else {
            // console.log(`User ${userId} connected another tab (Active: ${userSockets.size})`);
        }

        // Handle joining a chat room — SECURITY: verify membership
        socket.on('join:chat', async (chatId) => {
            try {
                const Chat = (await import('../models/Chat.js')).default;
                const chat = await Chat.findById(chatId).select('participants').lean();
                if (!chat || !chat.participants.some(p => p.toString() === userId)) {
                    socket.emit('error', { message: 'Not a member of this chat' });
                    return;
                }
                socket.join(`chat:${chatId}`);
            } catch (err) {
                console.error('[Socket] join:chat validation error:', err.message);
            }
        });

        // Handle leaving a chat room
        socket.on('leave:chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
        });

        // Handle typing
        socket.on('user:typing', ({ chatId, isTyping }) => {
            socket.to(`chat:${chatId}`).emit('user:typing', {
                userId,
                chatId,
                isTyping
            });
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            if (onlineUsers.has(userId)) {
                const userSockets = onlineUsers.get(userId);
                userSockets.delete(socket.id);

                // If NO connections remaining, mark as Offline
                if (userSockets.size === 0) {
                    onlineUsers.delete(userId);

                    // Update last seen in DB
                    try {
                        await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
                    } catch (err) {
                        console.error('Error updating lastSeen:', err);
                    }

                    io.emit('user:presence', { userId, status: 'offline', lastSeen: new Date() });
                    console.log(`User ${userId} went OFFLINE`);
                } else {
                    // console.log(`User ${userId} closed a tab (Remaining: ${userSockets.size})`);
                }
            }
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Helper to get online users for API
export const getOnlineUserIds = () => Array.from(onlineUsers.keys());

// Helper to check if specific user is online
export const isUserOnline = (userId) => onlineUsers.has(userId.toString());
