import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Team from '../models/Team.js';
import AutoTeamQueue from '../models/AutoTeamQueue.js';
import Chat from '../models/Chat.js';
import { joinQueue } from '../controllers/autoTeamController.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Mock Request/Response for Controller Testing
const mockReq = (user, body = {}, params = {}) => ({
    user,
    body,
    params
});

const mockRes = () => {
    const res = {};
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.data = data; return res; };
    res.send = (data) => { res.data = data; return res; };
    return res;
};

// --- Test Data Generators ---

const createTestUser = async (name, filters) => {
    return await User.create({
        name,
        username: `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        email: `test_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@example.com`,
        password: 'password123',
        college: filters.college,
        location: filters.location,
        year: filters.year,
        skills: filters.skills,
        // Mocking role because in real app it's in req.body.filters, not strictly in user setup for this test logic
        // But for calculation it needs to be in 'filters' object passed to joinQueue
    });
};

const runTests = async () => {
    await connectDB();
    console.log('--- Starting AutoTeam Logic Verification ---');

    let users = [];
    let event = null;

    try {
        // 1. Setup Data
        console.log('\n[1] Setting up Test Data...');
        const organizer = await createTestUser('Organizer', { college: 'MIT', location: 'Boston' });

        event = await Event.create({
            title: 'Test Hackathon ' + Date.now(),
            description: 'Test Description',
            date: new Date(),
            location: 'Online',
            category: 'Hackathon',
            organizer: organizer._id,
            attendees: []
        });
        console.log(`Event Created: ${event.title} (${event._id})`);

        // 2. Scenario: 3 Matching Users with DIVERSE ROLES
        console.log('\n[2] Testing Scenario: 3 Matching Users (Diverse Roles)...');
        // All same college/location to ensure high base score, but different roles should boost it.
        const userA = await createTestUser('Alice (Frontend)', { college: 'MIT', location: 'Boston', year: '3rd' });
        const userB = await createTestUser('Bob (Backend)', { college: 'MIT', location: 'Boston', year: '3rd' });
        const userC = await createTestUser('Charlie (Designer)', { college: 'MIT', location: 'Boston', year: '3rd' });
        users.push(organizer, userA, userB, userC);

        console.log('Adding users to queue...');

        // Mock Join for A - Frontend
        await mockJoin(userA, event._id, { college: 'MIT', location: 'Boston', year: '3rd', role: 'Frontend', skills: ['React'] });
        // Mock Join for B - Backend
        await mockJoin(userB, event._id, { college: 'MIT', location: 'Boston', year: '3rd', role: 'Backend', skills: ['Node'] });
        // Mock Join for C - Designer (Should trigger match with diversity bonus)
        await mockJoin(userC, event._id, { college: 'MIT', location: 'Boston', year: '3rd', role: 'Designer', skills: ['Figma'] });

        // Wait a bit for async matching to happen
        console.log('Waiting for matching processor...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // CHECK RESULTS
        const team = await Team.findOne({
            eventId: event._id,
            isAutoCreated: true
        }).populate('members');

        if (team) {
            console.log('✅ SUCCESS: Team Created!');
            console.log(`   Name: ${team.name}`);
            console.log(`   Members: ${team.members.map(m => m.name).join(', ')}`);

            if (team.members.length === 3) {
                console.log('✅ SUCCESS: Correct number of members (3)');
            } else {
                console.log(`❌ FAILURE: Expected 3 members, got ${team.members.length}`);
            }

            const chat = await Chat.findOne({ roomName: team.name });
            if (chat) {
                console.log('✅ SUCCESS: Chat Room Created!');
            } else {
                console.log('❌ FAILURE: Chat Room NOT Created');
            }

        } else {
            console.log('❌ FAILURE: No team created for matching users.');
            // Debug: Check Queue
            const queue = await AutoTeamQueue.find({ eventId: event._id });
            console.log('   Queue state:', queue.map(q => `${q.userId} - ${q.status}`));
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        // Cleanup
        console.log('\n[Cleanup] Removing Test Data...');
        if (event) await Event.findByIdAndDelete(event._id);
        if (users.length) await User.deleteMany({ _id: { $in: users.map(u => u._id) } });
        await AutoTeamQueue.deleteMany({ eventId: event?._id });
        await Team.deleteMany({ name: { $regex: 'Test Hackathon' } });
        await Chat.deleteMany({ chatName: { $regex: 'Test Hackathon' } });

        await mongoose.connection.close();
        console.log('Done.');
    }
};

// Helper wrapper to call controller
async function mockJoin(user, eventId, filters) {
    const req = mockReq(user, { filters }, { eventId });
    const res = mockRes();
    await joinQueue(req, res);
    // console.log(`   Join response for ${user.name}:`, res.data);
}

runTests();
