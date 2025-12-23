const request = require('supertest');
const jwt = require('jsonwebtoken');
require('../../tests_setup');
const app = require('../../app');

// Mock database to avoid real connections in this test
jest.mock('../../config/database', () => ({
    pool: {
        query: jest.fn(),
    },
}));

describe('Auth Service Token Verification', () => {

    // Use a dummy secret for testing if not set
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.JWT_SECRET = JWT_SECRET;

    const validUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        is_active: true
    };

    const token = jwt.sign(validUser, JWT_SECRET, { expiresIn: '1h' });

    it('GET /auth/verify should return true for valid token', async () => {
        const res = await request(app)
            .get('/auth/verify')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.valid).toBe(true);
        expect(res.body.user).toHaveProperty('id', 1);
        expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('GET /auth/verify should return 401 for missing token', async () => {
        const res = await request(app).get('/auth/verify');
        expect(res.statusCode).toEqual(401);
    });

    it('GET /auth/verify should return 401 for invalid token', async () => {
        const res = await request(app)
            .get('/auth/verify')
            .set('Authorization', 'Bearer invalid_token');

        expect(res.statusCode).toEqual(401);
    });
});
