import mongoose from 'mongoose';

const teamSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    invites: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

// Indexes for performance
teamSchema.index({ members: 1 });
teamSchema.index({ admins: 1 });
teamSchema.index({ createdBy: 1 });

const Team = mongoose.model('Team', teamSchema);

export default Team;
