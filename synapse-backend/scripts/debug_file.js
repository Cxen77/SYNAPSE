import mongoose from 'mongoose';
import Chat from './models/Chat.js';
import User from './models/User.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import fs from 'fs';

dotenv.config();
connectDB();

const debugChatsKey = async () => {
    try {
        let output = "--- DEBUG REPORT ---\n";

        const groups = await Chat.find({ isGroupChat: true });
        output += `Found ${groups.length} group chats.\n`;

        for (const group of groups) {
            output += `\nGroup: ${group.chatName} (ID: ${group._id})\n`;
            output += `Admin: ${group.groupAdmin}\n`;

            for (const partId of group.participants) {

                let typeInfo = typeof partId;
                try {
                    if (partId.constructor) typeInfo += ` (${partId.constructor.name})`;
                } catch (e) { }

                output += `    - Participant ID: ${partId} [Type: ${typeInfo}]\n`;
            }
        }

        output += "\n--- USERS ---\n";
        const users = await User.find({}, 'name email _id');
        users.forEach(u => output += `${u.name}: ${u._id}\n`);

        fs.writeFileSync('debug_output.txt', output);
        console.log("Debug info written to debug_output.txt");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
};

setTimeout(debugChatsKey, 2000);
