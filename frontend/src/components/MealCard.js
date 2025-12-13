import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlucoseIndicator from './GlucoseIndicator';

const MealCard = ({ meal, onUpdate }) => {
    const navigate = useNavigate();

    const handleAppliedToggle = async () => {
        if (onUpdate) {
            await onUpdate(meal.id, { applied: !meal.applied });
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Desayuno': '🌅',
            'Almuerzo': '☀️',
            'Media tarde': '🌤️',
            'Cena': '🌙',
        };
        return icons[category] || '🍽️';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div
            onClick={() => navigate(`/meal/${meal.id}`)}
            className="card cursor-pointer hover:scale-[1.02] transition-transform"
        >
            <div className="flex gap-4">
                {meal.image_url && (
                    <img
                        src={meal.image_url}
                        alt="Meal"
                        className="w-20 h-20 rounded-lg object-cover"
                    />
                )}

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">{getCategoryIcon(meal.category)}</span>
                            <div>
                                <h3 className="font-semibold text-gray-900">{meal.category}</h3>
                                <p className="text-xs text-gray-500">{formatDate(meal.created_at)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-xs text-blue-600 font-medium">Carbohidratos</p>
                            <p className="text-lg font-bold text-blue-900">{meal.total_carbs}g</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2">
                            <p className="text-xs text-purple-600 font-medium">Insulina</p>
                            <p className="text-lg font-bold text-purple-900">{meal.insulin_dose}u</p>
                        </div>
                    </div>

                    {meal.glucose_pre && (
                        <div className="mb-2">
                            <GlucoseIndicator glucose={meal.glucose_pre} size="sm" />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            {meal.foods && meal.foods.length > 0 && (
                                <span>{meal.foods.length} alimento(s)</span>
                            )}
                        </div>
                        <label
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAppliedToggle();
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={meal.applied}
                                onChange={() => { }}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">Dosis aplicada</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealCard;
