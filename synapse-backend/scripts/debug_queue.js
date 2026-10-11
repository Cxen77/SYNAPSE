import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AutoTeamQueue from './models/AutoTeamQueue.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const checkQueue = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const queue = await AutoTeamQueue.find({}).populate('userId', 'name email');
        console.log(`Found ${queue.length} entries in queue.`);

        queue.forEach(q => {
            console.log(`User: ${q.userId?.name} (${q.userId?._id}) - Event: ${q.eventId} - Status: ${q.status}`);
        });

        const users = await User.find({}).limit(5);
        console.log("Users:", users.map(u => u.username));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

checkQueue();
