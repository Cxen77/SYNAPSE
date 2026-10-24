export function nativeApp() {
  return typeof window !== 'undefined' && window.ReactNativeWebView && window.SynapseNative?.version === 1 ? window.SynapseNative : null;
}

export function postNativeMessage(message) {
  if (nativeApp()) window.ReactNativeWebView.postMessage(JSON.stringify({ version: 1, ...message }));
}

let pendingRegistration = Promise.resolve();
export function registerNativeDevice(api, payload, userId) {
  const task = pendingRegistration.catch(() => {}).then(async () => {
    const native = nativeApp();
    if (!native || native.loggingOut || native.userId !== userId) return false;
    await api.put('/notifications/devices', payload, { timeout: 8000 });
    return true;
  });
  pendingRegistration = task;
  return task;
}

export async function detachNativeDevice(api) {
  const native = nativeApp();
  if (!native?.deviceId) return;
  native.loggingOut = true;
  native.userId = null;
  await pendingRegistration.catch(() => {});
  try { await api.delete('/notifications/devices', { data: { deviceId: native.deviceId }, timeout: 5000 }); }
  catch { /* Logout must remain available during a network interruption. */ }
}
