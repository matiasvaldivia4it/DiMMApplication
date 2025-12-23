const request = require('supertest');
const app = require('../../app');

describe('Analytics Service Health Check', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'analytics-service');
    });
});
