const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');

const router = express.Router();

// Validation schemas
const setupProfileSchema = Joi.object({
    userId: Joi.number().required(),
    insulinRatio: Joi.string().valid('1:10', '1:15', '1:20', '1:25', '1:30').required(),
    glucoseMin: Joi.number().min(50).max(100).required(),
    glucoseMax: Joi.number().min(100).max(200).required(),
    mealSchedules: Joi.array().items(
        Joi.object({
            mealType: Joi.string().valid('Desayuno', 'Almuerzo', 'Media tarde', 'Cena').required(),
            preferredTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/).required(),
        })
    ).min(1),
});

const updateProfileSchema = Joi.object({
    insulinRatio: Joi.string().valid('1:10', '1:15', '1:20', '1:25', '1:30'),
    glucoseMin: Joi.number().min(50).max(100),
    glucoseMax: Joi.number().min(100).max(200),
});

// Initial profile setup
router.post('/setup', async (req, res) => {
    try {
        const { error, value } = setupProfileSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { userId, insulinRatio, glucoseMin, glucoseMax, mealSchedules } = value;
        console.log(`[Profile Setup] Received request for userId: ${userId}`);

        const client = await pool.connect();
        try {
            console.log(`[Profile Setup] Database connection acquired for userId: ${userId}`);
            console.log('Starting transaction for user:', userId);
            await client.query('BEGIN');

            // Check if profile already exists
            console.log('Checking existing profile...');
            const existing = await client.query('SELECT id FROM profiles WHERE user_id = $1', [userId]);

            let profileId;
            if (existing.rows.length > 0) {
                // Update existing profile
                const result = await client.query(
                    `UPDATE profiles 
           SET insulin_ratio = $1, glucose_min = $2, glucose_max = $3, setup_completed = TRUE, updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $4
           RETURNING id`,
                    [insulinRatio, glucoseMin, glucoseMax, userId]
                );
                profileId = result.rows[0].id;

                // Delete old meal schedules
                await client.query('DELETE FROM meal_schedules WHERE profile_id = $1', [profileId]);
            } else {
                // Create new profile
                const result = await client.query(
                    `INSERT INTO profiles (user_id, insulin_ratio, glucose_min, glucose_max, setup_completed)
           VALUES ($1, $2, $3, $4, TRUE)
           RETURNING id`,
                    [userId, insulinRatio, glucoseMin, glucoseMax]
                );
                profileId = result.rows[0].id;
            }

            // Insert meal schedules
            if (mealSchedules && mealSchedules.length > 0) {
                for (const schedule of mealSchedules) {
                    await client.query(
                        'INSERT INTO meal_schedules (profile_id, meal_type, preferred_time) VALUES ($1, $2, $3)',
                        [profileId, schedule.mealType, schedule.preferredTime]
                    );
                }
            }

            await client.query('COMMIT');

            const profile = await getProfileByUserId(userId);
            res.status(201).json(profile);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error setting up profile:', error);
        res.status(500).json({ error: 'Failed to setup profile' });
    }
});

// Get profile by user ID
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await getProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error getting profile:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update profile
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { error, value } = updateProfileSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { insulinRatio, glucoseMin, glucoseMax } = value;

        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (insulinRatio !== undefined) {
            updates.push(`insulin_ratio = $${paramIndex}`);
            params.push(insulinRatio);
            paramIndex++;
        }

        if (glucoseMin !== undefined) {
            updates.push(`glucose_min = $${paramIndex}`);
            params.push(glucoseMin);
            paramIndex++;
        }

        if (glucoseMax !== undefined) {
            updates.push(`glucose_max = $${paramIndex}`);
            params.push(glucoseMax);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(userId);

        const query = `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = $${paramIndex} RETURNING id`;
        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        const profile = await getProfileByUserId(userId);
        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update insulin ratio (with history tracking)
router.put('/:userId/ratio', async (req, res) => {
    try {
        const { userId } = req.params;
        const { insulinRatio } = req.body;

        if (!insulinRatio || !['1:10', '1:15', '1:20', '1:25', '1:30'].includes(insulinRatio)) {
            return res.status(400).json({ error: 'Invalid insulin ratio' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Get current profile
            const profileResult = await client.query(
                'SELECT id, insulin_ratio FROM profiles WHERE user_id = $1',
                [userId]
            );

            if (profileResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Profile not found' });
            }

            const profile = profileResult.rows[0];
            const oldRatio = profile.insulin_ratio;

            // Update ratio
            await client.query(
                'UPDATE profiles SET insulin_ratio = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [insulinRatio, profile.id]
            );

            // Add to history
            await client.query(
                'INSERT INTO ratio_history (profile_id, old_ratio, new_ratio) VALUES ($1, $2, $3)',
                [profile.id, oldRatio, insulinRatio]
            );

            await client.query('COMMIT');

            const updatedProfile = await getProfileByUserId(userId);
            res.json(updatedProfile);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating insulin ratio:', error);
        res.status(500).json({ error: 'Failed to update insulin ratio' });
    }
});

// Get ratio history
router.get('/:userId/ratio/history', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT rh.* 
       FROM ratio_history rh
       JOIN profiles p ON rh.profile_id = p.id
       WHERE p.user_id = $1
       ORDER BY rh.changed_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error getting ratio history:', error);
        res.status(500).json({ error: 'Failed to get ratio history' });
    }
});

// Helper function
async function getProfileByUserId(userId) {
    const result = await pool.query(
        `SELECT p.*,
            json_agg(
              json_build_object(
                'id', ms.id,
                'mealType', ms.meal_type,
                'preferredTime', ms.preferred_time
              )
            ) FILTER (WHERE ms.id IS NOT NULL) as meal_schedules
     FROM profiles p
     LEFT JOIN meal_schedules ms ON p.id = ms.profile_id
     WHERE p.user_id = $1
     GROUP BY p.id`,
        [userId]
    );

    return result.rows[0] || null;
}

module.exports = router;
