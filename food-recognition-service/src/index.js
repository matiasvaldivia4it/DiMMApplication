const app = require('./app');
const { initStorage } = require('./services/storage');

const PORT = process.env.PORT || 4002;

// Start server
const startServer = async () => {
    try {
        await initStorage();
        app.listen(PORT, () => {
            console.log(`Food Recognition service listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
