import { useState, useEffect } from 'react';

/**
 * Handles device-level push / browser notifications for mobile and desktop.
 */
export const sendDeviceNotification = (title, options = {}) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        try {
            const n = new Notification(title, {
                icon: options.icon || '/favicon.svg',
                body: options.body || '',
                badge: options.badge || '/favicon.svg',
                tag: options.tag || 'synapse-notification',
                renotify: true,
                ...options,
            });

            if ('vibrate' in navigator) {
                try {
                    navigator.vibrate([200, 100, 200]);
                } catch (_) {}
            }

            n.onclick = () => {
                window.focus();
                if (options.url) {
                    window.location.href = options.url;
                }
                n.close();
            };
        } catch (e) {
            console.error('[PushNotification] Error showing notification:', e);
        }
    }
};

const usePushNotification = () => {
    const [permission, setPermission] = useState(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            return Notification.permission;
        }
        return 'unsupported';
    });

    const requestPermission = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return 'unsupported';
        }
        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (e) {
            console.error('[PushNotification] Permission request failed:', e);
            return 'denied';
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    return {
        permission,
        requestPermission,
        sendNotification: sendDeviceNotification,
    };
};

export default usePushNotification;
