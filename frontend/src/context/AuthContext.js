import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);

            // Load profile
            const profileData = await profileService.getProfile(userData.id);
            setProfile(profileData);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            setLoading(false);
        }
    };

    const login = (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        checkAuth();
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
    };

    const updateProfile = (newProfile) => {
        setProfile(newProfile);
    };

    const value = {
        user,
        profile,
        loading,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        refreshProfile: checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
