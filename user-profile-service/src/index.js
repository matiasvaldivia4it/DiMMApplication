require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDatabase } = require('./config/database');
const profileRoutes = require('./routes/profile');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4004;

// Middleware
app.use(helmet());
app.use(helmet());
// app.use(cors()); // CORS handled by API Gateway
app.use(morgan('combined'));
app.use(express.json());

// Health check (no auth required)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'user-profile-service' });
});

// Protected routes (require authentication)
app.use('/profile', authMiddleware, profileRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'user-profile-service' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`User Profile service listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
