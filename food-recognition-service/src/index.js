require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initStorage } = require('./services/storage');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/', analyzeRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'food-recognition-service' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

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
