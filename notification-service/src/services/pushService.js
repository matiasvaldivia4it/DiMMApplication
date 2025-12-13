const webpush = require('web-push');
const { redisClient } = require('../config/redis');

// VAPID keys for web push (in production, generate these and store securely)
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8xYqFGkrDKrqKjrmpbIKy0w_CXgCOqNvWPTfEtQELGUaPvqW6A8oHc',
    privateKey: process.env.VAPID_PRIVATE_KEY || 'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls',
};

webpush.setVapidDetails(
    'mailto:support@diabetesapp.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const sendPushNotification = async (subscription, payload) => {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        console.log('Push notification sent successfully');
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};

const saveSubscription = async (userId, subscription) => {
    try {
        await redisClient.set(
            `subscription:${userId}`,
            JSON.stringify(subscription),
            { EX: 60 * 60 * 24 * 30 } // 30 days expiry
        );
    } catch (error) {
        console.error('Error saving subscription:', error);
        throw error;
    }
};

const getSubscription = async (userId) => {
    try {
        const subscription = await redisClient.get(`subscription:${userId}`);
        return subscription ? JSON.parse(subscription) : null;
    } catch (error) {
        console.error('Error getting subscription:', error);
        return null;
    }
};

const sendNotificationToUser = async (userId, title, body, data = {}) => {
    try {
        const subscription = await getSubscription(userId);

        if (!subscription) {
            console.log(`No subscription found for user ${userId}`);
            return false;
        }

        const payload = {
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            data,
        };

        await sendPushNotification(subscription, payload);
        return true;
    } catch (error) {
        console.error('Error sending notification to user:', error);
        return false;
    }
};

module.exports = {
    sendPushNotification,
    saveSubscription,
    getSubscription,
    sendNotificationToUser,
    vapidKeys,
};
