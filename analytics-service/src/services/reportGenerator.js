const axios = require('axios');

const MEAL_SERVICE_URL = process.env.MEAL_SERVICE_URL || 'http://meal-tracking:4003';

const getMealsData = async (userId, startDate, endDate) => {
    try {
        const response = await axios.get(`${MEAL_SERVICE_URL}/meals/user/${userId}`, {
            params: { startDate, endDate },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching meals data:', error.message);
        return [];
    }
};

const calculateDailySummary = (meals) => {
    if (!meals || meals.length === 0) {
        return {
            totalCarbs: 0,
            totalInsulin: 0,
            avgGlucose: null,
            minGlucose: null,
            maxGlucose: null,
            mealCount: 0,
        };
    }

    const glucoseReadings = meals
        .map(m => m.glucose_pre)
        .filter(g => g !== null && g !== undefined);

    const totalCarbs = meals.reduce((sum, m) => sum + parseFloat(m.total_carbs || 0), 0);
    const totalInsulin = meals.reduce((sum, m) => sum + parseFloat(m.insulin_dose || 0), 0);
    const avgGlucose = glucoseReadings.length > 0
        ? glucoseReadings.reduce((sum, g) => sum + g, 0) / glucoseReadings.length
        : null;
    const minGlucose = glucoseReadings.length > 0 ? Math.min(...glucoseReadings) : null;
    const maxGlucose = glucoseReadings.length > 0 ? Math.max(...glucoseReadings) : null;

    return {
        totalCarbs: Math.round(totalCarbs * 100) / 100,
        totalInsulin: Math.round(totalInsulin * 100) / 100,
        avgGlucose: avgGlucose ? Math.round(avgGlucose * 100) / 100 : null,
        minGlucose,
        maxGlucose,
        mealCount: meals.length,
    };
};

const calculateTrends = (summaries) => {
    if (!summaries || summaries.length < 2) {
        return { trend: 'insufficient_data' };
    }

    const avgCarbs = summaries.reduce((sum, s) => sum + parseFloat(s.total_carbs || 0), 0) / summaries.length;
    const avgInsulin = summaries.reduce((sum, s) => sum + parseFloat(s.total_insulin || 0), 0) / summaries.length;
    const avgGlucoseValues = summaries
        .map(s => s.avg_glucose)
        .filter(g => g !== null);
    const avgGlucose = avgGlucoseValues.length > 0
        ? avgGlucoseValues.reduce((sum, g) => sum + parseFloat(g), 0) / avgGlucoseValues.length
        : null;

    return {
        avgCarbs: Math.round(avgCarbs * 100) / 100,
        avgInsulin: Math.round(avgInsulin * 100) / 100,
        avgGlucose: avgGlucose ? Math.round(avgGlucose * 100) / 100 : null,
        dataPoints: summaries.length,
    };
};

const detectPatterns = (meals) => {
    const patterns = [];

    // Pattern 1: Frequent high glucose readings
    const highGlucoseCount = meals.filter(m => m.glucose_pre > 180).length;
    if (highGlucoseCount > meals.length * 0.3) {
        patterns.push({
            type: 'high_glucose_frequency',
            description: `${highGlucoseCount} de ${meals.length} lecturas muestran glucemia alta (>180 mg/dL)`,
            severity: 'high',
        });
    }

    // Pattern 2: Frequent low glucose readings
    const lowGlucoseCount = meals.filter(m => m.glucose_pre < 70).length;
    if (lowGlucoseCount > 0) {
        patterns.push({
            type: 'low_glucose_frequency',
            description: `${lowGlucoseCount} episodios de hipoglucemia detectados (<70 mg/dL)`,
            severity: 'high',
        });
    }

    // Pattern 3: High carb intake
    const avgCarbs = meals.reduce((sum, m) => sum + parseFloat(m.total_carbs || 0), 0) / meals.length;
    if (avgCarbs > 60) {
        patterns.push({
            type: 'high_carb_intake',
            description: `Consumo promedio de carbohidratos alto: ${Math.round(avgCarbs)}g por comida`,
            severity: 'medium',
        });
    }

    // Pattern 4: Inconsistent meal times
    const mealsByCategory = {};
    meals.forEach(m => {
        if (!mealsByCategory[m.category]) {
            mealsByCategory[m.category] = [];
        }
        mealsByCategory[m.category].push(new Date(m.created_at).getHours());
    });

    Object.entries(mealsByCategory).forEach(([category, hours]) => {
        if (hours.length > 1) {
            const variance = Math.max(...hours) - Math.min(...hours);
            if (variance > 3) {
                patterns.push({
                    type: 'inconsistent_meal_times',
                    description: `Horarios de ${category} varían hasta ${variance} horas`,
                    severity: 'low',
                });
            }
        }
    });

    return patterns;
};

module.exports = {
    getMealsData,
    calculateDailySummary,
    calculateTrends,
    detectPatterns,
};
