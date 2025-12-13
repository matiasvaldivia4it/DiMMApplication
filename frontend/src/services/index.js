import api from './api';

export const authService = {
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    verifyToken: async () => {
        const response = await api.get('/auth/verify');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    },
};

export const profileService = {
    getProfile: async (userId) => {
        const response = await api.get(`/profile/${userId}`);
        return response.data;
    },

    setupProfile: async (data) => {
        const response = await api.post('/profile/setup', data);
        return response.data;
    },

    updateProfile: async (userId, data) => {
        const response = await api.put(`/profile/${userId}`, data);
        return response.data;
    },

    updateInsulinRatio: async (userId, insulinRatio) => {
        const response = await api.put(`/profile/${userId}/ratio`, { insulinRatio });
        return response.data;
    },
};

export const mealService = {
    createMeal: async (data) => {
        const response = await api.post('/meals', data);
        return response.data;
    },

    getMeals: async (userId, params = {}) => {
        const response = await api.get(`/meals/user/${userId}`, { params });
        return response.data;
    },

    getMeal: async (id) => {
        const response = await api.get(`/meals/${id}`);
        return response.data;
    },

    updateMeal: async (id, data) => {
        const response = await api.put(`/meals/${id}`, data);
        return response.data;
    },

    deleteMeal: async (id) => {
        const response = await api.delete(`/meals/${id}`);
        return response.data;
    },
};

export const foodService = {
    analyzeFood: async (imageFile, userId) => {
        const formData = new FormData();
        formData.append('image', imageFile);

        const response = await api.post('/food/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-User-Id': userId,
            },
        });
        return response.data;
    },
};

export const analyticsService = {
    getSummary: async (userId, period = 'daily', date = null) => {
        const response = await api.get(`/analytics/summary/${userId}`, {
            params: { period, date },
        });
        return response.data;
    },

    getTrends: async (userId, days = 30) => {
        const response = await api.get(`/analytics/trends/${userId}`, {
            params: { days },
        });
        return response.data;
    },

    getCorrelations: async (userId, days = 30) => {
        const response = await api.get(`/analytics/correlations/${userId}`, {
            params: { days },
        });
        return response.data;
    },

    getPatterns: async (userId, days = 30) => {
        const response = await api.get(`/analytics/patterns/${userId}`, {
            params: { days },
        });
        return response.data;
    },

    exportPDF: async (userId, days = 30) => {
        const response = await api.get(`/analytics/export/${userId}/pdf`, {
            params: { days },
            responseType: 'blob',
        });
        return response.data;
    },

    exportCSV: async (userId, days = 30) => {
        const response = await api.get(`/analytics/export/${userId}/csv`, {
            params: { days },
            responseType: 'blob',
        });
        return response.data;
    },
};

export const notificationService = {
    getVapidKey: async () => {
        const response = await api.get('/notifications/vapid-public-key');
        return response.data.publicKey;
    },

    subscribe: async (userId, subscription) => {
        const response = await api.post('/notifications/subscribe', {
            userId,
            subscription,
        });
        return response.data;
    },

    updateSettings: async (userId, settings) => {
        const response = await api.put('/notifications/settings', {
            userId,
            ...settings,
        });
        return response.data;
    },
};
