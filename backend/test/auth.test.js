const { expect } = require('chai');
const request = require('supertest');
const bcrypt = require('bcryptjs');

const app = require('../app');
const User = require('../models/Users');
const { createUser } = require('./helpers');

describe('Auth API (FR-01 register, FR-02 login)', () => {
    const newUser = {
        fullName: 'Jamie Student',
        email: 'Jamie@Campus.test',
        password: 'Secret123!',
        studentId: 'S7654321'
    };

    describe('POST /api/auth/register', () => {
        it('creates a user, hashes the password and returns a token', async () => {
            const res = await request(app).post('/api/auth/register').send(newUser);

            expect(res.status).to.equal(201);
            expect(res.body.success).to.equal(true);
            expect(res.body.data.token).to.be.a('string');
            expect(res.body.data.user).to.include({ fullName: 'Jamie Student', email: 'jamie@campus.test' });
            expect(res.body.data.user).to.not.have.property('password');

            const saved = await User.findOne({ email: 'jamie@campus.test' });
            expect(saved.password).to.not.equal(newUser.password);
            expect(await bcrypt.compare(newUser.password, saved.password)).to.equal(true);
        });

        it('rejects a duplicate email with 409', async () => {
            await request(app).post('/api/auth/register').send(newUser);
            const res = await request(app).post('/api/auth/register').send(newUser);

            expect(res.status).to.equal(409);
            expect(res.body.success).to.equal(false);
        });

        it('rejects missing fields with 400', async () => {
            const res = await request(app).post('/api/auth/register').send({ email: 'a@b.test' });

            expect(res.status).to.equal(400);
            expect(res.body.success).to.equal(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('logs in with correct credentials', async () => {
            const { user, password } = await createUser({ email: 'login@campus.test' });

            const res = await request(app).post('/api/auth/login').send({ email: 'LOGIN@campus.test', password });

            expect(res.status).to.equal(200);
            expect(res.body.data.token).to.be.a('string');
            expect(String(res.body.data.user.id)).to.equal(String(user._id));
        });

        it('rejects a wrong password with 401', async () => {
            await createUser({ email: 'wrongpw@campus.test' });

            const res = await request(app).post('/api/auth/login').send({ email: 'wrongpw@campus.test', password: 'nope' });

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('Invalid email or password');
        });

        it('gives the same message for an unknown email (no account enumeration)', async () => {
            const res = await request(app).post('/api/auth/login').send({ email: 'ghost@campus.test', password: 'x' });

            expect(res.status).to.equal(401);
            expect(res.body.message).to.equal('Invalid email or password');
        });
    });
});
