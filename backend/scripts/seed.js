// Seed script — creates demo accounts and listings so anyone who clones the
// repo (team members, tutor, marker) can explore the app straight away.
//
//   npm run seed          (from backend/ or from the project root)
//
// Safe to run repeatedly: it only removes and re-creates the demo accounts
// below (and their listings). Real users and listings are never touched.

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const User = require('../models/Users');
const Listing = require('../models/listing');

const DEMO_PASSWORD = 'Password123!';
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const demoUsers = [
    { key: 'alex', fullName: 'Alex Demo', email: 'alex.demo@campus.test', studentID: 'S1000001', role: 'user' },
    { key: 'priya', fullName: 'Priya Demo', email: 'priya.demo@campus.test', studentID: 'S1000002', role: 'user' },
    { key: 'admin', fullName: 'Admin Demo', email: 'admin.demo@campus.test', studentID: 'S1000000', role: 'admin' }
];

const demoListings = [
    { seller: 'alex', title: 'Intro to Algorithms (4th ed.)', description: 'CLRS hardcover, a few pencil notes in chapters 2–4. Great for SIT221.', price: 45, category: 'textbooks', condition: 'Like New', colour: '#2F6B4F' },
    { seller: 'alex', title: 'Mini fridge — barely used', description: '46L bar fridge, perfect for a dorm room. Pick-up from Burwood.', price: 60, category: 'electronics', condition: 'Good', colour: '#B98A2E' },
    { seller: 'alex', title: 'Study desk lamp', description: 'LED desk lamp with 3 brightness levels. USB powered.', price: 8, category: 'furniture', condition: 'Fair', colour: '#55594E' },
    { seller: 'alex', title: 'Scientific calculator Casio fx-82AU', description: 'Approved for exams. Comes with cover.', price: 15, category: 'electronics', condition: 'Good', colour: '#3B5B8C', status: 'sold' },
    { seller: 'priya', title: 'Commuter bike, size M', description: 'Single-speed commuter, new tyres and lights included.', price: 120, category: 'bikes', condition: 'Good', colour: '#A23B2E' },
    { seller: 'priya', title: 'Linear Algebra and Its Applications', description: 'Lay, 5th edition. Minor highlighting.', price: 30, category: 'textbooks', condition: 'Good', colour: '#234f3b' },
    { seller: 'priya', title: 'Ergonomic office chair', description: 'Adjustable height and lumbar support. Moving out sale.', price: 70, category: 'furniture', condition: 'Like New', colour: '#6B4F2F' },
    { seller: 'priya', title: 'Noise-cancelling headphones', description: 'Over-ear, 30h battery. Includes case and cable.', price: 95, category: 'electronics', condition: 'New', colour: '#22261F' },
    { seller: 'priya', title: 'Lab coat + safety glasses', description: 'Size M lab coat and glasses, used for one trimester of chemistry.', price: 20, category: 'other', condition: 'Good', colour: '#4F6B8C' }
];

// Generates a simple placeholder "photo" so seeded listings have images
// without committing binary files to the repository.
const escapeXml = (text) => text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));

const writePlaceholderImage = (listing, index) => {
    const fileName = `seed-listing-${index + 1}.svg`;
    const label = escapeXml(listing.title.length > 28 ? `${listing.title.slice(0, 26)}…` : listing.title);
    const category = escapeXml(listing.category.toUpperCase());
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${listing.colour}"/><stop offset="1" stop-color="#F5F0E1"/>
  </linearGradient></defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <text x="50%" y="46%" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#fff">${label}</text>
  <text x="50%" y="58%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" letter-spacing="6" fill="#fff" opacity="0.85">${category}</text>
</svg>`;
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, fileName), svg);
    return `/uploads/${fileName}`;
};

const seed = async () => {
    await connectDB();

    const emails = demoUsers.map((u) => u.email);
    const existing = await User.find({ email: { $in: emails } }).select('_id');
    await Listing.deleteMany({ seller: { $in: existing.map((u) => u._id) } });
    await User.deleteMany({ email: { $in: emails } });

    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    const usersByKey = {};

    for (const demo of demoUsers) {
        const user = await User.create({
            fullName: demo.fullName,
            email: demo.email,
            password: hashedPassword,
            studentID: demo.studentID,
            role: demo.role
        });
        usersByKey[demo.key] = user;
    }

    for (const [index, item] of demoListings.entries()) {
        await Listing.create({
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            condition: item.condition,
            status: item.status || 'available',
            imageUrl: writePlaceholderImage(item, index),
            seller: usersByKey[item.seller]._id
        });
    }

    console.log(`\nSeeded ${demoUsers.length} demo users and ${demoListings.length} listings.`);
    console.log('Log in with any of these (password for all: ' + DEMO_PASSWORD + '):');
    demoUsers.forEach((u) => console.log(`  ${u.email.padEnd(26)} ${u.role}`));

    await mongoose.disconnect();
};

seed().catch(async (error) => {
    console.error('Seeding failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});
