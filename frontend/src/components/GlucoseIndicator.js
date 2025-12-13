import React from 'react';
import { getGlucoseColorClass, getGlucoseLabel } from '../utils/glucoseColors';

const GlucoseIndicator = ({ glucose, size = 'md', showLabel = true }) => {
    const colorClass = getGlucoseColorClass(glucose);
    const label = getGlucoseLabel(glucose);

    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2',
    };

    return (
        <span className={`glucose-badge ${colorClass} ${sizeClasses[size]}`}>
            {glucose ? `${glucose} mg/dL` : 'Sin datos'}
            {showLabel && glucose && ` - ${label}`}
        </span>
    );
};

export default GlucoseIndicator;
