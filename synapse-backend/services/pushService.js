import axios from 'axios';
import User from '../models/User.js';
import PushDevice from '../models/PushDevice.js';
import PushDelivery from '../models/PushDelivery.js';

export const validExpoToken = value => typeof value === 'string' && /^(?:Expo|Exponent)PushToken\[[A-Za-z0-9_-]{10,200}\]$/.test(value);
export const validDeviceId = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);

export function notificationPayload(notification) {
    const id = value => String(value?._id || value);
    const url = notification.event ? `/events/${id(notification.event)}` : notification.team ? `/teams/${id(notification.team)}` : '/';
    const defaults = { like: 'Someone liked your post.', comment: 'You have a new comment.', follow: 'Someone followed you.', invite: 'You have a new team invitation.', match: 'Your team match is ready.', join_request: 'Someone requested to join your team.', join_accepted: 'Your request to join was accepted.', join_rejected: 'Your team request was updated.' };
    return { title: 'Synapse', body: notification.message || defaults[notification.type] || 'You have a community update.', data: { url, notificationId: id(notification), type: notification.type } };
}

function pushAllowed(user, payload) {
    if (!user || user.isDeleted || user.isSuspended || user.settings?.notifications?.pushNotifications === false) return false;
    const preferences = user.settings?.notifications;
    if (payload.data?.type === 'MESSAGE' && preferences?.newMessages === false) return false;
    if (payload.data?.type === 'invite' && preferences?.teamInvites === false) return false;
    return true;
}

export async function queuePushNotification(userId, payload) {
    const user = await User.findById(userId).select('settings isDeleted isSuspended');
    if (!pushAllowed(user, payload)) return;
    const devices = await PushDevice.find({ user: userId }).lean();
    if (!devices.length) return;
    await PushDelivery.insertMany(devices.filter(device => validExpoToken(device.token)).map(device => ({ user: userId, token: device.token, ...payload })));
}

const headers = () => ({ 'Content-Type': 'application/json', ...(process.env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}) });
let running = false;
async function invalidToken(token) {
    await PushDevice.deleteMany({ token });
    await PushDelivery.updateMany({ token, status: { $in: ['pending', 'sending', 'receipt'] } }, { $set: { status: 'failed', error: 'DeviceNotRegistered' } });
}

async function retry(delivery, error) {
    await PushDelivery.updateOne({ _id: delivery._id }, { $set: {
        status: delivery.attempts >= 5 ? 'failed' : 'pending', error: error.slice(0, 300),
        nextAttemptAt: new Date(Date.now() + Math.min(3600000, 30000 * 2 ** delivery.attempts)),
    } });
}

export async function processPushQueue() {
    if (running) return;
    running = true;
    try {
        const now = new Date();
        // Recover leases after a worker restart instead of losing queued alerts.
        await PushDelivery.updateMany({ status: 'sending', updatedAt: { $lt: new Date(Date.now() - 300000) } }, { $set: { status: 'pending' } });
        const due = await PushDelivery.find({ status: 'pending', nextAttemptAt: { $lte: now }, attempts: { $lt: 5 } }).sort({ createdAt: 1 }).limit(100).lean();
        const claimed = [];
        for (const delivery of due) {
            const lease = await PushDelivery.findOneAndUpdate({ _id: delivery._id, status: 'pending' }, { $set: { status: 'sending' }, $inc: { attempts: 1 } }, { new: true }).lean();
            if (!lease) continue;
            // Logout, account switches and preferences can invalidate queued work.
            const [device, user] = await Promise.all([PushDevice.exists({ token: lease.token, user: lease.user }), User.findById(lease.user).select('isDeleted isSuspended settings').lean()]);
            if (!device || !pushAllowed(user, lease)) {
                await PushDelivery.updateOne({ _id: lease._id }, { $set: { status: 'failed', error: 'Device unregistered or notifications disabled' } });
            } else claimed.push(lease);
        }
        if (claimed.length) {
            try {
                const messages = claimed.map(delivery => ({ to: delivery.token, title: delivery.title, body: delivery.body, data: delivery.data, sound: 'default', channelId: 'community' }));
                const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, { headers: headers(), timeout: 10000 });
                const tickets = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
                for (const [index, delivery] of claimed.entries()) {
                    const ticket = tickets[index];
                    if (ticket?.status === 'ok' && ticket.id) await PushDelivery.updateOne({ _id: delivery._id }, { $set: { status: 'receipt', ticketId: ticket.id, nextAttemptAt: new Date(Date.now() + 15 * 60000) } });
                    else if (ticket?.details?.error === 'DeviceNotRegistered') await invalidToken(delivery.token);
                    else await retry(delivery, ticket?.details?.error || ticket?.message || 'Push service returned no ticket');
                }
            } catch (error) {
                for (const delivery of claimed) await retry(delivery, error.message);
            }
        }
        const receiptsDue = await PushDelivery.find({ status: 'receipt', nextAttemptAt: { $lte: now } }).limit(100).lean();
        if (receiptsDue.length) {
            const response = await axios.post('https://exp.host/--/api/v2/push/getReceipts', { ids: receiptsDue.map(delivery => delivery.ticketId) }, { headers: headers(), timeout: 10000 });
            for (const delivery of receiptsDue) {
                const receipt = response.data.data?.[delivery.ticketId];
                if (receipt?.details?.error === 'DeviceNotRegistered') await invalidToken(delivery.token);
                else if (receipt) await PushDelivery.updateOne({ _id: delivery._id }, { $set: { status: receipt.status === 'ok' ? 'delivered' : 'failed', error: receipt.message || '' } });
                else await PushDelivery.updateOne({ _id: delivery._id }, { $set: { status: Date.now() - delivery.createdAt.getTime() > 86400000 ? 'failed' : 'receipt', nextAttemptAt: new Date(Date.now() + 15 * 60000) } });
            }
        }
    } finally { running = false; }
}

export function startPushWorker() {
    const run = () => { void processPushQueue().catch(error => console.error('[Push worker]', error.message)); };
    run();
    const interval = setInterval(run, 30000);
    interval.unref();
    return () => clearInterval(interval);
}
