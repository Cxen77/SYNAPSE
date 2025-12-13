import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google users
    firebaseUid: { type: String, unique: true, sparse: true }, // Link to Firebase Auth
    profilePic: { type: String, default: '' },
    bannerPic: { type: String, default: '' },
    course: { type: String, default: '' },
    college: { type: String, default: '' },
    year: { type: String, default: '' },
    pushToken: { type: String, default: '' }, // FCM Token
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    socials: {
        github: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost' }],
    projects: [{
        title: String,
        desc: String,
        image: String,
        status: String,
        role: String,
        tags: [String],
        github: String,
        liveDemo: String
    }],
    settings: {
        privacy: {
            profileVisibility: { type: String, default: 'public' },
            allowMessages: { type: Boolean, default: true },
            allowTeamInvites: { type: Boolean, default: true },
            showOnlineStatus: { type: Boolean, default: true },
            showLastActive: { type: Boolean, default: true }
        },
        notifications: {
            emailNotifications: { type: Boolean, default: true },
            teamInvites: { type: Boolean, default: true },
            newMessages: { type: Boolean, default: true },
            eventReminders: { type: Boolean, default: true },
            mentions: { type: Boolean, default: true },
            pushNotifications: { type: Boolean, default: true }
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

// Methods
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
