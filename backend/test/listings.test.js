const { expect } = require('chai');
const request = require('supertest');

const app = require('../app');
const Listing = require('../models/listing');
const { createUser, createListing, auth } = require('./helpers');

describe('Listings API', () => {
    describe('GET /api/listings (FR-05 browse, FR-06 search)', () => {
        it('only returns available listings, newest first', async () => {
            const { user } = await createUser();
            await createListing(user, { title: 'Older', createdAt: new Date('2026-01-01') });
            await createListing(user, { title: 'Newer', createdAt: new Date('2026-02-01') });
            await createListing(user, { title: 'Sold one', status: 'sold' });

            const res = await request(app).get('/api/listings');

            expect(res.status).to.equal(200);
            expect(res.body.data.map((l) => l.title)).to.deep.equal(['Newer', 'Older']);
        });

        it('filters by category and searches by keyword', async () => {
            const { user } = await createUser();
            await createListing(user, { title: 'Calculus textbook', category: 'textbooks' });
            await createListing(user, { title: 'Road bike', category: 'bikes' });

            const byCategory = await request(app).get('/api/listings?category=bikes');
            const bySearch = await request(app).get('/api/listings?search=calculus');

            expect(byCategory.body.data.map((l) => l.title)).to.deep.equal(['Road bike']);
            expect(bySearch.body.data.map((l) => l.title)).to.deep.equal(['Calculus textbook']);
        });
    });

    describe('POST /api/listings (FR-04 create)', () => {
        it('requires authentication', async () => {
            const res = await request(app).post('/api/listings').send({ title: 'x' });

            expect(res.status).to.equal(401);
        });

        it('creates a listing owned by the logged-in user', async () => {
            const { user, token } = await createUser();

            const res = await request(app)
                .post('/api/listings')
                .set(auth(token))
                .field('title', 'Desk lamp')
                .field('description', 'Bright LED lamp')
                .field('price', '12.5')
                .field('category', 'furniture')
                .field('condition', 'Good');

            expect(res.status).to.equal(201);
            expect(res.body.data).to.include({ title: 'Desk lamp', price: 12.5, status: 'available' });
            expect(String(res.body.data.seller)).to.equal(String(user._id));
        });

        it('rejects an invalid condition with 400', async () => {
            const { token } = await createUser();

            const res = await request(app)
                .post('/api/listings')
                .set(auth(token))
                .send({ title: 'Lamp', description: 'Nice lamp', price: 5, category: 'furniture', condition: 'Broken' });

            expect(res.status).to.equal(400);
        });
    });

    describe('GET /api/listings/:id (FR-08)', () => {
        it('returns 400 for a malformed id and 404 for a missing listing', async () => {
            const bad = await request(app).get('/api/listings/not-an-id');
            const missing = await request(app).get('/api/listings/64b000000000000000000000');

            expect(bad.status).to.equal(400);
            expect(missing.status).to.equal(404);
        });
    });

    describe('PUT /api/listings/:id (FR-09 edit)', () => {
        it('lets the owner update their listing', async () => {
            const { user, token } = await createUser();
            const listing = await createListing(user);

            const res = await request(app).put(`/api/listings/${listing._id}`).set(auth(token)).send({ price: 99 });

            expect(res.status).to.equal(200);
            expect(res.body.data.price).to.equal(99);
        });

        it("blocks editing someone else's listing with 403", async () => {
            const { user: owner } = await createUser();
            const { token: otherToken } = await createUser();
            const listing = await createListing(owner);

            const res = await request(app).put(`/api/listings/${listing._id}`).set(auth(otherToken)).send({ price: 1 });

            expect(res.status).to.equal(403);
            expect((await Listing.findById(listing._id)).price).to.equal(10);
        });
    });

    describe('PATCH /api/listings/:id/status (FR-13 mark as sold)', () => {
        it('marks the owner\'s listing as sold and rejects doing it twice', async () => {
            const { user, token } = await createUser();
            const listing = await createListing(user);

            const first = await request(app).patch(`/api/listings/${listing._id}/status`).set(auth(token));
            const second = await request(app).patch(`/api/listings/${listing._id}/status`).set(auth(token));

            expect(first.status).to.equal(200);
            expect(first.body.data.status).to.equal('sold');
            expect(second.status).to.equal(400);
        });

        it("blocks marking someone else's listing as sold with 403", async () => {
            const { user: owner } = await createUser();
            const { token: otherToken } = await createUser();
            const listing = await createListing(owner);

            const res = await request(app).patch(`/api/listings/${listing._id}/status`).set(auth(otherToken));

            expect(res.status).to.equal(403);
        });
    });
});
