const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const { calculateInsulinDose, categorizeMeal } = require('../services/insulinCalculator');

const router = express.Router();

// Validation schemas
const createMealSchema = Joi.object({
    userId: Joi.number().required(),
    imageUrl: Joi.string().uri().allow(null),
    category: Joi.string().valid('Desayuno', 'Almuerzo', 'Media tarde', 'Cena'),
    totalCarbs: Joi.number().min(0).required(),
    insulinRatio: Joi.string().pattern(/^1:\d+$/).required(),
    glucosePre: Joi.number().min(0).allow(null),
    glucosePost: Joi.number().min(0).allow(null),
    foods: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            carbs: Joi.number().min(0).required(),
            quantity: Joi.string().allow(null),
        })
    ),
    notes: Joi.string().allow('', null),
});

// Create meal
router.post('/', async (req, res) => {
    try {
        const { error, value } = createMealSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const {
            userId,
            imageUrl,
            category,
            totalCarbs,
            insulinRatio,
            glucosePre,
            glucosePost,
            foods,
            notes,
        } = value;

        // Calculate insulin dose
        const insulinDose = calculateInsulinDose(totalCarbs, insulinRatio);

        // Auto-categorize if not provided
        const mealCategory = category || categorizeMeal();

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert meal
            const mealResult = await client.query(
                `INSERT INTO meals (user_id, image_url, category, total_carbs, insulin_dose, glucose_pre, glucose_post, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
                [userId, imageUrl, mealCategory, totalCarbs, insulinDose, glucosePre, glucosePost, notes]
            );

            const meal = mealResult.rows[0];

            // Insert food items
            if (foods && foods.length > 0) {
                for (const food of foods) {
                    await client.query(
                        'INSERT INTO food_items (meal_id, name, carbs, quantity) VALUES ($1, $2, $3, $4)',
                        [meal.id, food.name, food.carbs, food.quantity]
                    );
                }
            }

            await client.query('COMMIT');

            // Get complete meal with foods
            const completeMeal = await getMealById(meal.id);
            res.status(201).json(completeMeal);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating meal:', error);
        res.status(500).json({ error: 'Failed to create meal' });
    }
});

// Get meals for user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, category } = req.query;

        let query = `
      SELECT m.*, 
             json_agg(
               json_build_object(
                 'id', f.id,
                 'name', f.name,
                 'carbs', f.carbs,
                 'quantity', f.quantity
               )
             ) FILTER (WHERE f.id IS NOT NULL) as foods
      FROM meals m
      LEFT JOIN food_items f ON m.id = f.meal_id
      WHERE m.user_id = $1
    `;

        const params = [userId];
        let paramIndex = 2;

        if (startDate) {
            query += ` AND m.created_at >= $${paramIndex}`;
            params.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            query += ` AND m.created_at <= $${paramIndex}`;
            params.push(endDate);
            paramIndex++;
        }

        if (category) {
            query += ` AND m.category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        query += ' GROUP BY m.id ORDER BY m.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error getting meals:', error);
        res.status(500).json({ error: 'Failed to get meals' });
    }
});

// Get single meal
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const meal = await getMealById(id);

        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json(meal);
    } catch (error) {
        console.error('Error getting meal:', error);
        res.status(500).json({ error: 'Failed to get meal' });
    }
});

// Update meal
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { glucosePost, applied, notes } = req.body;

        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (glucosePost !== undefined) {
            updates.push(`glucose_post = $${paramIndex}`);
            params.push(glucosePost);
            paramIndex++;
        }

        if (applied !== undefined) {
            updates.push(`applied = $${paramIndex}`);
            params.push(applied);
            paramIndex++;
        }

        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex}`);
            params.push(notes);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        params.push(id);

        const query = `UPDATE meals SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        const meal = await getMealById(id);
        res.json(meal);
    } catch (error) {
        console.error('Error updating meal:', error);
        res.status(500).json({ error: 'Failed to update meal' });
    }
});

// Delete meal
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM meals WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json({ success: true, message: 'Meal deleted' });
    } catch (error) {
        console.error('Error deleting meal:', error);
        res.status(500).json({ error: 'Failed to delete meal' });
    }
});

// Helper function to get meal with foods
async function getMealById(id) {
    const result = await pool.query(
        `SELECT m.*, 
            json_agg(
              json_build_object(
                'id', f.id,
                'name', f.name,
                'carbs', f.carbs,
                'quantity', f.quantity
              )
            ) FILTER (WHERE f.id IS NOT NULL) as foods
     FROM meals m
     LEFT JOIN food_items f ON m.id = f.meal_id
     WHERE m.id = $1
     GROUP BY m.id`,
        [id]
    );

    return result.rows[0] || null;
}

module.exports = router;
