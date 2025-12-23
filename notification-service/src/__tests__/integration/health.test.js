const request = require('supertest');
const app = require('../../app');

// Mock scheduler and redis
jest.mock('../../services/scheduler', () => ({
    scheduleMealReminders: jest.fn(),
}));
jest.mock('../../config/redis', () => ({
    initRedis: jest.fn(),
}));

describe('Notification Service Health Check', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'notification-service');
    });
});
