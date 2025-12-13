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
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NOT NULL,
        insulin_ratio VARCHAR(10) NOT NULL DEFAULT '1:15',
        glucose_min INTEGER NOT NULL DEFAULT 70,
        glucose_max INTEGER NOT NULL DEFAULT 140,
        setup_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS meal_schedules (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        meal_type VARCHAR(50) NOT NULL,
        preferred_time TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ratio_history (
        id SERIAL PRIMARY KEY,
        profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        old_ratio VARCHAR(10) NOT NULL,
        new_ratio VARCHAR(10) NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_meal_schedules_profile_id ON meal_schedules(profile_id);
      CREATE INDEX IF NOT EXISTS idx_ratio_history_profile_id ON ratio_history(profile_id);
    `);
        console.log('User profile database schema initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, initDatabase };
