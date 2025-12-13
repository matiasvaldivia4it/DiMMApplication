/**
 * Calculate insulin dose based on carbohydrates and user's insulin ratio
 * @param {number} carbs - Total carbohydrates in grams
 * @param {string} ratio - Insulin ratio (e.g., "1:10", "1:15")
 * @returns {number} - Insulin dose in units
 */
const calculateInsulinDose = (carbs, ratio) => {
    if (!carbs || !ratio) {
        return 0;
    }

    // Parse ratio (e.g., "1:10" means 1 unit per 10g carbs)
    const ratioMatch = ratio.match(/1:(\d+)/);
    if (!ratioMatch) {
        throw new Error('Invalid insulin ratio format');
    }

    const carbsPerUnit = parseInt(ratioMatch[1], 10);
    const dose = carbs / carbsPerUnit;

    // Round to 1 decimal place
    return Math.round(dose * 10) / 10;
};

/**
 * Categorize meal based on time
 * @param {Date} date - Meal date/time
 * @returns {string} - Meal category
 */
const categorizeMeal = (date = new Date()) => {
    const hour = date.getHours();

    if (hour >= 6 && hour < 11) {
        return 'Desayuno';
    } else if (hour >= 11 && hour < 16) {
        return 'Almuerzo';
    } else if (hour >= 16 && hour < 19) {
        return 'Media tarde';
    } else {
        return 'Cena';
    }
};

module.exports = {
    calculateInsulinDose,
    categorizeMeal,
};
