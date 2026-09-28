// Mocha configuration — run with `npm test` (from backend/ or the project root)
module.exports = {
    spec: ['test/**/*.test.js'],
    require: ['test/setup.js'],
    timeout: 60000,   // first run downloads a MongoDB binary for the in-memory server
    exit: true
};
