import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mealService } from '../services';
import GlucoseIndicator from '../components/GlucoseIndicator';

const MealDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [glucosePost, setGlucosePost] = useState('');

    useEffect(() => {
        loadMeal();
    }, [id]);

    const loadMeal = async () => {
        try {
            const data = await mealService.getMeal(id);
            setMeal(data);
            setGlucosePost(data.glucose_post || '');
        } catch (error) {
            console.error('Error loading meal:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGlucosePost = async () => {
        try {
            await mealService.updateMeal(id, {
                glucosePost: parseInt(glucosePost),
            });
            loadMeal();
        } catch (error) {
            console.error('Error updating glucose:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de eliminar esta comida?')) {
            try {
                await mealService.deleteMeal(id);
                navigate('/dashboard');
            } catch (error) {
                console.error('Error deleting meal:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Comida no encontrada</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            <div className="gradient-primary text-white p-6">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold">Detalle de Comida</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {meal.image_url && (
                    <div className="card">
                        <img
                            src={meal.image_url}
                            alt="Meal"
                            className="w-full rounded-lg"
                        />
                    </div>
                )}

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">{meal.category}</h2>
                    <p className="text-gray-600 mb-4">
                        {new Date(meal.created_at).toLocaleString('es-ES', {
                            dateStyle: 'full',
                            timeStyle: 'short',
                        })}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 font-medium">Carbohidratos</p>
                            <p className="text-3xl font-bold text-blue-900">{meal.total_carbs}g</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-600 font-medium">Insulina</p>
                            <p className="text-3xl font-bold text-purple-900">{meal.insulin_dose}u</p>
                        </div>
                    </div>
                </div>

                {meal.foods && meal.foods.length > 0 && (
                    <div className="card">
                        <h3 className="font-semibold mb-3">Alimentos Identificados</h3>
                        <div className="space-y-2">
                            {meal.foods.map((food, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">{food.name}</p>
                                        <p className="text-sm text-gray-600">{food.quantity}</p>
                                    </div>
                                    <p className="font-bold text-primary-600">{food.carbs}g</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="card">
                    <h3 className="font-semibold mb-3">Glucemia</h3>

                    {meal.glucose_pre && (
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Preprandial</p>
                            <GlucoseIndicator glucose={meal.glucose_pre} />
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-gray-600 mb-2">Postprandial (2 horas después)</p>
                        {meal.glucose_post ? (
                            <GlucoseIndicator glucose={meal.glucose_post} />
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={glucosePost}
                                    onChange={(e) => setGlucosePost(e.target.value)}
                                    placeholder="Ingresa glucemia postprandial"
                                    className="input-field flex-1"
                                />
                                <button
                                    onClick={handleUpdateGlucosePost}
                                    className="btn-primary"
                                >
                                    Guardar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {meal.notes && (
                    <div className="card">
                        <h3 className="font-semibold mb-2">Notas</h3>
                        <p className="text-gray-700">{meal.notes}</p>
                    </div>
                )}

                <button
                    onClick={handleDelete}
                    className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                >
                    Eliminar Comida
                </button>
            </div>
        </div>
    );
};

export default MealDetail;
