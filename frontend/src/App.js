import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SetupWizard from './pages/SetupWizard';
import Dashboard from './pages/Dashboard';
import AddMeal from './pages/AddMeal';
import MealDetail from './pages/MealDetail';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import './index.css';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

const SetupRoute = ({ children }) => {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!profile || !profile.setup_completed) {
        return children;
    }

    return <Navigate to="/dashboard" />;
};

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (user && user.role === 'admin') {
        return children;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6 text-center max-w-md">
                No tienes permisos de administrador para ver esta página.
                Si crees que esto es un error, contacta a soporte o asegúrate de haber iniciado sesión con la cuenta correcta.
            </p>
            <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
                Volver al Dashboard
            </button>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    <Route
                        path="/setup"
                        element={
                            <PrivateRoute>
                                <SetupRoute>
                                    <SetupWizard />
                                </SetupRoute>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <PrivateRoute>
                                <AdminRoute>
                                    <AdminDashboard />
                                </AdminRoute>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/add-meal"
                        element={
                            <PrivateRoute>
                                <AddMeal />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/meal/:id"
                        element={
                            <PrivateRoute>
                                <MealDetail />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/analytics"
                        element={
                            <PrivateRoute>
                                <Analytics />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/" element={<LandingPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

const AuthCallback = () => {
    const { login } = useAuth();

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
            login(accessToken, refreshToken);
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/login';
        }
    }, [login]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );
};

export default App;
