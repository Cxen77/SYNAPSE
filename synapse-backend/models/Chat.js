import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    // Track unread counts per user for efficiency
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    }
}, {
    timestamps: true
});

// Index for fetching user chats quickly
chatSchema.index({ participants: 1, updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
