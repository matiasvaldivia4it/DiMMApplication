import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { foodService, mealService } from '../services';
import { calculateInsulinDose, categorizeMeal } from '../utils/insulinCalculator';

const AddMeal = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const fileInputRef = useRef(null);

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [glucosePre, setGlucosePre] = useState('');
    const [glucosePost, setGlucosePost] = useState('');
    const [notes, setNotes] = useState('');

    const handleImageCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;

        setAnalyzing(true);
        try {
            const result = await foodService.analyzeFood(image, user.id);
            setAnalysis(result.analysis);
        } catch (error) {
            console.error('Error analyzing food:', error);
            alert('Error al analizar la imagen. Por favor intenta de nuevo.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!analysis) return;

        setSaving(true);
        try {
            const insulinDose = calculateInsulinDose(
                analysis.totalCarbohydrates,
                profile.insulin_ratio
            );

            const mealData = {
                userId: user.id,
                imageUrl: analysis.imageUrl || null,
                category: categorizeMeal(),
                totalCarbs: analysis.totalCarbohydrates,
                insulinRatio: profile.insulin_ratio,
                glucosePre: glucosePre ? parseInt(glucosePre) : null,
                glucosePost: glucosePost ? parseInt(glucosePost) : null,
                foods: analysis.foods,
                notes,
            };

            await mealService.createMeal(mealData);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving meal:', error);
            alert('Error al guardar la comida. Por favor intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    const insulinDose = analysis
        ? calculateInsulinDose(analysis.totalCarbohydrates, profile.insulin_ratio)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50 pb-6">
            {/* Header */}
            <div className="gradient-primary text-white p-6">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                    >
                        ←
                    </button>
                    <h1 className="text-2xl font-bold">Agregar Comida</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Camera Capture */}
                <div className="card">
                    <h2 className="text-lg font-semibold mb-4">Foto de la Comida</h2>

                    {!imagePreview ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-4 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary-400 transition"
                        >
                            <div className="text-6xl mb-4">📸</div>
                            <p className="text-gray-600 font-medium">
                                Toca para tomar una foto o seleccionar una imagen
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full rounded-lg"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview(null);
                                        setAnalysis(null);
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Cambiar Foto
                                </button>
                                {!analysis && (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={analyzing}
                                        className="btn-primary flex-1"
                                    >
                                        {analyzing ? 'Analizando...' : 'Analizar Comida'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageCapture}
                        className="hidden"
                    />
                </div>

                {/* Analysis Results */}
                {analysis && (
                    <>
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Análisis de Alimentos</h2>

                            <div className="space-y-3 mb-4">
                                {analysis.foods.map((food, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">{food.name}</p>
                                            <p className="text-sm text-gray-600">{food.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-600">{food.carbohydrates}g</p>
                                            <p className="text-xs text-gray-500">carbohidratos</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-primary-900">
                                        Total de Carbohidratos
                                    </span>
                                    <span className="text-2xl font-bold text-primary-600">
                                        {analysis.totalCarbohydrates}g
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Confianza del análisis: {analysis.confidence}
                            </p>
                        </div>

                        {/* Insulin Calculation */}
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Dosis de Insulina</h2>

                            <div className="p-6 gradient-primary text-white rounded-lg text-center">
                                <p className="text-sm mb-2">Dosis Sugerida</p>
                                <p className="text-5xl font-bold mb-2">{insulinDose}</p>
                                <p className="text-sm">unidades de insulina</p>
                                <p className="text-xs mt-3 text-blue-100">
                                    Basado en ratio {profile.insulin_ratio}
                                </p>
                            </div>

                            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ <strong>Valor sugerido.</strong> Consulta con tu médico antes de aplicar.
                                </p>
                            </div>
                        </div>

                        {/* Glucose Readings */}
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Glucemia</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preprandial (mg/dL)
                                    </label>
                                    <input
                                        type="number"
                                        value={glucosePre}
                                        onChange={(e) => setGlucosePre(e.target.value)}
                                        placeholder="Ej: 120"
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Postprandial (opcional)
                                    </label>
                                    <input
                                        type="number"
                                        value={glucosePost}
                                        onChange={(e) => setGlucosePost(e.target.value)}
                                        placeholder="Ej: 140"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Notas (opcional)</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Agrega cualquier observación..."
                                className="input-field resize-none"
                                rows="3"
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Comida'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddMeal;
