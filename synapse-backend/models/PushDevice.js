import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['android', 'ios'], required: true },
    lastSeenAt: { type: Date, default: Date.now },
}, { timestamps: true });
export default mongoose.model('PushDevice', schema);
