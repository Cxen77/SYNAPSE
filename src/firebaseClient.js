import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAB9syzEGR2lYpt_RGUlIV7p-IqtT2-SSk",
    authDomain: "synapse-92325.firebaseapp.com",
    projectId: "synapse-92325",
    storageBucket: "synapse-92325.firebasestorage.app",
    messagingSenderId: "476586267886",
    appId: "1:476586267886:web:38e00b0cf82efafb768fff",
    measurementId: "G-HC6SS7SV89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const messaging = getMessaging(app);

export { auth, db, storage, messaging };
export default app;
