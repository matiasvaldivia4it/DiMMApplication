require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const analyzeRoutes = require('./routes/analyze');

const app = express();

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

module.exports = app;
