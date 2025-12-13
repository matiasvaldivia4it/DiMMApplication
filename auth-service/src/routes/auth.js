const express = require('express');
const passport = require('../config/passport');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../middleware/jwt');
const { pool } = require('../config/database');

const router = express.Router();

// Google OAuth login
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));

// Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const accessToken = generateAccessToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?access_token=${accessToken}&refresh_token=${refreshToken}`);
    }
);

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }

        const decoded = verifyToken(refreshToken);

        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Get user from database
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token
router.get('/verify', (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false, error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ valid: false, error: 'Invalid or expired token' });
    }

    res.json({ valid: true, user: decoded });
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        const result = await pool.query('SELECT id, email, name, picture, created_at FROM users WHERE id = $1', [decoded.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
