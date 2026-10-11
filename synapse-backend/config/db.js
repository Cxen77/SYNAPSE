import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 3000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`[DB] Local MongoDB connection failed: ${error.message}`);
        console.log('[DB] Starting embedded MongoDB server...');
        try {
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create({
                instance: {
                    dbName: 'synapse'
                }
            });
            const uri = mongod.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected (Embedded): ${conn.connection.host} at ${uri}`);
        } catch (memErr) {
            console.error(`Failed to start embedded MongoDB: ${memErr.message}`);
        }
    }
};

export default connectDB;
