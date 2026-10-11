/**
 * Tiny in-browser API server used as an axios adapter.
 * Each handler module calls `route(method, '/path/:param', handler)`.
 * Handler receives { params, query, body, user } and returns response data
 * (or throws `httpError(status, message)`).
 */
import { AxiosError } from 'axios';
import { me, persist } from './db';

const routes = [];

export function route(method, pattern, handler) {
  const parts = pattern.split('/').filter(Boolean);
  routes.push({ method: method.toUpperCase(), parts, handler, literals: parts.filter((p) => !p.startsWith(':')).length });
}

export function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

export function requireUser() {
  const u = me();
  if (!u) throw httpError(401, 'Not authorized, no token');
  return u;
}

function match(method, path) {
  const segs = path.split('/').filter(Boolean);
  let best = null;
  for (const r of routes) {
    if (r.method !== method || r.parts.length !== segs.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < segs.length; i++) {
      const p = r.parts[i];
      if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(segs[i]);
      else if (p !== segs[i]) { ok = false; break; }
    }
    if (ok && (!best || r.literals > best.r.literals)) best = { r, params };
  }
  return best;
}

function parseBody(data) {
  if (!data) return {};
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const out = {};
    for (const [k, v] of data.entries()) {
      out[k] = typeof File !== 'undefined' && v instanceof File ? URL.createObjectURL(v) : v;
    }
    return out;
  }
  if (typeof data === 'string') {
    try { return JSON.parse(data); } catch { return {}; }
  }
  return data;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockAdapter(config) {
  const raw = config.url || '';
  const stripped = raw.replace(/^https?:\/\/[^/]+/, '').replace(/^\/api\/v1/, '');
  const [path, qs] = stripped.split('?');
  const query = { ...Object.fromEntries(new URLSearchParams(qs || '')), ...(config.params || {}) };
  const method = (config.method || 'get').toUpperCase();
  const body = parseBody(config.data);

  await delay(method === 'GET' ? 220 : 320);

  const found = match(method, path);
  let status = 200;
  let data;
  try {
    if (!found) {
      console.warn(`[Fuseon demo API] No handler for ${method} ${path}`);
      throw httpError(404, `Not found: ${method} ${path}`);
    }
    data = await found.r.handler({ params: found.params, query, body, config });
    if (method !== 'GET') persist();
  } catch (e) {
    status = e.status || 500;
    const response = { data: { message: e.message }, status, statusText: 'Error', headers: {}, config, request: {} };
    throw new AxiosError(e.message, status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, {}, response);
  }
  // structuredClone so components can't mutate the store by accident
  const payload = data === undefined ? {} : JSON.parse(JSON.stringify(data));
  return { data: payload, status, statusText: 'OK', headers: {}, config, request: {} };
}
