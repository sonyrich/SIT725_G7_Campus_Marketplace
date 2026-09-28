// Small factories so each test can set up exactly the data it needs.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/Users');
const Listing = require('../models/listing');

let counter = 0;

async function createUser(overrides = {}) {
    counter += 1;
    const password = overrides.password || 'Password123!';

    const user = await User.create({
        fullName: overrides.fullName || `Test User ${counter}`,
        email: overrides.email || `user${counter}@campus.test`,
        password: await bcrypt.hash(password, 4), // low cost = fast tests
        studentID: overrides.studentID || `S${String(counter).padStart(7, '0')}`,
        role: overrides.role || 'user'
    });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { user, token, password };
}

async function createListing(seller, overrides = {}) {
    counter += 1;

    return Listing.create({
        title: `Listing ${counter}`,
        description: 'A test listing',
        price: 10,
        category: 'textbooks',
        condition: 'Good',
        status: 'available',
        seller: seller._id,
        ...overrides
    });
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { createUser, createListing, auth };
