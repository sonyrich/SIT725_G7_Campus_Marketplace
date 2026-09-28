// Centralised environment configuration.
//
// Loads backend/.env using an absolute path, so the server behaves the same
// whether it is started from the project root, from backend/, from Docker or
// from a test runner. Every value has a safe local-development default, so a
// fresh clone runs on any machine (macOS, Windows, Linux) without editing code.

const path = require('path');
const crypto = require('crypto');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const isProduction = process.env.NODE_ENV === 'production';

// 127.0.0.1 instead of "localhost": on Node 18+ "localhost" can resolve to the
// IPv6 address ::1, while a default MongoDB install only listens on IPv4.
const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/campus-marketplace';

if (!process.env.JWT_SECRET) {
    if (isProduction) {
        console.error('JWT_SECRET must be set in production. Add it to backend/.env');
        process.exit(1);
    }

    // Development fallback so the app still starts on a fresh clone.
    // Tokens become invalid whenever the server restarts, so set a real value
    // in backend/.env to stay logged in between restarts.
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('[config] JWT_SECRET not set — using a temporary development secret. Copy backend/.env.example to backend/.env to set one.');
}

const config = {
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGO_URI || DEFAULT_MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    isProduction
};

module.exports = config;
