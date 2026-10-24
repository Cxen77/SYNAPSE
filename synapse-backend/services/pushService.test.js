import test from 'node:test';
import assert from 'node:assert/strict';
import { notificationPayload, validDeviceId, validExpoToken } from './pushService.js';

test('only Expo tokens and UUID installation IDs can be registered', () => {
    assert.equal(validExpoToken('ExponentPushToken[abcdefghijklmnopqrstuv]'), true);
    assert.equal(validExpoToken('ExpoPushToken[abcdefghijklmnopqrstuv]'), true);
    assert.equal(validExpoToken('random-fcm-token'), false);
    assert.equal(validExpoToken('ExpoPushToken[<script>]'), false);
    assert.equal(validDeviceId('f169bed1-bd67-4b4c-9a1b-7933cd27a910'), true);
    assert.equal(validDeviceId('-'.repeat(36)), false);
});

test('notification payloads point to existing site routes', () => {
    const payload = notificationPayload({ _id: 'notification-1', type: 'invite', team: 'team-1', message: 'Join our team' });
    assert.equal(payload.data.url, '/teams/team-1');
    assert.equal(payload.body, 'Join our team');
    assert.equal(notificationPayload({ _id: 'n', type: 'like' }).data.url, '/');
    assert.equal(notificationPayload({ _id: 'n', type: 'join', event: 'e' }).data.url, '/events/e');
});
