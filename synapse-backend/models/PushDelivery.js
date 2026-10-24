import mongoose from 'mongoose';

const schema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true },
    title: { type: String, required: true }, body: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['pending', 'sending', 'receipt', 'delivered', 'failed'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    ticketId: String, error: String,
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 86400000) },
}, { timestamps: true });
schema.index({ status: 1, nextAttemptAt: 1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model('PushDelivery', schema);
