require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const authMiddleware = require('./middleware/auth');
const { generalLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 4000;

// Trust proxy (required for rate limiting behind a reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://dimma.auditoriasenlinea.com.ar',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-Id']
}));
app.use(morgan('combined'));
app.use(express.json());

// Apply general rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway' });
});

// Service URLs
const services = {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:4001',
    food: process.env.FOOD_SERVICE_URL || 'http://food-recognition:4002',
    meal: process.env.MEAL_SERVICE_URL || 'http://meal-tracking:4003',
    profile: process.env.PROFILE_SERVICE_URL || 'http://user-profile:4004',
    notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification:4005',
    analytics: process.env.ANALYTICS_SERVICE_URL || 'http://analytics:4006',
};

// Proxy configuration
const proxyOptions = {
    changeOrigin: true,
    logLevel: 'warn',
    proxyTimeout: 30000, // 30 seconds
    timeout: 30000, // 30 seconds
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        // Specialized error handling for timeouts
        if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
            res.status(504).json({ error: 'Gateway Timeout - Service took too long to respond' });
        } else {
            res.status(502).json({ error: 'Bad Gateway - Service unavailable' });
        }
    },
};

// Auth routes (with stricter rate limiting)
app.use('/api/auth', authLimiter, createProxyMiddleware({
    target: services.auth,
    pathRewrite: { '^/api/auth': '/auth' },
    ...proxyOptions,
}));

// Protected routes (require authentication)
app.use(authMiddleware);

// Food recognition routes (with upload rate limiting)
app.use('/api/food', uploadLimiter, createProxyMiddleware({
    target: services.food,
    pathRewrite: { '^/api/food': '' },
    ...proxyOptions,
}));

// Meal tracking routes
app.use('/api/meals', createProxyMiddleware({
    target: services.meal,
    pathRewrite: { '^/api/meals': '/meals' },
    ...proxyOptions,
}));

// User profile routes
app.use('/api/profile', createProxyMiddleware({
    target: services.profile,
    pathRewrite: { '^/api/profile': '/profile' },
    ...proxyOptions,
}));

// Notification routes
app.use('/api/notifications', createProxyMiddleware({
    target: services.notification,
    pathRewrite: { '^/api/notifications': '/notifications' },
    ...proxyOptions,
}));

// Analytics routes
app.use('/api/analytics', createProxyMiddleware({
    target: services.analytics,
    pathRewrite: { '^/api/analytics': '/analytics' },
    ...proxyOptions,
}));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
    console.log('Service routes:');
    console.log('  /api/auth -> Auth Service');
    console.log('  /api/food -> Food Recognition Service');
    console.log('  /api/meals -> Meal Tracking Service');
    console.log('  /api/profile -> User Profile Service');
    console.log('  /api/notifications -> Notification Service');
    console.log('  /api/analytics -> Analytics Service');
});
