import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import AutoTeamQueue from './models/AutoTeamQueue.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const logFile = path.join(__dirname, 'debug_output.txt');
fs.writeFileSync(logFile, ''); // Clear file

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

// Copy of Algorithm Weights & Logic for manual verification
const WEIGHTS = {
    COLLEGE: 30,
    LOCATION: 20,
    ROLE: 15,
    YEAR: 10,
    SKILL: 5
};

const calculateScore = (userA, userB) => {
    let score = 0;
    const details = [];

    if (userA.college && userB.college && userA.college === userB.college) {
        score += WEIGHTS.COLLEGE;
        details.push(`College Match (+${WEIGHTS.COLLEGE})`);
    }
    if (userA.location && userB.location && userA.location === userB.location) {
        score += WEIGHTS.LOCATION;
        details.push(`Location Match (+${WEIGHTS.LOCATION})`);
    }
    if (userA.year && userB.year && userA.year === userB.year) {
        score += WEIGHTS.YEAR;
        details.push(`Year Match (+${WEIGHTS.YEAR})`);
    }

    if (userA.role && userB.role && userA.role !== userB.role) {
        score += WEIGHTS.ROLE;
        details.push(`Role Different (+${WEIGHTS.ROLE})`);
    } else if (userA.role && userB.role) {
        details.push(`Role Same (0)`);
    }

    const skillsA = new Set(userA.skills || []);
    const skillsB = userB.skills || [];
    const overlap = skillsB.filter(skill => skillsA.has(skill)).length;
    score += (overlap * WEIGHTS.SKILL);
    if (overlap > 0) details.push(`Skills Overlap: ${overlap} (+${overlap * WEIGHTS.SKILL})`);

    return { score, details };
};

const debugQueue = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        log("Connected to DB");

        const queue = await AutoTeamQueue.find({}).populate('userId', 'name email');
        log(`\nFound ${queue.length} TOTAL entries (queued + matched).`);

        // Group by Event ID
        const byEvent = {};
        queue.forEach(q => {
            if (!byEvent[q.eventId]) byEvent[q.eventId] = [];
            byEvent[q.eventId].push(q);
        });

        for (const [eventId, users] of Object.entries(byEvent)) {
            log(`\n--- Event ID: ${eventId} ---`);
            log(`Total Queued: ${users.length}`);

            users.forEach((u, i) => {
                log(`[${i}] User: ${u.userId?.name} (${u.userId?._id}) - Status: ${u.status}`);
                log(`    Filters: ${JSON.stringify(u.filters)}`);
            });

            log(`\n--- Simulating Matches ---`);
            for (let i = 0; i < users.length; i++) {
                for (let j = i + 1; j < users.length; j++) {
                    const u1 = users[i];
                    const u2 = users[j];
                    const result = calculateScore(u1.filters, u2.filters);
                    log(`Match [${i}] & [${j}]: Score = ${result.score}`);
                    log(`    Details: ${result.details.join(', ')}`);
                }
            }
        }

    } catch (err) {
        log(err.stack);
    } finally {
        await mongoose.connection.close();
    }
};

debugQueue();
