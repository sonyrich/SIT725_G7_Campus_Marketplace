// Express application (no network listening here).
//
// Kept separate from server.js so automated tests can import the app with
// Supertest without opening a port or connecting to the real database.

require('./config/env');

const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Absolute paths so static files work no matter which folder the
// server is started from (project root, backend/, Docker, tests).
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Health check — handy for Docker and for quickly confirming the API is up
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);

// FR-14 Report Listing
app.use('/api/reports', reportRoutes);

// Unknown API routes return JSON (matching our { success, message } shape)
// instead of Express's default HTML page, so the frontend can show the message.
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route not found: ${req.method} ${req.originalUrl}`
    });
});

// Error handler must be registered last
app.use(errorHandler);

module.exports = app;
