export const calculateInsulinDose = (carbs, ratio) => {
    if (!carbs || !ratio) return 0;

    const ratioMatch = ratio.match(/1:(\d+)/);
    if (!ratioMatch) return 0;

    const carbsPerUnit = parseInt(ratioMatch[1], 10);
    const dose = carbs / carbsPerUnit;

    return Math.round(dose * 10) / 10;
};

export const categorizeMeal = (date = new Date()) => {
    const hour = date.getHours();

    if (hour >= 6 && hour < 11) return 'Desayuno';
    if (hour >= 11 && hour < 16) return 'Almuerzo';
    if (hour >= 16 && hour < 19) return 'Media tarde';
    return 'Cena';
};
