import test from 'node:test';
import assert from 'node:assert/strict';
import { detachNativeDevice, nativeApp, postNativeMessage, registerNativeDevice } from './nativeBridge.js';

test('ordinary browser sessions never register a native device', async t => {
  const original = globalThis.window;
  globalThis.window = {};
  t.after(() => { if (original === undefined) delete globalThis.window; else globalThis.window = original; });
  assert.equal(nativeApp(), null);
  postNativeMessage({ type: 'session', userId: 'test-user' });
  assert.equal(await registerNativeDevice({ put: () => assert.fail('Not a native app') }, {}, 'test-user'), false);
});

test('logout waits for an active registration and cancels queued registrations before unregistering', async t => {
  const original = globalThis.window;
  globalThis.window = { ReactNativeWebView: { postMessage() {} }, SynapseNative: { version: 1, deviceId: 'device-1', userId: 'user-1' } };
  t.after(() => { if (original === undefined) delete globalThis.window; else globalThis.window = original; });
  const started = Promise.withResolvers();
  const finish = Promise.withResolvers();
  const calls = [];
  const api = {
    async put() { calls.push('register'); started.resolve(); await finish.promise; },
    async delete() { calls.push('unregister'); },
  };
  const first = registerNativeDevice(api, {}, 'user-1');
  await started.promise;
  const queued = registerNativeDevice(api, {}, 'user-1');
  const logout = detachNativeDevice(api);
  finish.resolve();
  assert.equal(await first, true);
  assert.equal(await queued, false);
  await logout;
  assert.deepEqual(calls, ['register', 'unregister']);
  assert.equal(window.SynapseNative.userId, null);
});
