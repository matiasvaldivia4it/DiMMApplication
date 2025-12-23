const app = require('./app');
const { initDatabase } = require('./config/database');

const PORT = process.env.PORT || 4003;

// Start server
const startServer = async () => {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`Meal Tracking service listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
