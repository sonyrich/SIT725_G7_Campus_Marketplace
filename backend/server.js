require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

const errorHandler = require('./middleware/errorHandler');

const PORT = process.env.PORT || 3000;

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../frontend/public')));


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);

// FR-14 Report Listing
app.use('/api/reports', reportRoutes);


app.get('/', (req, res) => {
    res.send('API testing and running properly');
});


// Error handler must be registered last
app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`APP is running on port ${PORT}`);
});