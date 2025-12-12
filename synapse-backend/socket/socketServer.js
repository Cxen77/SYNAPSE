import { Server } from 'socket.io';
import { admin } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

let io;
const onlineUsers = new Map(); // userId -> socketId (or Set of socketIds if multiple devices)

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Middleware for Auth
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decodedToken = await admin.auth().verifyIdToken(token);
            socket.user = decodedToken; // { uid, email, etc. }

            // Fetch full user from Mongo to get _id
            const user = await User.findOne({ firebaseUid: decodedToken.uid });
            if (!user) {
                return next(new Error('User not found in database'));
            }
            socket.mongoUser = user;

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

        // Mark online
        onlineUsers.set(userId, {
            ...onlineUsers.get(userId),
            status: 'online',
            lastSeen: new Date()
        });

        // Broadcast presence
        io.emit('user:presence', { userId, status: 'online' });

        // Handle joining a chat room
        socket.on('join:chat', (chatId) => {
            socket.join(`chat:${chatId}`);
            // Could mark read here if window is focused
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
            // Update last seen in DB
            await User.findByIdAndUpdate(userId, { lastSeen: new Date() });

            onlineUsers.delete(userId);
            io.emit('user:presence', { userId, status: 'offline', lastSeen: new Date() });
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
