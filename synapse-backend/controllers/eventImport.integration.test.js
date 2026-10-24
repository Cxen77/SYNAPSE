import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Session from '../models/Session.js';
import { authUser } from './authController.js';
import eventRoutes from '../routes/eventRoutes.js';

// Opt in: RUN_EVENT_IMPORT_INTEGRATION=1 node --test controllers/eventImport.integration.test.js
// Uses the real login handler, authentication middleware, routes and MongoDB.
// CAPTCHA/OAuth providers are outside this local test. No production DB is used.
test('live source imports persist through real authenticated routes and MongoDB reconnection', {
    skip: process.env.RUN_EVENT_IMPORT_INTEGRATION !== '1', timeout: 120000,
}, async () => {
    const databaseName = `synapse_import_qa_${randomUUID().replaceAll('-', '')}`;
    const uri = `mongodb://127.0.0.1:27017/${databaseName}`;
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = randomUUID();
    let server;
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        await Promise.all([User.init(), Event.init(), Session.init()]);
        const password = `QA-${randomUUID()}!`;
        const user = await User.create({ name: 'Import QA', username: 'import_qa', email: 'import-qa@example.invalid', password, isEmailVerified: true });
        const app = express();
        app.use(express.json());
        app.post('/api/v1/auth/login', authUser);
        app.use('/api/v1/events', eventRoutes);
        app.use((error, req, res, next) => res.status(res.statusCode >= 400 ? res.statusCode : 500).json({ message: error.message }));
        server = await new Promise(resolve => { const listening = app.listen(0, '127.0.0.1', () => resolve(listening)); });
        const base = `http://127.0.0.1:${server.address().port}/api/v1`;
        let token;
        async function post(path, body, authenticated = true) {
            const response = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
            return { status: response.status, body: await response.json(), headers: response.headers };
        }
        assert.equal((await post('/events/parse-external-link', { url: 'https://unstop.com/o/1760407' }, false)).status, 401);
        assert.equal((await post('/auth/login', { email: user.email, password: 'wrong-password' }, false)).status, 401);
        const login = await post('/auth/login', { email: user.email, password }, false);
        assert.equal(login.status, 200);
        assert.ok(login.body.accessToken);
        assert.match(login.headers.get('set-cookie'), /refreshToken=/);
        assert.equal(await Session.countDocuments({ userId: user._id, isActive: true }), 1);
        token = login.body.accessToken;

        for (const url of ['https://unstop.com/o/1760407', 'https://sasehack-2026.devpost.com/']) {
            const parsed = await post('/events/parse-external-link', { url });
            assert.equal(parsed.status, 200, JSON.stringify(parsed.body));
            const metadata = parsed.body.metadata;
            assert.ok(metadata.title && metadata.imageUrl && metadata.date && metadata.location);
            assert.ok(metadata.minTeamSize && metadata.maxTeamSize);
            assert.deepEqual(metadata.missingFields, []);
            assert.equal((await post('/events/import-external', { ...metadata, date: null })).status, 400);
            const imported = await post('/events/import-external', metadata);
            assert.equal(imported.status, 201, JSON.stringify(imported.body));
            const saved = await Event.findById(imported.body._id).lean();
            assert.equal(saved.imageUrl, metadata.imageUrl);
            assert.equal(saved.description, metadata.description);
            assert.equal(saved.date.toISOString(), metadata.date);
            assert.equal(String(saved.importedBy), String(user._id));
            assert.equal((await post('/events/import-external', metadata)).status, 409);
            const alias = metadata.platform === 'Unstop' ? 'https://unstop.com/hackathons/axion-hackathon-stampers-1760407?utm_source=share' : url;
            const duplicate = await post('/events/parse-external-link', { url: alias });
            assert.equal(duplicate.body.alreadyImported, true);
            console.log(`Verified real login, source extraction and persisted import: ${metadata.platform}`);
        }
        assert.equal(await Event.countDocuments(), 2);
        await mongoose.disconnect();
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        assert.equal(await Event.countDocuments(), 2, 'Events survive a fresh database connection');
        assert.equal(await Session.countDocuments({ userId: user._id }), 1);
    } finally {
        if (server) await new Promise(resolve => server.close(resolve));
        // Only remove the uniquely named QA database created by this test.
        if (mongoose.connection.readyState === 1 && mongoose.connection.name === databaseName && /^synapse_import_qa_[a-f0-9]{32}$/.test(databaseName)) await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
        if (originalSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = originalSecret;
    }
});
