import mongoose from 'mongoose';
import Chat from './models/Chat.js';
import User from './models/User.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const debugChats = async () => {
    try {
        console.log("--- DEBUGGING CHATS ---");

        const groups = await Chat.find({ isGroupChat: true });
        console.log(`Found ${groups.length} group chats.`);

        for (const group of groups) {
            console.log(`\nGroup: ${group.chatName} (ID: ${group._id})`);
            console.log(`Admin: ${group.groupAdmin}`);
            console.log(`Participants Raw:`, group.participants);

            // Verifying participants
            for (const partId of group.participants) {
                console.log(`    - ID: ${partId} (Type: ${typeof partId}, Constructor: ${partId.constructor.name})`);
                const user = await User.findById(partId);
                if (user) {
                    console.log(`    - Found User: ${user.name}`);
                } else {
                    console.log(`    - User NOT FOUND`);
                }
            }
        }

        console.log("\n--- LIST OF ALL USERS ---");
        const users = await User.find({}, 'name email _id');
        users.forEach(u => console.log(`${u.name}: ${u._id}`));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
};

// Wait for DB connection
setTimeout(debugChats, 2000);
