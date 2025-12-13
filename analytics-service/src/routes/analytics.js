const express = require('express');
const { pool } = require('../config/database');
const { getMealsData, calculateDailySummary, calculateTrends, detectPatterns } = require('../services/reportGenerator');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const router = express.Router();

// Get daily/weekly summary
router.get('/summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { period = 'daily', date } = req.query;

        let startDate, endDate;
        const targetDate = date ? new Date(date) : new Date();

        if (period === 'daily') {
            startDate = new Date(targetDate);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(targetDate);
            endDate.setHours(23, 59, 59, 999);
        } else if (period === 'weekly') {
            startDate = new Date(targetDate);
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date(targetDate);
        } else if (period === 'monthly') {
            startDate = new Date(targetDate);
            startDate.setDate(startDate.getDate() - 30);
            endDate = new Date(targetDate);
        }

        const meals = await getMealsData(userId, startDate.toISOString(), endDate.toISOString());
        const summary = calculateDailySummary(meals);

        res.json({
            period,
            startDate,
            endDate,
            summary,
            meals: meals.length,
        });
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({ error: 'Failed to get summary' });
    }
});

// Get glucose trends
router.get('/trends/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const meals = await getMealsData(userId, startDate.toISOString(), endDate.toISOString());

        // Group by date
        const dailyData = {};
        meals.forEach(meal => {
            const date = new Date(meal.created_at).toISOString().split('T')[0];
            if (!dailyData[date]) {
                dailyData[date] = [];
            }
            dailyData[date].push(meal);
        });

        const summaries = Object.entries(dailyData).map(([date, dayMeals]) => ({
            date,
            ...calculateDailySummary(dayMeals),
        }));

        const trends = calculateTrends(summaries);

        res.json({
            period: `${days} days`,
            dailySummaries: summaries,
            trends,
        });
    } catch (error) {
        console.error('Error getting trends:', error);
        res.status(500).json({ error: 'Failed to get trends' });
    }
});

// Get correlations
router.get('/correlations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const meals = await getMealsData(userId, startDate.toISOString(), endDate.toISOString());

        // Filter meals with both pre and post glucose readings
        const completeMeals = meals.filter(m => m.glucose_pre && m.glucose_post);

        const correlations = completeMeals.map(meal => ({
            date: meal.created_at,
            category: meal.category,
            carbs: parseFloat(meal.total_carbs),
            insulin: parseFloat(meal.insulin_dose),
            glucosePre: meal.glucose_pre,
            glucosePost: meal.glucose_post,
            glucoseDelta: meal.glucose_post - meal.glucose_pre,
        }));

        res.json({
            period: `${days} days`,
            dataPoints: correlations.length,
            correlations,
        });
    } catch (error) {
        console.error('Error getting correlations:', error);
        res.status(500).json({ error: 'Failed to get correlations' });
    }
});

// Detect patterns
router.get('/patterns/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const meals = await getMealsData(userId, startDate.toISOString(), endDate.toISOString());
        const patterns = detectPatterns(meals);

        // Save patterns to database
        for (const pattern of patterns) {
            await pool.query(
                'INSERT INTO patterns (user_id, pattern_type, description, severity) VALUES ($1, $2, $3, $4)',
                [userId, pattern.type, pattern.description, pattern.severity]
            );
        }

        res.json({
            period: `${days} days`,
            patterns,
        });
    } catch (error) {
        console.error('Error detecting patterns:', error);
        res.status(500).json({ error: 'Failed to detect patterns' });
    }
});

// Export to PDF
router.get('/export/:userId/pdf', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const meals = await getMealsData(userId, startDate.toISOString(), endDate.toISOString());
        const summary = calculateDailySummary(meals);

        // Create PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=diabetes-report-${userId}.pdf`);

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Diabetes', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Período: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
        doc.moveDown();

        doc.fontSize(16).text('Resumen');
        doc.fontSize(12);
        doc.text(`Total de comidas: ${summary.mealCount}`);
        doc.text(`Carbohidratos totales: ${summary.totalCarbs}g`);
        doc.text(`Insulina total: ${summary.totalInsulin} unidades`);
        doc.text(`Glucemia promedio: ${summary.avgGlucose || 'N/A'} mg/dL`);
        doc.text(`Glucemia mínima: ${summary.minGlucose || 'N/A'} mg/dL`);
        doc.text(`Glucemia máxima: ${summary.maxGlucose || 'N/A'} mg/dL`);

        doc.moveDown();
        doc.fontSize(10).text('Este reporte es solo informativo. Consulta con tu médico.', { align: 'center' });

        doc.end();
    } catch (error) {
        console.error('Error exporting PDF:', error);
        res.status(500).json({ error: 'Failed to export PDF' });
    }
});

// Export to CSV
router.get('/export/:userId/csv', async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30 } = req.query;

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const meals = await getMealsData(userId, startDate.toISOString(), endDate.toISOString());

        const fields = ['created_at', 'category', 'total_carbs', 'insulin_dose', 'glucose_pre', 'glucose_post'];
        const parser = new Parser({ fields });
        const csv = parser.parse(meals);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=diabetes-data-${userId}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
});

module.exports = router;
