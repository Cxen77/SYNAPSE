import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { createOfflineCache } from './offlineCacheCore.mjs';
import { captureSnapshotScript, createBootstrapScript } from './snapshotScript.mjs';
import { canCachePage, externalUrl, isInternalUrl, isOnline, navigationAction, notificationUrl, parseBridgeMessage, siteOrigin } from './policy.mjs';

const origin = 'https://www.fuseon.in';

test('navigation, notification destinations and the bridge stay on the configured site', () => {
  assert.equal(siteOrigin(origin + '/events'), origin);
  assert.equal(siteOrigin('https://fuseon.in'), origin);
  assert.equal(isInternalUrl('https://fuseon.in/events', origin), true);
  assert.throws(() => siteOrigin('http://fuseon.in'));
  assert.equal(isInternalUrl('https://fuseon.in.evil.test/', origin), false);
  assert.equal(externalUrl('javascript:alert(1)'), null);
  assert.equal(externalUrl('intent://anything'), null);
  assert.equal(externalUrl('mailto:hello@example.com'), 'mailto:hello@example.com');
  assert.equal(notificationUrl({ url: 'https://evil.test' }, origin), origin + '/');
  assert.equal(notificationUrl({ url: '/events/123' }, origin), origin + '/events/123');
  assert.equal(parseBridgeMessage('{broken', origin, origin), null);
  assert.equal(parseBridgeMessage('{"version":1,"type":"session"}', 'https://evil.test', origin), null);
  assert.equal(parseBridgeMessage('{"version":1,"type":"session"}', origin, origin).type, 'session');
});

test('offline state distinguishes missing internet from unknown reachability', () => {
  assert.equal(isOnline({ isConnected: true, isInternetReachable: false }), false);
  assert.equal(isOnline({ isConnected: false }), false);
  assert.equal(isOnline({ isConnected: true }), true);
  assert.equal(canCachePage(origin + '/events/123', origin), true);
  for (const route of ['/login', '/settings', '/reset-password?token=secret', '/admin/users']) assert.equal(canCachePage(origin + route, origin), false);
});

test('CAPTCHA and media subframes stay embedded while external pages open in the browser', () => {
  assert.equal(navigationAction({ url: 'https://challenges.cloudflare.com/widget', isTopFrame: false }, origin), 'internal');
  assert.equal(navigationAction({ url: 'https://challenges.cloudflare.com/widget' }, origin), 'internal');
  assert.equal(navigationAction({ url: 'https://www.youtube.com/embed/demo' }, origin), 'internal');
  assert.equal(navigationAction({ url: 'https://unstop.com/o/123', isTopFrame: true }, origin), 'external');
  assert.equal(navigationAction({ url: 'https://evil.test', isTopFrame: true }, origin), 'external');
  assert.equal(navigationAction({ url: 'file:///private/file', isTopFrame: true }, origin), 'block');
  assert.equal(navigationAction({ url: 'javascript:alert(1)', isTopFrame: false }, origin), 'block');
});

test('snapshot captures rendered content while excluding forms, credentials, scripts and live navigation', () => {
  const dom = new JSDOM(`<html><head><title>Events</title><style>body{background:url(https://cdn.test/bg.png);color:blue}</style></head><body><form><input value="secret"><img src="https://cdn.test/form.png"></form><article><h1>Campus Hackathon</h1><p>Saved event description</p><img src="https://cdn.test/banner.png" onerror="steal()"><a href="https://outside.test">Register</a><button onclick="save()">Join</button></article><script>const password='hidden-token'</script><iframe src="https://outside.test"></iframe></body></html>`, { url: origin + '/events', runScripts: 'outside-only' });
  for (const image of dom.window.document.images) {
    Object.defineProperty(image, 'complete', { value: true });
    Object.defineProperty(image, 'naturalWidth', { value: 1200 });
  }
  let message;
  dom.window.ReactNativeWebView = { postMessage: raw => { message = JSON.parse(raw); } };
  dom.window.eval(createBootstrapScript('test-device'));
  dom.window.SynapseNative.userId = 'user-1';
  dom.window.eval(captureSnapshotScript);
  assert.match(message.html, /Campus Hackathon/);
  assert.match(message.html, /Content-Security-Policy/);
  assert.doesNotMatch(message.html, /secret|hidden-token|<script|<iframe|onerror=|onclick=|href=|background:\s*url/);
  assert.deepEqual(message.assets.map(asset => asset.url), ['https://cdn.test/banner.png']);
  assert.equal(message.userId, 'user-1');
  dom.window.close();
});

function fileStore(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'synapse-offline-qa-'));
  const resolve = parts => path.resolve(...parts.map(part => typeof part === 'object' ? part.diskPath : part.startsWith('file:') ? fileURLToPath(part) : part));
  const verify = target => assert.ok(target.startsWith(root + path.sep), 'Only disposable QA files can be removed');
  class File {
    constructor(...parts) { this.diskPath = resolve(parts); this.uri = pathToFileURL(this.diskPath).href; }
    get exists() { return fs.existsSync(this.diskPath); }
    write(content) { fs.writeFileSync(this.diskPath, content); }
    delete() { verify(this.diskPath); fs.rmSync(this.diskPath, { force: true }); }
  }
  class Directory extends File {
    constructor(...parts) { super(...parts); this.uri += '/'; }
    create() { fs.mkdirSync(this.diskPath, { recursive: true }); }
    list() { return fs.readdirSync(this.diskPath, { withFileTypes: true }).map(entry => entry.isDirectory() ? new Directory(this, entry.name) : new File(this, entry.name)); }
    delete() { verify(this.diskPath); fs.rmSync(this.diskPath, { recursive: true, force: true }); }
  }
  const storagePath = path.join(root, 'metadata.json');
  const AsyncStorage = {
    async getItem() { return fs.existsSync(storagePath) ? fs.readFileSync(storagePath, 'utf8') : null; },
    async setItem(key, value) { fs.writeFileSync(storagePath, value); },
    async removeItem() { fs.rmSync(storagePath, { force: true }); },
  };
  t.after(() => { assert.match(path.basename(root), /^synapse-offline-qa-/); assert.equal(path.dirname(root), os.tmpdir()); fs.rmSync(root, { recursive: true, force: true }); });
  return { Directory, File, Paths: { document: root }, AsyncStorage };
}

const snapshot = { html: '<p>Saved community content</p><img src="SYNAPSE_OFFLINE_IMAGE_0">', url: origin + '/events', title: 'Events', userId: 'user-1', assets: [{ marker: 'SYNAPSE_OFFLINE_IMAGE_0', url: 'https://cdn.test/banner.png' }] };

test('saved text and downloaded images survive a fresh cache instance without the network', async t => {
  const store = fileStore(t);
  const cache = createOfflineCache({ ...store, fetcher: async () => new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'image/png', 'Content-Length': '3' } }) });
  const saved = await cache.savePage(snapshot, origin);
  const html = fs.readFileSync(fileURLToPath(saved.uri), 'utf8');
  assert.match(html, /Saved community content/);
  assert.match(html, /file:.*image-0/);
  const restarted = createOfflineCache({ ...store, fetcher: () => assert.fail('Offline startup must not fetch') });
  assert.equal((await restarted.readSavedPage()).uri, saved.uri);
  await restarted.clearSavedPages();
  assert.equal(await restarted.readSavedPage(), null);
});

test('text is available before images finish and logout cancels stale downloads', async t => {
  const store = fileStore(t);
  let started;
  const downloading = new Promise(resolve => { started = resolve; });
  const cache = createOfflineCache({ ...store, fetcher: (url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('Aborted')));
    started();
  }) });
  const saving = cache.savePage(snapshot, origin);
  await downloading;
  const early = await cache.readSavedPage();
  assert.match(fs.readFileSync(fileURLToPath(early.uri), 'utf8'), /Saved community content/);
  await cache.clearSavedPages();
  assert.equal(await saving, null);
  assert.equal(await cache.readSavedPage(), null);
});

test('oversized and non-image responses cannot enter the offline asset cache', async t => {
  const store = fileStore(t);
  const cache = createOfflineCache({ ...store, fetcher: async () => ({ ok: true, headers: new Headers({ 'Content-Type': 'text/html', 'Content-Length': '99999999' }), arrayBuffer: () => assert.fail('Do not read invalid assets') }) });
  const saved = await cache.savePage(snapshot, origin);
  assert.doesNotMatch(fs.readFileSync(fileURLToPath(saved.uri), 'utf8'), /SYNAPSE_OFFLINE_IMAGE|cdn\.test/);
});
