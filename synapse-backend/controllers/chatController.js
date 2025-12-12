import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { getIO } from '../socket/socketServer.js'; // Helper to get IO instance if needed later, or emit directly

// @desc    Get all chats for current user
// @route   GET /api/chat
// @access  Private
export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', 'name email profilePic status lastSeen')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Access or create a one-on-one chat
// @route   POST /api/chat
// @access  Private
export const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "UserId param not sent with request" });
    }

    try {
        let isChat = await Chat.find({
            participants: { $all: [req.user._id, userId] }
        })
            .populate("participants", "name email profilePic")
            .populate("lastMessage");

        isChat = await User.populate(isChat, {
            path: "lastMessage.senderId",
            select: "name profilePic email",
        });

        if (isChat.length > 0) {
            res.send(isChat[0]);
        } else {
            var chatData = {
                participants: [req.user._id, userId],
                unreadCounts: {
                    [req.user._id]: 0,
                    [userId]: 0
                }
            };

            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "participants",
                "name email profilePic"
            );
            res.status(200).send(fullChat);
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get chat history
// @route   GET /api/chat/history/:chatId
// @access  Private
export const getChatHistory = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { limit = 30, cursor } = req.query; // cursor can be a timestamp or _id

        const query = { chatId };
        if (cursor) {
            query.createdAt = { $lt: cursor };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 }) // Newest first for cursor pagination
            .limit(parseInt(limit))
            .populate('senderId', 'name profilePic');

        // Reverse to show oldest -> newest in UI
        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { chatId, text, attachments, recipientId } = req.body;
        const senderId = req.user._id;

        let chat;

        // Convert chatId "new" logic if needing to create a new chat by recipientId
        if (chatId === 'new' && recipientId) {
            // Check if chat exists
            chat = await Chat.findOne({
                participants: { $all: [senderId, recipientId] }
            });

            if (!chat) {
                chat = await Chat.create({
                    participants: [senderId, recipientId],
                    unreadCounts: {
                        [recipientId]: 0,
                        [senderId]: 0
                    }
                });
            }
        } else {
            chat = await Chat.findById(chatId);
            if (!chat) return res.status(404).json({ message: "Chat not found" });
        }

        const newMessage = await Message.create({
            chatId: chat._id,
            senderId,
            text,
            attachments,
            readBy: [senderId]
        });

        // Update Chat: lastMessage and increment unread count for OTHERS
        const updates = { lastMessage: newMessage._id, updatedAt: Date.now() };

        // Increment unread for all participants except sender
        chat.participants.forEach(p => {
            if (p.toString() !== senderId.toString()) {
                const currentUnread = chat.unreadCounts.get(p.toString()) || 0;
                chat.unreadCounts.set(p.toString(), currentUnread + 1);
            }
        });

        await chat.save(); // Save unread counts
        await Chat.findByIdAndUpdate(chat._id, { lastMessage: newMessage._id }); // Ensure atomic update if needed

        // Populate sender for frontend
        await newMessage.populate('senderId', 'name profilePic');

        res.status(201).json({ message: newMessage, chat });

        // Emit socket event to all participants
        const io = getIO();
        console.log(`[Socket] Emitting 'message:new' to chat room: chat:${chat._id}`);
        io.to(`chat:${chat._id}`).emit('message:new', newMessage);

        chat.participants.forEach(participantId => {
            console.log(`[Socket] Emitting 'message:new' to user room: user:${participantId.toString()}`);
            io.to(`user:${participantId.toString()}`).emit('message:new', newMessage);
        });
    } catch (error) {
        console.error("[SendMessage Error]", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark messages as read
// @route   POST /api/chat/read
// @access  Private
export const markRead = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user._id;

        // Update messages
        await Message.updateMany(
            { chatId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId } }
        );

        // Reset unread count for this user in the Chat model
        const chat = await Chat.findById(chatId);
        if (chat) {
            chat.unreadCounts.set(userId.toString(), 0);
            await chat.save();
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single chat by ID
// @route   GET /api/chat/:chatId
// @access  Private
export const getChatById = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId)
            .populate('participants', 'name email profilePic status lastSeen')
            .populate('lastMessage');

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Populate sender of lastMessage
        await User.populate(chat, {
            path: "lastMessage.senderId",
            select: "name profilePic email",
        });

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
