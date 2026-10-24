import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'follow', 'invite', 'join', 'match', 'join_request', 'join_accepted', 'join_rejected', 'ownership_transfer'], required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    message: { type: String },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

notificationSchema.pre('save', function () { this.$locals.createdForPush = this.isNew; });
notificationSchema.post('save', async function (notification) {
    if (!this.$locals.createdForPush) return;
    try {
        const { notificationPayload, queuePushNotification } = await import('../services/pushService.js');
        await queuePushNotification(notification.recipient, notificationPayload(notification));
    } catch (error) { console.error('[Push queue]', error.message); }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
