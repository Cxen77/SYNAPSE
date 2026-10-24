import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { nativeApp, postNativeMessage, registerNativeDevice } from '../../lib/nativeBridge';

// All authenticated API work stays in the website. Access/refresh tokens are
// never sent across the WebView bridge or written to offline page snapshots.
export default function NativeAppBridge() {
  const { currentUser } = useAuth();
  const location = useLocation();
  useEffect(() => {
    let observer;
    let captureTimer;
    const scheduleSnapshot = () => {
      clearTimeout(captureTimer);
      captureTimer = setTimeout(() => postNativeMessage({ type: 'content-ready' }), 1200);
    };
    const syncSession = () => {
      const native = nativeApp();
      if (!native) return;
      if (!currentUser?._id) native.loggingOut = false;
      if (native.loggingOut) return;
      native.userId = currentUser?._id || null;
      postNativeMessage({ type: 'session', userId: native.userId });
      postNativeMessage({ type: 'page', url: window.location.href, title: document.title, canGoBack: (window.history.state?.idx || 0) > 0 });
      if (!observer) {
        observer = new MutationObserver(scheduleSnapshot);
        observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        document.addEventListener('load', scheduleSnapshot, true);
      }
      scheduleSnapshot();
    };
    const register = async event => {
      if (!nativeApp() || !currentUser?._id) return;
      const { token, deviceId, platform } = event.detail || {};
      if (deviceId !== nativeApp().deviceId || typeof token !== 'string') return;
      try {
        if (await registerNativeDevice(api, { token, deviceId, platform }, currentUser._id)) postNativeMessage({ type: 'push-registered', userId: currentUser._id });
      } catch { postNativeMessage({ type: 'push-error', userId: currentUser._id }); }
    };
    window.addEventListener('synapse:native-ready', syncSession);
    window.addEventListener('synapse:native-push', register);
    syncSession();
    return () => {
      window.removeEventListener('synapse:native-ready', syncSession);
      window.removeEventListener('synapse:native-push', register);
      observer?.disconnect();
      clearTimeout(captureTimer);
      document.removeEventListener('load', scheduleSnapshot, true);
    };
  }, [currentUser?._id, location.pathname, location.search]);
  return null;
}
