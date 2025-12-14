const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { pool } = require('./database');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, emails, displayName, photos } = profile;
                const email = emails[0].value;
                const picture = photos && photos[0] ? photos[0].value : null;

                // Determine role based on ADMIN_EMAIL env var
                const isAdmin = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL;
                const role = isAdmin ? 'admin' : 'user';

                // Check if user exists
                let result = await pool.query(
                    'SELECT * FROM users WHERE google_id = $1',
                    [id]
                );

                let user;
                if (result.rows.length === 0) {
                    // Create new user
                    result = await pool.query(
                        'INSERT INTO users (google_id, email, name, picture, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                        [id, email, displayName, picture, role]
                    );
                    user = result.rows[0];
                } else {
                    // Update existing user
                    // Always re-check admin status on login to ensure consistency with env var
                    const updateQuery = isAdmin
                        ? 'UPDATE users SET name = $1, picture = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE google_id = $4 RETURNING *'
                        : 'UPDATE users SET name = $1, picture = $2, updated_at = CURRENT_TIMESTAMP WHERE google_id = $3 RETURNING *';

                    const updateParams = isAdmin
                        ? [displayName, picture, 'admin', id]
                        : [displayName, picture, id];

                    result = await pool.query(updateQuery, updateParams);
                    user = result.rows[0];
                }

                // Check if user is active
                if (!user.is_active) {
                    return done(null, false, { message: 'Account is deactivated' });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
