const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./database');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, emails, displayName, photos } = profile;
                const email = emails[0].value;
                const picture = photos && photos[0] ? photos[0].value : null;

                // Check if user exists
                let result = await pool.query(
                    'SELECT * FROM users WHERE google_id = $1',
                    [id]
                );

                let user;
                if (result.rows.length === 0) {
                    // Create new user
                    result = await pool.query(
                        'INSERT INTO users (google_id, email, name, picture) VALUES ($1, $2, $3, $4) RETURNING *',
                        [id, email, displayName, picture]
                    );
                    user = result.rows[0];
                } else {
                    // Update existing user
                    result = await pool.query(
                        'UPDATE users SET name = $1, picture = $2, updated_at = CURRENT_TIMESTAMP WHERE google_id = $3 RETURNING *',
                        [displayName, picture, id]
                    );
                    user = result.rows[0];
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
