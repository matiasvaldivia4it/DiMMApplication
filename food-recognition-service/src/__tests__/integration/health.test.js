const request = require('supertest');
const app = require('../../app');

// Mock storage service to avoid MinIO connection attempts
jest.mock('../../services/storage', () => ({
    initStorage: jest.fn(),
}));

describe('Food Recognition Service Health Check', () => {
    it('should return 200 and status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('service', 'food-recognition-service');
    });
});
