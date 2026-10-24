import test from 'node:test';
import assert from 'node:assert/strict';
import Event from '../models/Event.js';
import { importExternalEvent } from './eventController.js';

async function invoke(body) {
    const result = { status: 200 };
    const res = { status(code) { result.status = code; return this; }, json(data) { result.data = data; return this; } };
    await importExternalEvent({ body, user: { _id: 'user-1' } }, res, error => { result.error = error; });
    return result;
}
const valid = { title: 'Real workshop', description: 'Source description', date: '2026-12-10', location: 'Source venue', category: 'Workshop', externalUrl: 'https://example.com/Event/AbC?utm_source=share', imageUrl: 'https://example.com/real-banner.png', maxTeamSize: 4, minTeamSize: 1 };

test('incomplete imports are rejected without inventing event fields', async () => {
    for (const field of ['title', 'description', 'date', 'location', 'category', 'maxTeamSize']) {
        const result = await invoke({ ...valid, [field]: '' });
        assert.equal(result.status, 400, field);
        assert.ok(result.error, field);
    }
    assert.equal((await invoke({ ...valid, date: 'not-a-date' })).status, 400);
    assert.equal((await invoke({ ...valid, minTeamSize: 5 })).status, 400);
});

test('imports save reviewed source details and original image, without defaults', async t => {
    let saved;
    t.mock.method(Event, 'findOne', () => ({ populate: () => ({ lean: async () => null }) }));
    t.mock.method(Event, 'create', async data => { saved = data; return { ...data, populate: async () => {} }; });
    const result = await invoke(valid);
    assert.equal(result.status, 201);
    assert.equal(result.error, undefined);
    assert.equal(saved.title, valid.title);
    assert.equal(saved.description, valid.description);
    assert.equal(saved.imageUrl, valid.imageUrl);
    assert.equal(saved.date.toISOString(), '2026-12-10T00:00:00.000Z');
    assert.equal(saved.externalUrl, 'https://example.com/Event/AbC');
    assert.equal(saved.location, valid.location);
});

test('existing external event returns conflict instead of creating another', async t => {
    const existing = { _id: 'existing-event' };
    t.mock.method(Event, 'findOne', () => ({ populate: () => ({ lean: async () => existing }) }));
    t.mock.method(Event, 'create', () => assert.fail('Must not create a duplicate'));
    const result = await invoke(valid);
    assert.equal(result.status, 409);
    assert.equal(result.data.event, existing);
});
