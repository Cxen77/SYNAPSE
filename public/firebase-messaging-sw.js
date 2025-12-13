// Scripts for firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAB9syzEGR2lYpt_RGUlIV7p-IqtT2-SSk",
    authDomain: "synapse-92325.firebaseapp.com",
    projectId: "synapse-92325",
    storageBucket: "synapse-92325.firebasestorage.app",
    messagingSenderId: "476586267886",
    appId: "1:476586267886:web:38e00b0cf82efafb768fff",
    measurementId: "G-HC6SS7SV89"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png', // Fallback icon
        data: payload.data,
        tag: 'message-tag'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    console.log('[firebase-messaging-sw.js] Notification click Received.', event.notification.data);

    event.notification.close();

    const chatId = event.notification.data?.chatId;
    const url = chatId ? `/chat/${chatId}` : '/chat';

    // Open chat
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function (windowClients) {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(url) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
