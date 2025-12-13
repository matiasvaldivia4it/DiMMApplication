import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';

const Profile = () => {
    const navigate = useNavigate();
    const { user, profile, logout, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [insulinRatio, setInsulinRatio] = useState(profile?.insulin_ratio || '1:15');
    const [saving, setSaving] = useState(false);

    const handleSaveRatio = async () => {
        setSaving(true);
        try {
            const updatedProfile = await profileService.updateInsulinRatio(user.id, insulinRatio);
            updateProfile(updatedProfile);
            setEditing(false);
        } catch (error) {
            console.error('Error updating ratio:', error);
            alert('Error al actualizar el ratio');
        } finally {
            setSaving(false);
        }
    };

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
                    <h1 className="text-2xl font-bold">Perfil</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                <div className="card">
                    <div className="flex items-center gap-4 mb-4">
                        {user?.picture && (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-20 h-20 rounded-full"
                            />
                        )}
                        <div>
                            <h2 className="text-2xl font-bold">{user?.name}</h2>
                            <p className="text-gray-600">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Configuración de Insulina</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ratio de Insulina a Carbohidratos
                        </label>

                        {editing ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                    {['1:10', '1:15', '1:20', '1:25', '1:30'].map((ratio) => (
                                        <button
                                            key={ratio}
                                            type="button"
                                            onClick={() => setInsulinRatio(ratio)}
                                            className={`py-3 px-4 rounded-lg font-semibold transition-all ${insulinRatio === ratio
                                                    ? 'bg-primary-600 text-white shadow-lg'
                                                    : 'bg-white text-gray-700 border-2 border-gray-300'
                                                }`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setEditing(false)}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveRatio}
                                        disabled={saving}
                                        className="btn-primary flex-1"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-2xl font-bold text-primary-600">
                                        {profile?.insulin_ratio}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        1 unidad por {profile?.insulin_ratio?.split(':')[1]}g de carbohidratos
                                    </p>
                                </div>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="btn-secondary"
                                >
                                    Editar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Consulta con tu médico antes de cambiar tu ratio de insulina
                        </p>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Rango de Glucemia Objetivo</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Mínimo</p>
                            <p className="text-2xl font-bold text-gray-900">{profile?.glucose_min} mg/dL</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Máximo</p>
                            <p className="text-2xl font-bold text-gray-900">{profile?.glucose_max} mg/dL</p>
                        </div>
                    </div>
                </div>

                {profile?.meal_schedules && profile.meal_schedules.length > 0 && (
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Horarios de Comidas</h3>
                        <div className="space-y-2">
                            {profile.meal_schedules.map((schedule, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="font-medium">{schedule.mealType}</span>
                                    <span className="text-gray-600">{schedule.preferredTime}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={logout}
                    className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default Profile;
