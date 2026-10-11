import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/db.js';

async function seed() {
    await connectDB();
    
    // Check if user exists
    let user = await User.findOne({ email: 'demo@synapse.com' });
    if (!user) {
        user = new User({
            name: 'Demo Student',
            username: 'demostudent',
            email: 'demo@synapse.com',
            password: 'Password123!',
            isEmailVerified: true,
            collegeVerified: 'true',
            role: 'user',
            college: 'Stanford University',
            bio: 'Passionate developer & student on Synapse.',
            skills: ['React', 'React Native', 'Node.js', 'Python', 'AI/ML'],
            profileScore: 92
        });
        await user.save();
        console.log('✅ Created demo user: demo@synapse.com');
    } else {
        user.password = 'Password123!';
        user.isEmailVerified = true;
        user.collegeVerified = 'true';
        user.skills = ['React', 'React Native', 'Node.js', 'Python', 'AI/ML'];
        await user.save();
        console.log('✅ Updated demo user: demo@synapse.com');
    }
    
    // Also create an admin user for dashboard testing
    let admin = await User.findOne({ email: 'admin@synapse.com' });
    if (!admin) {
        admin = new User({
            name: 'Synapse Admin',
            username: 'admin',
            email: 'admin@synapse.com',
            password: 'Password123!',
            isEmailVerified: true,
            collegeVerified: 'true',
            role: 'admin',
            college: 'MIT',
            bio: 'System Administrator',
            skills: ['DevOps', 'Security', 'Management'],
            profileScore: 100
        });
        await admin.save();
        console.log('✅ Created admin user: admin@synapse.com');
    }

    process.exit(0);
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
