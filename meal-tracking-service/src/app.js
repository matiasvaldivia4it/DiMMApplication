require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mealsRoutes = require('./routes/meals');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/meals', mealsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'meal-tracking-service' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
