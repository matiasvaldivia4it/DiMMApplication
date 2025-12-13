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
      CREATE TABLE IF NOT EXISTS meals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        image_url VARCHAR(500),
        category VARCHAR(50) NOT NULL,
        total_carbs DECIMAL(10, 2) NOT NULL,
        insulin_dose DECIMAL(10, 2),
        glucose_pre INTEGER,
        glucose_post INTEGER,
        applied BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS food_items (
        id SERIAL PRIMARY KEY,
        meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        carbs DECIMAL(10, 2) NOT NULL,
        quantity VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
      CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals(created_at);
      CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
      CREATE INDEX IF NOT EXISTS idx_food_items_meal_id ON food_items(meal_id);
    `);
        console.log('Meal tracking database schema initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { pool, initDatabase };
