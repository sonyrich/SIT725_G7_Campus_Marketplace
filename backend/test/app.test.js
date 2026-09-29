const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');

describe('App', () => {
    it('GET /api/health reports the API is running', async () => {
        const res = await request(app).get('/api/health');

        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ success: true, message: 'API is running' });
    });

    it('unknown /api routes return a JSON 404 in the standard error shape', async () => {
        const res = await request(app).delete('/api/does-not-exist');

        expect(res.status).to.equal(404);
        expect(res.headers['content-type']).to.match(/json/);
        expect(res.body.success).to.equal(false);
        expect(res.body.message).to.match(/route not found/i);
    });

    it('serves the frontend homepage', async () => {
        const res = await request(app).get('/');

        expect(res.status).to.equal(200);
        expect(res.text).to.include('Campus');
    });

    it('serves the My Listings page', async () => {
        const res = await request(app).get('/my-listings.html');

        expect(res.status).to.equal(200);
        expect(res.text).to.include('My listings');
    });
});
