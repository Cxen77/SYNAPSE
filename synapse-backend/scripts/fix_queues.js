import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import AutoTeamQueue from './models/AutoTeamQueue.js';
import Team from './models/Team.js';
import Chat from './models/Chat.js';
import Event from './models/Event.js';
import { getIO } from './socket/socketServer.js'; // Might fail if no server
// We can't use socket io emit here easily without a running server context, matches will happen but sockets won't fire.
// That's fine, the user's status will update to 'matched' and frontend will see it on refresh/poll.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MATCH_THRESHOLD = 0;
const MIN_TEAM_SIZE = 2; // ENFORCE 2

const WEIGHTS = {
    COLLEGE: 30,
    LOCATION: 20,
    ROLE: 15,
    YEAR: 10,
    SKILL: 5
};

const calculateScore = (userA, userB) => {
    let score = 0;
    if (userA.college && userB.college && userA.college === userB.college) score += WEIGHTS.COLLEGE;
    if (userA.location && userB.location && userA.location === userB.location) score += WEIGHTS.LOCATION;
    if (userA.year && userB.year && userA.year === userB.year) score += WEIGHTS.YEAR;
    if (userA.role && userB.role && userA.role !== userB.role) score += WEIGHTS.ROLE;
    const skillsA = new Set(userA.skills || []);
    const skillsB = userB.skills || [];
    const overlap = skillsB.filter(skill => skillsA.has(skill)).length;
    score += (overlap * WEIGHTS.SKILL);
    return score;
};

const createAutoTeam = async (eventId, queueEntries) => {
    const event = await Event.findById(eventId);
    const userIds = queueEntries.map(q => q.userId._id);
    const creatorId = userIds[0];

    console.log(`[Fix] Creating team for: ${userIds.join(', ')}`);

    const newTeam = await Team.create({
        name: `Auto-Team: ${event.title} (Fixed)`,
        description: `Automatically created team for ${event.title}`,
        category: 'Hackathon',
        visibility: 'private',
        eventId: eventId,
        isAutoCreated: true,
        members: userIds,
        admins: [creatorId],
        createdBy: creatorId,
        invites: []
    });

    const newChat = await Chat.create({
        roomName: newTeam.name,
        isGroupChat: true,
        groupAdmin: creatorId,
        participants: userIds
    });

    const queueIds = queueEntries.map(q => q._id);
    await AutoTeamQueue.updateMany(
        { _id: { $in: queueIds } },
        { status: 'matched' }
    );
};

const processMatching = async (eventId) => {
    const queue = await AutoTeamQueue.find({ eventId, status: 'queued' }).populate('userId');
    console.log(`Processing Event ${eventId}: ${queue.length} users queued`);

    if (queue.length < MIN_TEAM_SIZE) return;

    const takenIds = new Set();
    const matches = [];

    for (let i = 0; i < queue.length; i++) {
        const anchor = queue[i];
        if (takenIds.has(anchor._id.toString())) continue;

        const currentTeam = [anchor];
        for (let j = i + 1; j < queue.length; j++) {
            const candidate = queue[j];
            if (takenIds.has(candidate._id.toString())) continue;

            const score = calculateScore(anchor.filters, candidate.filters);
            if (score >= MATCH_THRESHOLD) {
                currentTeam.push(candidate);
                if (currentTeam.length >= MIN_TEAM_SIZE) break;
            }
        }

        if (currentTeam.length >= MIN_TEAM_SIZE) {
            currentTeam.forEach(q => takenIds.add(q._id.toString()));
            matches.push(currentTeam);
        }
    }

    for (const teamMembers of matches) {
        await createAutoTeam(eventId, teamMembers);
    }
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const queues = await AutoTeamQueue.find({ status: 'queued' });
        const eventIds = [...new Set(queues.map(q => q.eventId.toString()))];

        console.log(`Found ${eventIds.length} events with waiting queues.`);

        for (const id of eventIds) {
            await processMatching(id);
        }
        console.log("Done fixing queues.");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

run();
