require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initRedis } = require('./config/redis');
const { scheduleMealReminders } = require('./services/scheduler');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'notification-service' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
    try {
        await initRedis();
        scheduleMealReminders();

        app.listen(PORT, () => {
            console.log(`Notification service listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
