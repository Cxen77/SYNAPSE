import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for performance
postSchema.index({ user: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ likes: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
