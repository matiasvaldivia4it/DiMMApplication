#!/bin/bash
set -e
set -u

function create_database() {
    local database=$1
    echo "Creating database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

function init_auth_db() {
    echo "Initializing auth_db schema..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=auth_db <<-EOSQL
        -- Users table with admin and subscription management
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            google_id VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            picture TEXT,
            role VARCHAR(20) DEFAULT 'user',
            is_active BOOLEAN DEFAULT TRUE,
            subscription_status VARCHAR(20) DEFAULT 'free',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

        -- Migrations for existing tables
        DO \$\$
        BEGIN
            -- Ensure picture column is TEXT
            ALTER TABLE users ALTER COLUMN picture TYPE TEXT;
        EXCEPTION
            WHEN undefined_column THEN NULL;
        END \$\$;

        DO \$\$
        BEGIN
            -- Add role column if not exists
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END \$\$;

        DO \$\$
        BEGIN
            -- Add is_active column if not exists
            ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END \$\$;

        DO \$\$
        BEGIN
            -- Add subscription_status column if not exists
            ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'free';
        EXCEPTION
            WHEN duplicate_column THEN NULL;
        END \$\$;
EOSQL
    echo "auth_db schema initialized"
}

function init_profiles_db() {
    echo "Initializing profiles_db schema..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=profiles_db <<-EOSQL
        -- User profiles table
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

        -- Meal schedules table
        CREATE TABLE IF NOT EXISTS meal_schedules (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            meal_type VARCHAR(50) NOT NULL,
            preferred_time TIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Insulin ratio history table
        CREATE TABLE IF NOT EXISTS ratio_history (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
            old_ratio VARCHAR(10) NOT NULL,
            new_ratio VARCHAR(10) NOT NULL,
            changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_meal_schedules_profile_id ON meal_schedules(profile_id);
        CREATE INDEX IF NOT EXISTS idx_ratio_history_profile_id ON ratio_history(profile_id);
EOSQL
    echo "profiles_db schema initialized"
}

function init_meals_db() {
    echo "Initializing meals_db schema..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=meals_db <<-EOSQL
        -- Meals table
        CREATE TABLE IF NOT EXISTS meals (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            category VARCHAR(50) NOT NULL,
            description TEXT,
            carbs DECIMAL(10, 2) NOT NULL,
            insulin_units DECIMAL(10, 2),
            glucose_before INTEGER,
            glucose_after INTEGER,
            image_url TEXT,
            meal_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
        CREATE INDEX IF NOT EXISTS idx_meals_meal_time ON meals(meal_time);
        CREATE INDEX IF NOT EXISTS idx_meals_category ON meals(category);
EOSQL
    echo "meals_db schema initialized"
}

function init_analytics_db() {
    echo "Initializing analytics_db schema..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=analytics_db <<-EOSQL
        -- Analytics cache table (if needed for future optimization)
        CREATE TABLE IF NOT EXISTS analytics_cache (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            period VARCHAR(20) NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, period)
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_analytics_cache_user_id ON analytics_cache(user_id);
        CREATE INDEX IF NOT EXISTS idx_analytics_cache_period ON analytics_cache(period);
EOSQL
    echo "analytics_db schema initialized"
}

if [ -n "\${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
    echo "Multiple database creation requested: \$POSTGRES_MULTIPLE_DATABASES"
    for db in \$(echo \$POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_database \$db
    done
    echo "Multiple databases created"
    
    # Initialize schemas for each database
    init_auth_db
    init_profiles_db
    init_meals_db
    init_analytics_db
    
    echo "All database schemas initialized successfully"
fi
