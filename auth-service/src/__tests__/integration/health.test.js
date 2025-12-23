const request = require('supertest');
require('../../tests_setup');
const app = require('../../app');

describe('Auth Service Health Check', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'auth-service');
    });
});
