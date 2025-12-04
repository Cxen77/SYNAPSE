import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

const initializeFirebase = () => {
    try {
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin Initialized successfully');
        } else {
            console.warn('WARNING: serviceAccountKey.json not found in root directory.');
            console.warn('Firebase Admin could not be initialized. Authentication will fail.');
        }
    } catch (error) {
        console.error('Error initializing Firebase Admin:', error);
    }
};

export { initializeFirebase, admin };
