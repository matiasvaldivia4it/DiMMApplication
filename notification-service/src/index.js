const app = require('./app');
const { initRedis } = require('./config/redis');
const { scheduleMealReminders } = require('./services/scheduler');

const PORT = process.env.PORT || 4005;

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
