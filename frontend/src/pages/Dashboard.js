import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mealService, analyticsService } from '../services';
import MealCard from '../components/MealCard';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, profile, logout } = useAuth();
    const [meals, setMeals] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [mealsData, summaryData] = await Promise.all([
                mealService.getMeals(user.id),
                analyticsService.getSummary(user.id, 'daily'),
            ]);
            setMeals(mealsData);
            setSummary(summaryData.summary);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMealUpdate = async (mealId, updates) => {
        try {
            await mealService.updateMeal(mealId, updates);
            loadData();
        } catch (error) {
            console.error('Error updating meal:', error);
        }
    };

    const filteredMeals = filter === 'all'
        ? meals
        : meals.filter((m) => m.category === filter);

    const categories = ['Desayuno', 'Almuerzo', 'Media tarde', 'Cena'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="gradient-primary text-white p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Hola, {user?.name?.split(' ')[0]}</h1>
                            <p className="text-blue-100">Ratio: {profile?.insulin_ratio}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/analytics')}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
                            >
                                📊
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
                            >
                                ⚙️
                            </button>
                        </div>
                    </div>

                    {/* Daily Summary */}
                    {summary && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                <p className="text-xs text-blue-100">Comidas</p>
                                <p className="text-2xl font-bold">{summary.mealCount}</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                <p className="text-xs text-blue-100">Carbohidratos</p>
                                <p className="text-2xl font-bold">{summary.totalCarbs}g</p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                                <p className="text-xs text-blue-100">Insulina</p>
                                <p className="text-2xl font-bold">{summary.totalInsulin}u</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${filter === 'all'
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 border-2 border-gray-200'
                            }`}
                    >
                        Todas
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${filter === category
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white text-gray-700 border-2 border-gray-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Meals List */}
            <div className="max-w-4xl mx-auto px-4">
                {filteredMeals.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No hay comidas registradas
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Comienza agregando tu primera comida
                        </p>
                        <button
                            onClick={() => navigate('/add-meal')}
                            className="btn-primary"
                        >
                            Agregar Comida
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMeals.map((meal) => (
                            <MealCard key={meal.id} meal={meal} onUpdate={handleMealUpdate} />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => navigate('/add-meal')}
                className="fixed bottom-6 right-6 w-16 h-16 gradient-primary text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform active:scale-95"
            >
                +
            </button>
        </div>
    );
};

export default Dashboard;
