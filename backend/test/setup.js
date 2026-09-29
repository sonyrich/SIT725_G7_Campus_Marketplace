// Global test setup (Mocha root hooks).
//
// By default tests run against a throwaway in-memory MongoDB
// (mongodb-memory-server), so no database needs to be installed or running
// and real data is never touched. The first run downloads a MongoDB binary.
//
// To use an existing MongoDB instead (e.g. in CI), set MONGO_URI_TEST to a
// database whose name contains "test" — it is wiped after every test.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

const mongoose = require('mongoose');

// Controllers log expected errors (e.g. invalid IDs) with console.error.
// Keep test output readable; set TEST_VERBOSE=1 to see those logs.
if (!process.env.TEST_VERBOSE) {
    console.error = () => {};
    console.warn = () => {};
}

let memoryServer = null;

exports.mochaHooks = {
    async beforeAll() {
        let uri = process.env.MONGO_URI_TEST;

        if (!uri) {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            memoryServer = await MongoMemoryServer.create();
            uri = memoryServer.getUri('campus-marketplace-test');
        }

        await mongoose.connect(uri);

        if (!/test/i.test(mongoose.connection.name)) {
            await mongoose.disconnect();
            throw new Error(`Refusing to run tests against database "${mongoose.connection.name}" — its name must contain "test".`);
        }
    },

    async afterEach() {
        const collections = await mongoose.connection.db.collections();
        await Promise.all(collections.map((collection) => collection.deleteMany({})));
    },

    async afterAll() {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.dropDatabase();
            await mongoose.disconnect();
        }
        if (memoryServer) {
            await memoryServer.stop();
        }
    }
};
