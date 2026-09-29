const { expect } = require('chai');
const request = require('supertest');

const app = require('../app');
const { createUser, createListing, auth } = require('./helpers');

describe('FR-11 My Listings — GET /api/listings/mine', () => {
    it('requires a login token (401 without one)', async () => {
        const res = await request(app).get('/api/listings/mine');

        expect(res.status).to.equal(401);
        expect(res.body.success).to.equal(false);
    });

    it('rejects an invalid or tampered token with 401', async () => {
        const res = await request(app).get('/api/listings/mine').set(auth('not.a.real.token'));

        expect(res.status).to.equal(401);
    });

    it("returns only the logged-in user's listings, including sold ones", async () => {
        const { user: me, token } = await createUser();
        const { user: someoneElse } = await createUser();

        await createListing(me, { title: 'My available item' });
        await createListing(me, { title: 'My sold item', status: 'sold' });
        await createListing(someoneElse, { title: 'Not mine' });

        const res = await request(app).get('/api/listings/mine').set(auth(token));

        expect(res.status).to.equal(200);
        expect(res.body.success).to.equal(true);
        expect(res.body.count).to.equal(2);
        expect(res.body.data.map((l) => l.title)).to.have.members(['My available item', 'My sold item']);
        res.body.data.forEach((listing) => expect(String(listing.seller)).to.equal(String(me._id)));
    });

    it('sorts listings newest first', async () => {
        const { user, token } = await createUser();
        await createListing(user, { title: 'January', createdAt: new Date('2026-01-10') });
        await createListing(user, { title: 'March', createdAt: new Date('2026-03-10') });
        await createListing(user, { title: 'February', createdAt: new Date('2026-02-10') });

        const res = await request(app).get('/api/listings/mine').set(auth(token));

        expect(res.body.data.map((l) => l.title)).to.deep.equal(['March', 'February', 'January']);
    });

    it('returns dashboard stats (counts and values by status)', async () => {
        const { user, token } = await createUser();
        await createListing(user, { price: 45 });
        await createListing(user, { price: 60 });
        await createListing(user, { price: 15, status: 'sold' });

        const res = await request(app).get('/api/listings/mine').set(auth(token));

        expect(res.body.stats).to.deep.equal({
            total: 3,
            available: 2,
            sold: 1,
            availableValue: 105,
            soldValue: 15
        });
    });

    it('filters with ?status=sold but keeps stats for all listings', async () => {
        const { user, token } = await createUser();
        await createListing(user, { title: 'Still for sale' });
        await createListing(user, { title: 'Gone', status: 'sold' });

        const res = await request(app).get('/api/listings/mine?status=sold').set(auth(token));

        expect(res.status).to.equal(200);
        expect(res.body.data.map((l) => l.title)).to.deep.equal(['Gone']);
        expect(res.body.stats.total).to.equal(2);
    });

    it('rejects an unknown status value with 400', async () => {
        const { token } = await createUser();

        const res = await request(app).get('/api/listings/mine?status=deleted').set(auth(token));

        expect(res.status).to.equal(400);
        expect(res.body.message).to.match(/available.*sold/);
    });

    it('returns an empty list and zero stats for a new seller', async () => {
        const { token } = await createUser();

        const res = await request(app).get('/api/listings/mine').set(auth(token));

        expect(res.status).to.equal(200);
        expect(res.body.data).to.deep.equal([]);
        expect(res.body.stats).to.deep.equal({ total: 0, available: 0, sold: 0, availableValue: 0, soldValue: 0 });
    });

    it('is not mistaken for a listing id by the /:id route', async () => {
        const { token } = await createUser();

        const res = await request(app).get('/api/listings/mine').set(auth(token));

        expect(res.body.message).to.not.equal('Invalid listing ID');
        expect(res.status).to.equal(200);
    });
});
