// Entry point: connects to MongoDB, then starts the HTTP server.
const config = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

const start = async () => {
    await connectDB();

    const server = app.listen(config.port, () => {
        console.log(`Campus Marketplace running at http://localhost:${config.port}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${config.port} is already in use. Set a different PORT in backend/.env (e.g. PORT=3001).`);
        } else {
            console.error('Server error:', error.message);
        }
        process.exit(1);
    });
};

start();
