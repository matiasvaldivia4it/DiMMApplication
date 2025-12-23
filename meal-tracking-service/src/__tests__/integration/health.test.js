const request = require('supertest');
const app = require('../../app');

describe('Meal Tracking Service Health Check', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'meal-tracking-service');
    });
});
