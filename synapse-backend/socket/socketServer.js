import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SystemSettings from '../models/SystemSettings.js';

let io;
const onlineUsers = new Map(); // userId -> Set<socketId>
const typingTimeouts = new Map(); // `${userId}:${chatId}` -> timeoutId

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
                return next(new Error('Authentication error: No token provided'));
            }

            // Verify Custom JWT (matches authMiddleware)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Fetch full user from Mongo
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                return next(new Error('User not found in database'));
            }
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
        } else {
            // console.log(`User ${userId} connected another tab (Active: ${userSockets.size})`);
        }

        // Handle joining a chat room — SECURITY: verify membership
        socket.on('join:conversation', async (conversationId) => {
            if (!socket.mongoUser || !conversationId) return;
            try {
                const Chat = (await import('../models/Chat.js')).default;
                const isMember = await Chat.exists({
                    _id: conversationId,
                    participants: socket.mongoUser._id
                });
                if (!isMember) {
                    socket.emit('error', { message: 'Not a member of this chat' });
                    return;
                }
                socket.join(conversationId);
            } catch (err) {
                console.error('[Socket] join:conversation error:', err.message);
            }
        });

        // Handle leaving a chat room
        socket.on('leave:conversation', (conversationId) => {
            socket.leave(conversationId);
        });

        // Handle typing:start
        socket.on('typing:start', ({ conversationId }) => {
            if (!conversationId) return;
            const timeoutKey = `${userId}:${conversationId}`;
            
            // Clear existing timeout if any
            if (typingTimeouts.has(timeoutKey)) {
                clearTimeout(typingTimeouts.get(timeoutKey));
            }
            
            // Broadcast to chat room
            socket.to(conversationId).emit('typing:start', { userId: socket.mongoUser._id.toString() });
            
            // Set auto-timeout for 3 seconds
            const timeoutId = setTimeout(() => {
                socket.to(conversationId).emit('typing:stop', { userId: socket.mongoUser._id.toString() });
                typingTimeouts.delete(timeoutKey);
            }, 3000);
            
            typingTimeouts.set(timeoutKey, timeoutId);
        });

        // Handle typing:stop
        socket.on('typing:stop', ({ conversationId }) => {
            if (!conversationId) return;
            const timeoutKey = `${userId}:${conversationId}`;
            
            if (typingTimeouts.has(timeoutKey)) {
                clearTimeout(typingTimeouts.get(timeoutKey));
                typingTimeouts.delete(timeoutKey);
            }
            
            socket.to(conversationId).emit('typing:stop', { userId: socket.mongoUser._id.toString() });
        });

        // Handle message:send natively over sockets
        socket.on('message:send', async ({ conversationId, text, attachments }) => {
            if (!text || !socket.mongoUser || !conversationId) return;
            try {
                const Chat = (await import('../models/Chat.js')).default;
                const Message = (await import('../models/Message.js')).default;
                const User = (await import('../models/User.js')).default;

                const isMember = await Chat.exists({
                    _id: conversationId,
                    participants: socket.mongoUser._id
                });

                if (!isMember) return;

                let message = await Message.create({
                    senderId: socket.mongoUser._id, // Match Synapse schema mapping
                    chatId: conversationId,         // Match Synapse schema mapping
                    text,
                    attachments: attachments || [],
                    readBy: [socket.mongoUser._id]
                });

                // Populate dependencies for UI rendering on the receiver's end
                message = await message.populate('senderId', 'name profilePic');
                message = await message.populate('chatId');
                message = await User.populate(message, {
                    path: 'chatId.participants',
                    select: 'name profilePic email status pushToken',
                });

                // Store in Chat Model natively
                await Chat.findByIdAndUpdate(conversationId, {
                    lastMessage: message._id,
                    $set: { deletedBy: [] } // Revive if hidden
                });

                // Broadcast directly
                io.to(conversationId).emit('message:new', message);
            } catch (err) {
                console.error('[Socket] message:send error:', err);
            }
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
