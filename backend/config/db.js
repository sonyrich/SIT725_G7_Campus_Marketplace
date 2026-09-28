// Creating database connection
const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async (uri = config.mongoUri) => {
    try {
        // Fail fast (5s) with a clear message instead of hanging for 30s
        const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.error('Is MongoDB running? Options:');
        console.error('  - Docker:  docker compose up -d mongo   (from the project root)');
        console.error('  - macOS:   brew services start mongodb-community');
        console.error('  - Windows: start the "MongoDB Server" service');
        console.error('  - Atlas:   set MONGO_URI in backend/.env to your Atlas connection string');
        process.exit(1);
    }
};

module.exports = connectDB; // exporting this so that it can be used in other files.
