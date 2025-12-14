const rateLimit = require('express-rate-limit');

// General rate limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Increased limit to avoid 429 on valid auth flows
    validate: { xForwardedForHeader: false }, // Avoid error behind proxy if trust proxy is not enough
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased from 10 to 100 - /auth/me is called frequently by frontend
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for /auth/me endpoint (health check endpoint called on every page load)
    skip: (req) => req.path.endsWith('/me') || req.path.endsWith('/auth/me')
});

// Upload rate limiter (for food images)
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // Limit each IP to 50 uploads per hour
    message: 'Too many uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
};
