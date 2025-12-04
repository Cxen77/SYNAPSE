import mongoose from 'mongoose';

const forumPostSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes
forumPostSchema.index({ forum: 1, createdAt: -1 });
forumPostSchema.index({ author: 1 });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

export default ForumPost;
