const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const initDatabase = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
      CREATE TABLE IF NOT EXISTS daily_summaries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        total_carbs DECIMAL(10, 2) DEFAULT 0,
        total_insulin DECIMAL(10, 2) DEFAULT 0,
        avg_glucose DECIMAL(10, 2),
        min_glucose INTEGER,
        max_glucose INTEGER,
        meal_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );

      CREATE TABLE IF NOT EXISTS patterns (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        pattern_type VARCHAR(50) NOT NULL,
        description TEXT,
        severity VARCHAR(20),
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_daily_summaries_user_date ON daily_summaries(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON patterns(user_id);
      CREATE INDEX IF NOT EXISTS idx_patterns_detected_at ON patterns(detected_at);
    `);
        console.log('Analytics database schema initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, initDatabase };
