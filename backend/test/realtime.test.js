const { expect } = require('chai');
const http = require('http');
const request = require('supertest');
const { io: connectClient } = require('socket.io-client');

const app = require('../app');
const { initRealtime, closeRealtime } = require('../realtime/socket');
const { detectAction } = require('../middleware/listingChangeNotifier');
const { createUser, createListing, auth } = require('./helpers');

// Resolves with the next event of `name`, or rejects after `ms`
function nextEvent(socket, name, ms = 3000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`No "${name}" event within ${ms}ms`)), ms);
        socket.once(name, (payload) => {
            clearTimeout(timer);
            resolve(payload);
        });
    });
}

describe('Real-time updates (Socket.IO)', () => {
    let server;
    let baseUrl;
    let client;

    beforeEach(async () => {
        server = http.createServer(app);
        initRealtime(server);
        await new Promise((resolve) => server.listen(0, resolve));
        baseUrl = `http://127.0.0.1:${server.address().port}`;

        client = connectClient(baseUrl, { transports: ['websocket'], forceNew: true });
        await nextEvent(client, 'connect');
    });

    afterEach(async () => {
        client.close();
        closeRealtime();
        await new Promise((resolve) => server.close(resolve));
    });

    it('broadcasts how many people are online', async () => {
        const counts = [];
        client.on('presence:count', (count) => counts.push(count));

        const second = connectClient(baseUrl, { transports: ['websocket'], forceNew: true });
        await nextEvent(second, 'connect');
        await new Promise((resolve) => setTimeout(resolve, 200));

        expect(counts).to.include(2);
        second.close();
    });

    it('emits "created" with the new id when a listing is created', async () => {
        const { token } = await createUser();
        const event = nextEvent(client, 'listing:changed');

        const res = await request(baseUrl)
            .post('/api/listings')
            .set(auth(token))
            .send({ title: 'Live lamp', description: 'Real-time test', price: 5, category: 'furniture', condition: 'Good' });

        const payload = await event;
        expect(res.status).to.equal(201);
        expect(payload.action).to.equal('created');
        expect(payload.listingId).to.equal(String(res.body.data._id));
        expect(payload).to.not.have.property('seller'); // no user data is broadcast
    });

    it('emits "sold" when a listing is marked as sold', async () => {
        const { user, token } = await createUser();
        const listing = await createListing(user);
        const event = nextEvent(client, 'listing:changed');

        await request(baseUrl).patch(`/api/listings/${listing._id}/status`).set(auth(token)).expect(200);

        expect(await event).to.include({ action: 'sold', listingId: String(listing._id) });
    });

    it('does not emit anything when the request fails', async () => {
        const { user: owner } = await createUser();
        const { token: otherToken } = await createUser();
        const listing = await createListing(owner);

        let received = false;
        client.on('listing:changed', () => { received = true; });

        await request(baseUrl).put(`/api/listings/${listing._id}`).set(auth(otherToken)).send({ price: 1 }).expect(403);
        await new Promise((resolve) => setTimeout(resolve, 300));

        expect(received).to.equal(false);
    });

    it('maps HTTP methods and paths to change types', () => {
        expect(detectAction('POST', '/')).to.equal('created');
        expect(detectAction('PUT', '/abc')).to.equal('updated');
        expect(detectAction('PATCH', '/abc/status')).to.equal('sold');
        expect(detectAction('DELETE', '/abc')).to.equal('deleted');
        expect(detectAction('GET', '/')).to.equal(null);
        expect(detectAction('POST', '/abc/contact')).to.equal(null);
    });
});
