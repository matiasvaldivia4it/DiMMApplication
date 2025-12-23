require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const profileRoutes = require('./routes/profile');
const authMiddleware = require('./middleware/auth');

const app = express();

// Middleware
app.use(helmet());
// Enable CORS for internal communication and proxy compatibility
app.use(cors({
    origin: '*', // Trust the API Gateway
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'user-profile-service' });
});

// Protected routes (require authentication)
app.use('/profile', authMiddleware, profileRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
