import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';

const SetupWizard = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        insulinRatio: '1:15',
        glucoseMin: 70,
        glucoseMax: 140,
        mealSchedules: [
            { mealType: 'Desayuno', preferredTime: '08:00' },
            { mealType: 'Almuerzo', preferredTime: '13:00' },
            { mealType: 'Media tarde', preferredTime: '17:00' },
            { mealType: 'Cena', preferredTime: '20:00' },
        ],
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const profile = await profileService.setupProfile({
                userId: user.id,
                ...formData,
            });
            updateProfile(profile);
            navigate('/dashboard');
        } catch (error) {
            console.error('Setup failed:', error);
            alert('Error al configurar el perfil. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const updateMealSchedule = (index, field, value) => {
        const newSchedules = [...formData.mealSchedules];
        newSchedules[index][field] = value;
        setFormData({ ...formData, mealSchedules: newSchedules });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="card animate-slide-up">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Configuración Inicial
                        </h1>
                        <p className="text-gray-600">
                            Paso {step} de 3 - Personaliza tu experiencia
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        ℹ️ Esta información nos ayudará a calcular tus dosis de insulina de forma más precisa.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ratio de Insulina a Carbohidratos
                                    </label>
                                    <p className="text-sm text-gray-600 mb-3">
                                        ¿Cuántos gramos de carbohidratos cubre 1 unidad de insulina?
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {['1:10', '1:15', '1:20', '1:25', '1:30'].map((ratio) => (
                                            <button
                                                key={ratio}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, insulinRatio: ratio })}
                                                className={`py-3 px-4 rounded-lg font-semibold transition-all ${formData.insulinRatio === ratio
                                                        ? 'bg-primary-600 text-white shadow-lg'
                                                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-400'
                                                    }`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Ejemplo: 1:15 significa que 1 unidad de insulina cubre 15g de carbohidratos
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="btn-primary"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Rango Objetivo de Glucemia (mg/dL)
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Mínimo</label>
                                            <input
                                                type="number"
                                                value={formData.glucoseMin}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, glucoseMin: parseInt(e.target.value) })
                                                }
                                                className="input-field"
                                                min="50"
                                                max="100"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-600 mb-1">Máximo</label>
                                            <input
                                                type="number"
                                                value={formData.glucoseMax}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, glucoseMax: parseInt(e.target.value) })
                                                }
                                                className="input-field"
                                                min="100"
                                                max="200"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Rango recomendado: 70-140 mg/dL
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="btn-secondary"
                                    >
                                        ← Anterior
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setStep(3)}
                                        className="btn-primary"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Horarios Preferidos de Comidas
                                    </label>
                                    <div className="space-y-3">
                                        {formData.mealSchedules.map((schedule, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="w-32">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {schedule.mealType}
                                                    </span>
                                                </div>
                                                <input
                                                    type="time"
                                                    value={schedule.preferredTime}
                                                    onChange={(e) =>
                                                        updateMealSchedule(index, 'preferredTime', e.target.value)
                                                    }
                                                    className="input-field"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Estos horarios se usarán para recordatorios y categorización automática
                                    </p>
                                </div>

                                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Recuerda: Los valores sugeridos son estimaciones. Consulta siempre con tu médico antes de realizar cambios en tu tratamiento.
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="btn-secondary"
                                    >
                                        ← Anterior
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary disabled:opacity-50"
                                    >
                                        {loading ? 'Guardando...' : 'Completar Configuración'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;
