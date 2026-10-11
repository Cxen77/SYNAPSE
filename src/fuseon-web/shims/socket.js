/**
 * Local stand-in for socket.io-client. The mock server pushes events through
 * `serverEmit`, and components listen with the normal socket.on/off API.
 * Replace with the real socket.io client when a backend is connected.
 */
const listeners = new Map();
const outgoing = new Map();

export function serverEmit(event, payload) {
  (listeners.get(event) || []).forEach((cb) => {
    try { cb(payload); } catch (e) { console.error('[demo socket]', e); }
  });
}

/** Mock handlers can react to client emits (e.g. typing). */
export function onClientEmit(event, cb) {
  if (!outgoing.has(event)) outgoing.set(event, []);
  outgoing.get(event).push(cb);
}

function createSocket() {
  const socket = {
    id: 'demo-socket',
    connected: true,
    on(event, cb) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(cb);
      return socket;
    },
    off(event, cb) {
      if (!listeners.has(event)) return socket;
      if (!cb) listeners.delete(event);
      else listeners.set(event, listeners.get(event).filter((l) => l !== cb));
      return socket;
    },
    once(event, cb) {
      const wrap = (p) => { socket.off(event, wrap); cb(p); };
      return socket.on(event, wrap);
    },
    emit(event, payload, ack) {
      (outgoing.get(event) || []).forEach((cb) => cb(payload));
      if (typeof ack === 'function') setTimeout(() => ack({ ok: true }), 50);
      return socket;
    },
    disconnect() { socket.connected = false; },
    connect() { socket.connected = true; },
  };
  setTimeout(() => serverEmit('connect'), 0);
  return socket;
}

export default function io() {
  return createSocket();
}
