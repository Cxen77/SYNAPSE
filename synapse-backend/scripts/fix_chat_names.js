import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Chat from './models/Chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const fixChatNames = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const brokenChats = await Chat.find({ isGroupChat: true, chatName: { $exists: false } });
        console.log(`Found ${brokenChats.length} broken chats (missing chatName).`);

        // Also check for empty strings just in case
        const emptyNameChats = await Chat.find({ isGroupChat: true, chatName: "" });
        console.log(`Found ${emptyNameChats.length} chats with empty names.`);

        const allBad = [...brokenChats, ...emptyNameChats];

        for (const chat of allBad) {
            console.log(`Fixing chat ${chat._id}...`);
            chat.chatName = "Hackathon Team Chat"; // Generic fallback
            await chat.save();
        }

        console.log("Fixed all chats.");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

fixChatNames();
