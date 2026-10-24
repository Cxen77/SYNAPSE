import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import express from 'express';
import axios from 'axios';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import PushDevice from '../models/PushDevice.js';
import PushDelivery from '../models/PushDelivery.js';
import Session from '../models/Session.js';
import { logoutUser, logoutAllSessions } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import notificationRoutes from '../routes/notificationRoutes.js';
import { generateAccessToken, hashRefreshToken } from '../utils/generateToken.js';
import { processPushQueue, queuePushNotification } from './pushService.js';

test('native push registration, queue, receipts and logout use real authenticated routes and MongoDB', {
    skip: process.env.RUN_PUSH_INTEGRATION !== '1', timeout: 60000,
}, async t => {
    const databaseName = `synapse_push_qa_${randomUUID().replaceAll('-', '')}`;
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = randomUUID();
    let server;
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/${databaseName}`, { serverSelectionTimeoutMS: 5000 });
        await Promise.all([User.init(), PushDevice.init(), PushDelivery.init(), Session.init()]);
        const [first, second] = await User.create([
            { name: 'First QA', username: 'first_qa', email: 'first@example.invalid', isEmailVerified: true },
            { name: 'Second QA', username: 'second_qa', email: 'second@example.invalid', isEmailVerified: true },
        ]);
        const app = express();
        app.use(express.json()); app.use(cookieParser()); app.use('/notifications', notificationRoutes);
        app.post('/logout', logoutUser);
        app.post('/logout-all', protect, logoutAllSessions);
        app.use((error, req, res, next) => res.status(res.statusCode >= 400 ? res.statusCode : 500).json({ message: error.message }));
        server = await new Promise(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
        const base = `http://127.0.0.1:${server.address().port}/notifications/devices`;
        const deviceId = randomUUID();
        const token = 'ExpoPushToken[abcdefghijklmnopqrstuv]';
        const nextToken = 'ExpoPushToken[zyxwvutsrqponmlkjihgfe]';
        const auth = user => generateAccessToken(user._id);
        const register = async (user, body = { deviceId, token, platform: 'android' }, method = 'PUT') => fetch(base, { method, headers: { 'Content-Type': 'application/json', ...(user ? { Authorization: `Bearer ${auth(user)}` } : {}) }, body: JSON.stringify(body) });
        assert.equal((await register(null)).status, 401);
        assert.equal((await register(first, { deviceId, token: 'invalid', platform: 'android' })).status, 400);
        assert.equal((await register(first)).status, 200);
        assert.equal((await register(first)).status, 200);
        assert.equal(await PushDevice.countDocuments(), 1);

        let sent = [];
        t.mock.method(axios, 'post', async (url, payload) => {
            if (url.endsWith('/send')) {
                sent.push(...payload);
                return { data: { data: payload.map((_, i) => ({ status: 'ok', id: `ticket-${i}` })) } };
            }
            assert.ok(url.endsWith('/getReceipts'));
            return { data: { data: Object.fromEntries(payload.ids.map(id => [id, { status: 'ok' }])) } };
        });
        await Notification.create({ recipient: first._id, sender: second._id, type: 'invite', message: 'Join the QA team', team: new mongoose.Types.ObjectId() });
        assert.equal(await PushDelivery.countDocuments({ status: 'pending' }), 1, 'Existing notification creation queues a native alert');
        await processPushQueue();
        assert.equal(sent.length, 1);
        assert.equal(sent[0].channelId, 'community');
        assert.equal(sent[0].body, 'Join the QA team');
        assert.match(sent[0].data.url, /^\/teams\//);
        assert.equal(await PushDelivery.countDocuments({ status: 'receipt' }), 1);
        await PushDelivery.updateMany({ status: 'receipt' }, { $set: { nextAttemptAt: new Date(0) } });
        await processPushQueue();
        assert.equal(await PushDelivery.countDocuments({ status: 'delivered' }), 1);

        await register(first, { deviceId, token: nextToken, platform: 'ios' });
        assert.equal(await PushDevice.countDocuments(), 1, 'Rotating a token removes the old token');
        await queuePushNotification(first._id, { title: 'Pending update', body: 'Must not cross accounts', data: { url: '/' } });
        await register(second, { deviceId, token: nextToken, platform: 'ios' });
        const before = sent.length;
        await processPushQueue();
        assert.equal(sent.length, before, 'An account switch invalidates queued alerts for the previous user');
        await register(first, { deviceId }, 'DELETE');
        assert.equal(await PushDevice.countDocuments({ user: second._id }), 1, 'Users cannot unregister another account’s device');

        await User.updateOne({ _id: second._id }, { $set: { 'settings.notifications.pushNotifications': false } });
        await queuePushNotification(second._id, { title: 'Disabled', body: 'Do not queue', data: {} });
        assert.equal(await PushDelivery.countDocuments({ title: 'Disabled' }), 0);
        await User.updateOne({ _id: second._id }, { $set: { 'settings.notifications.pushNotifications': true } });
        await queuePushNotification(second._id, { title: 'Retry', body: 'Network retry', data: {} });
        t.mock.method(axios, 'post', async () => { throw new Error('Test network interruption'); });
        await processPushQueue();
        assert.equal(await PushDelivery.countDocuments({ title: 'Retry', status: 'pending', attempts: 1 }), 1);
        await PushDelivery.updateMany({ title: 'Retry' }, { $set: { nextAttemptAt: new Date(0) } });
        t.mock.method(axios, 'post', async () => ({ data: { data: [{ status: 'error', details: { error: 'DeviceNotRegistered' } }] } }));
        await processPushQueue();
        assert.equal(await PushDevice.countDocuments(), 0);
        assert.equal(await PushDelivery.countDocuments({ title: 'Retry', status: 'failed' }), 1);
        await register(second);
        assert.equal((await register(second, { deviceId }, 'DELETE')).status, 200);
        assert.equal(await PushDevice.countDocuments(), 0, 'Logout removes the current installation');
        await register(second);
        const refresh = randomUUID();
        await Session.create({ userId: second._id, refreshTokenHash: hashRefreshToken(refresh), expiresAt: new Date(Date.now() + 60000) });
        const authBase = `http://127.0.0.1:${server.address().port}`;
        const logout = await fetch(authBase + '/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: `refreshToken=${refresh}` }, body: JSON.stringify({ deviceId }) });
        assert.equal(logout.status, 200);
        assert.equal(await PushDevice.countDocuments(), 0, 'Cookie-based logout also unregisters its installation');
        await register(second);
        await register(second, { deviceId: randomUUID(), token: nextToken, platform: 'ios' });
        assert.equal(await PushDevice.countDocuments(), 2);
        const logoutAll = await fetch(authBase + '/logout-all', { method: 'POST', headers: { Authorization: `Bearer ${auth(second)}` } });
        assert.equal(logoutAll.status, 200);
        assert.equal(await PushDevice.countDocuments(), 0, 'Log out everywhere unregisters all of the account’s devices');
    } finally {
        if (server) await new Promise(resolve => server.close(resolve));
        if (mongoose.connection.readyState === 1 && mongoose.connection.name === databaseName && /^synapse_push_qa_[a-f0-9]{32}$/.test(databaseName)) await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        if (originalSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = originalSecret;
    }
});
