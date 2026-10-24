import { MAX_IMAGE_BYTES, MAX_IMAGES, MAX_SNAPSHOT_BYTES, SNAPSHOT_VERSION, canCachePage, escapeHtml } from './policy.mjs';

export function createOfflineCache({Directory, File, Paths, AsyncStorage, fetcher = fetch}) {
const KEY = '@synapse/offline-page-v1';
const directory = () => new Directory(Paths.document, 'offline-pages-v1');
let revision = 0;
let snapshotId = 0;
let pending = Promise.resolve();
const requests = new Set();
async function readSavedPage() {
    try {
        const value = JSON.parse(await AsyncStorage.getItem(KEY) || 'null');
        if (!value || value.version !== SNAPSHOT_VERSION || !value.uri.startsWith(directory().uri.replace(/\/+$/, '') + '/') || !new File(value.uri).exists)
            return null;
        return value;
    }
    catch {
        return null;
    }
}
async function clearSavedPages() {
    revision += 1;
    await AsyncStorage.removeItem(KEY);
    for (const request of requests)
        request.abort();
    await pending.catch(() => { });
    const root = directory();
    if (root.exists)
        root.delete();
}
function savePage(snapshot, origin) {
    const currentRevision = revision;
    const task = async () => {
        if (currentRevision !== revision || !canCachePage(snapshot.url, origin) || snapshot.html.length > MAX_SNAPSHOT_BYTES)
            return null;
        const root = directory();
        root.create({ intermediates: true, idempotent: true });
        const folder = new Directory(root, `page-${Date.now()}-${++snapshotId}`);
        folder.create({ intermediates: true });
        const file = new File(folder, 'index.html');
        const assets = (snapshot.assets || []).slice(0, MAX_IMAGES).filter(asset => /^https:\/\//.test(asset.url) && /^SYNAPSE_OFFLINE_IMAGE_\d+$/.test(asset.marker));
        const saved = { version: SNAPSHOT_VERSION, uri: file.uri, url: snapshot.url, title: snapshot.title, savedAt: new Date().toISOString(), userId: snapshot.userId };
        // Save text immediately, before the network can disappear during downloads.
        file.write(snapshot.html.replace(/SYNAPSE_OFFLINE_IMAGE_\d+/g, ''));
        await AsyncStorage.setItem(KEY, JSON.stringify(saved));
        let totalBytes = 0;
        let nextAsset = 0;
        const replacements = new Map();
        const download = async () => {
            const index = nextAsset++;
            const asset = assets[index];
            if (!asset || currentRevision !== revision)
                return;
            let local = '';
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            requests.add(controller);
            try {
                const response = await fetcher(asset.url, { signal: controller.signal, credentials: 'omit' });
                const mime = response.headers.get('content-type') || '';
                const length = Number(response.headers.get('content-length'));
                if (response.ok && /^image\/(png|jpeg|webp|gif|avif)(?:;|$)/i.test(mime) && length > 0 && length <= MAX_IMAGE_BYTES && totalBytes + length <= 8_000_000) {
                    totalBytes += length;
                    const bytes = new Uint8Array(await response.arrayBuffer());
                    if (bytes.byteLength <= MAX_IMAGE_BYTES) {
                        const image = new File(folder, `image-${index}`);
                        image.write(bytes);
                        local = escapeHtml(image.uri);
                    }
                }
            }
            catch { /* Preserve the page even if a CDN is offline. */ }
            finally {
                clearTimeout(timeout);
                requests.delete(controller);
            }
            replacements.set(asset.marker, local);
            await download();
        };
        await Promise.all(Array.from({ length: Math.min(4, assets.length) }, download));
        if (currentRevision !== revision) {
            folder.delete();
            return null;
        }
        let html = snapshot.html;
        for (const [marker, local] of replacements)
            html = html.split(`"${marker}"`).join(`"${local}"`);
        html = html.replace(/SYNAPSE_OFFLINE_IMAGE_\d+/g, '');
        file.write(html);
        await AsyncStorage.setItem(KEY, JSON.stringify(saved));
        // Publish the complete new snapshot before removing the old one.
        for (const entry of root.list())
            if (entry.uri !== folder.uri)
                entry.delete();
        return saved;
    };
    const result = pending.then(task, task);
    pending = result;
    return result;
}
const offlineReadDirectory = () => directory().uri;

return {readSavedPage, clearSavedPages, savePage, offlineReadDirectory};
}
