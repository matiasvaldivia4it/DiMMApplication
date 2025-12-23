const request = require('supertest');
const app = require('../../app');

describe('API Gateway Health Check', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'api-gateway');
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/unknown/route');
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('error', 'Route not found');
    });
});
