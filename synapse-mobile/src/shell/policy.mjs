export const SNAPSHOT_VERSION = 1;
export const MAX_SNAPSHOT_BYTES = 2_000_000;
export const MAX_IMAGE_BYTES = 2_000_000;
export const MAX_IMAGES = 24;

function canonicalOrigin(url) {
  if (url.protocol === 'https:' && !url.port && ['fuseon.in', 'www.fuseon.in'].includes(url.hostname)) return 'https://www.fuseon.in';
  return url.origin;
}

export function siteOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('The app site must use HTTPS.');
  return canonicalOrigin(url);
}

export function isInternalUrl(value, origin) {
  try { const url = new URL(value); return canonicalOrigin(url) === origin && !url.username && !url.password; } catch { return false; }
}

export function externalUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

export function navigationAction(request, origin) {
  if (request.url === 'about:blank' || isInternalUrl(request.url, origin)) return 'internal';
  try {
    const url = new URL(request.url);
    // iOS identifies subframes. Android does not always expose that flag, so
    // explicitly permit the site's CAPTCHA widget and standard video embeds.
    if (request.isTopFrame === false) return url.protocol === 'https:' ? 'internal' : 'block';
    const embeddedProvider = url.hostname === 'challenges.cloudflare.com'
      || (['www.youtube.com', 'www.youtube-nocookie.com'].includes(url.hostname) && url.pathname.startsWith('/embed/'));
    if (request.isTopFrame !== true && url.protocol === 'https:' && embeddedProvider) return 'internal';
  } catch { return 'block'; }
  return externalUrl(request.url) ? 'external' : 'block';
}

export function canCachePage(value, origin) {
  if (!isInternalUrl(value, origin)) return false;
  const url = new URL(value);
  return !/^\/(?:login|signup|verify-email|forgot-password|reset-password|settings|admin|moderator|organizer|certificate)(?:\/|$)/.test(url.pathname)
    && !url.searchParams.has('token') && !url.searchParams.has('code');
}

export function isOnline(state) {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

export function parseBridgeMessage(raw, pageUrl, origin) {
  if (!isInternalUrl(pageUrl, origin) || typeof raw !== 'string' || raw.length > MAX_SNAPSHOT_BYTES) return null;
  try {
    const message = JSON.parse(raw);
    if (message.version !== 1 || typeof message.type !== 'string') return null;
    if (message.type === 'snapshot' && (!canCachePage(message.url, origin) || typeof message.html !== 'string' || message.html.length > MAX_SNAPSHOT_BYTES)) return null;
    return message;
  } catch { return null; }
}

export function notificationUrl(data, origin) {
  const value = typeof data?.url === 'string' ? data.url : '/';
  try {
    const url = new URL(value, origin);
    return isInternalUrl(url.href, origin) ? url.href : `${origin}/`;
  } catch { return `${origin}/`; }
}

export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
