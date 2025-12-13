const express = require('express');
const { saveSubscription, sendNotificationToUser, vapidKeys } = require('../services/pushService');
const { schedulePostprandialReminder } = require('../services/scheduler');
const { redisClient } = require('../config/redis');

const router = express.Router();

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
});

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
    try {
        const { userId, subscription } = req.body;

        if (!userId || !subscription) {
            return res.status(400).json({ error: 'userId and subscription required' });
        }

        await saveSubscription(userId, subscription);

        // Send welcome notification
        await sendNotificationToUser(
            userId,
            'Notificaciones activadas',
            'Recibirás recordatorios para registrar tus comidas y medir tu glucemia'
        );

        res.json({ success: true, message: 'Subscription saved' });
    } catch (error) {
        console.error('Error subscribing:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
});

// Send notification
router.post('/send', async (req, res) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({ error: 'userId, title, and body required' });
        }

        const sent = await sendNotificationToUser(userId, title, body, data);

        if (sent) {
            res.json({ success: true, message: 'Notification sent' });
        } else {
            res.status(404).json({ error: 'User subscription not found' });
        }
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Failed to send notification' });
    }
});

// Schedule postprandial reminder
router.post('/schedule-postprandial', async (req, res) => {
    try {
        const { userId, mealId, delayMinutes } = req.body;

        if (!userId || !mealId) {
            return res.status(400).json({ error: 'userId and mealId required' });
        }

        await schedulePostprandialReminder(userId, mealId, delayMinutes);

        res.json({ success: true, message: 'Postprandial reminder scheduled' });
    } catch (error) {
        console.error('Error scheduling reminder:', error);
        res.status(500).json({ error: 'Failed to schedule reminder' });
    }
});

// Get user notifications (from Redis queue)
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get notifications from Redis list
        const notifications = await redisClient.lRange(`notifications:${userId}`, 0, -1);

        res.json(notifications.map(n => JSON.parse(n)));
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: 'Failed to get notifications' });
    }
});

// Update notification settings
router.put('/settings', async (req, res) => {
    try {
        const { userId, enabled, mealReminders, glucoseReminders } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }

        const settings = {
            enabled: enabled !== undefined ? enabled : true,
            mealReminders: mealReminders !== undefined ? mealReminders : true,
            glucoseReminders: glucoseReminders !== undefined ? glucoseReminders : true,
        };

        await redisClient.set(
            `settings:${userId}`,
            JSON.stringify(settings),
            { EX: 60 * 60 * 24 * 365 } // 1 year
        );

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
