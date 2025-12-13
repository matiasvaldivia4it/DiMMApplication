export const getGlucoseColor = (glucose) => {
    if (!glucose) return 'gray';
    if (glucose < 70) return 'glucose-low';
    if (glucose <= 140) return 'glucose-normal';
    if (glucose <= 180) return 'glucose-elevated';
    return 'glucose-high';
};

export const getGlucoseLabel = (glucose) => {
    if (!glucose) return 'Sin datos';
    if (glucose < 70) return 'Bajo';
    if (glucose <= 140) return 'Normal';
    if (glucose <= 180) return 'Elevado';
    return 'Alto';
};

export const getGlucoseColorClass = (glucose) => {
    if (!glucose) return 'bg-gray-100 text-gray-800';
    if (glucose < 70) return 'bg-blue-100 text-blue-800';
    if (glucose <= 140) return 'bg-green-100 text-green-800';
    if (glucose <= 180) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
};
