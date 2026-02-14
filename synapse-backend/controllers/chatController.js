import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { getIO, isUserOnline } from '../socket/socketServer.js';
import { admin } from '../config/firebaseAdmin.js';

// @desc    Get all chats for current user
// @route   GET /api/chat
// @access  Private
export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate('participants', 'name email profilePic status lastSeen')
            .populate('lastMessage')
            .populate('groupAdmin', 'name profilePic')
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
        const { limit = 30, cursor } = req.query;

        // SECURITY: Verify requester is a participant
        const chat = await Chat.findById(chatId).select('participants').lean();
        if (!chat || !chat.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        const cappedLimit = Math.min(parseInt(limit) || 30, 100);

        const query = { chatId };
        if (cursor) {
            query.createdAt = { $lt: cursor };
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(cappedLimit)
            .populate('senderId', 'name profilePic');

        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
    const { chatId, text, attachments } = req.body;

    if (!chatId || !text) {
        return res.status(400).json({ message: "Invalid data passed into request" });
    }

    try {
        // SECURITY: Verify sender is a participant
        const targetChat = await Chat.findById(chatId).select('participants').lean();
        if (!targetChat || !targetChat.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        let message = await Message.create({
            senderId: req.user._id,
            text,
            chatId,
            attachments: attachments || [],
            readBy: [req.user._id]
        });

        // Populate sender info for immediate UI update
        message = await message.populate("senderId", "name profilePic");
        message = await message.populate("chatId");

        // Populate participants in the chat object inside message
        message = await User.populate(message, {
            path: "chatId.participants",
            select: "name profilePic email status pushToken",
        });

        // Verify chat exists and update lastMessage
        // KEY CHANGE: Revive chat for anyone who "deleted" it
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: message,
            $set: { deletedBy: [] } // Simple revive for everyone
        });

        // Update Chat: lastMessage and increment unread count for OTHERS
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Increment unread for all participants except sender
        chat.participants.forEach(p => {
            if (p.toString() !== req.user._id.toString()) {
                const currentUnread = chat.unreadCounts.get(p.toString()) || 0;
                chat.unreadCounts.set(p.toString(), currentUnread + 1);
            }
        });
        await chat.save(); // Save unread counts

        res.status(201).json({ message });

        // Emit socket event to all participants
        const io = getIO();
        io.to(`chat:${chat._id}`).emit('message:new', message);

        chat.participants.forEach(async (participantId) => {
            const partIdStr = participantId.toString();

            // Emit to User Room (for In-App Toasts)
            // Skip sender to avoid self-toast (handled on frontend too, but good for bandwidth)
            if (partIdStr !== req.user._id.toString()) {
                io.to(`user:${partIdStr}`).emit('message:new', message);
            }

            // PUSH NOTIFICATION LOGIC
            if (partIdStr !== req.user._id.toString()) {
                const isOnline = isUserOnline(partIdStr);

                // Fetch full participant to get pushToken
                // We could have populated it in the loop above or fetched here
                // Optimization: fetch token only if offline
                if (!isOnline) {
                    try {
                        const user = await User.findById(participantId).select('pushToken name');
                        if (user && user.pushToken) {
                            await admin.messaging().send({
                                token: user.pushToken,
                                notification: {
                                    title: req.user.name,
                                    body: text.length > 50 ? text.substring(0, 50) + "..." : text,
                                },
                                data: {
                                    type: 'MESSAGE',
                                    chatId: chat._id.toString(),
                                    senderId: req.user._id.toString()
                                }
                            });
                        }
                    } catch (pushErr) {
                        console.error(`[Push Error] Failed to send to user ${partIdStr}:`, pushErr.message);
                    }
                }
            }
        });

    } catch (error) {
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

        // SECURITY: Verify requester is a participant
        if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        await User.populate(chat, {
            path: "lastMessage.senderId",
            select: "name profilePic email",
        });

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Create Group Chat
// @route   POST /api/chat/group
// @access  Private
export const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please fill all the fields" });
    }

    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
        return res
            .status(400)
            .send("More than 2 users are required to form a group chat");
    }

    // Ensure we only store IDs and unique ones
    const adminId = req.user._id.toString();
    const uniqueUsers = [...new Set([...users, adminId])];

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: uniqueUsers,
            isGroupChat: true,
            groupAdmin: req.user._id,
            participants: uniqueUsers,
            unreadCounts: uniqueUsers.reduce((acc, userId) => ({ ...acc, [userId]: 0 }), {})
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("participants", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

// @desc    Rename Group
// @route   PUT /api/chat/rename
// @access  Private
export const renameGroup = async (req, res) => {
    const { chatId, chatName } = req.body;

    // SECURITY: Verify requester is group admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
    }
    if (!chat.groupAdmin || chat.groupAdmin.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only group admin can rename the group' });
    }

    chat.chatName = chatName;
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
        .populate("participants", "-password")
        .populate("groupAdmin", "-password");

    res.json(updatedChat);
};

// @desc    Add user to Group
// @route   PUT /api/chat/groupadd
// @access  Private
export const addToGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    // SECURITY: Verify requester is group admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
    }
    if (!chat.groupAdmin || chat.groupAdmin.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only group admin can add members' });
    }

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { participants: userId } },
        { new: true }
    )
        .populate("participants", "-password")
        .populate("groupAdmin", "-password");

    res.json(added);
};

// @desc    Remove user from Group
// @route   PUT /api/chat/groupremove
// @access  Private
export const removeFromGroup = async (req, res) => {
    const { chatId, userId } = req.body;

    // SECURITY: Verify requester is group admin
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ message: "Chat Not Found" });
    }
    if (!chat.groupAdmin || chat.groupAdmin.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only group admin can remove members' });
    }

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull: { participants: userId },
            $unset: { [`unreadCounts.${userId}`]: "" }
        },
        { new: true }
    )
        .populate("participants", "-password")
        .populate("groupAdmin", "-password");

    res.json(removed);
};


// @desc    Leave Group (User removes self)
// @route   PUT /api/chat/leave
// @access  Private
export const leaveGroup = async (req, res) => {
    const { chatId } = req.body;

    // remove self from participants
    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { participants: req.user._id } },
        { new: true }
    );

    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    }

    res.json({ message: "Left Group Successfully", chatId });
};

// @desc    Delete Chat (Hide from user)
// @route   PUT /api/chat/delete
// @access  Private
export const deleteChat = async (req, res) => {
    const { chatId } = req.body;

    const hidden = await Chat.findByIdAndUpdate(
        chatId,
        { $addToSet: { deletedBy: req.user._id } },
        { new: true }
    );

    if (!hidden) {
        res.status(404);
        throw new Error("Chat Not Found");
    }

    res.json({ message: "Chat Deleted (Hidden)", chatId });
};
