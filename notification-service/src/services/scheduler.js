const cron = require('node-cron');
const { redisClient } = require('../config/redis');
const { sendNotificationToUser } = require('./pushService');

// Schedule meal reminders
const scheduleMealReminders = () => {
    // Breakfast reminder at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('Running breakfast reminder job');
        await sendMealReminder('Desayuno');
    });

    // Lunch reminder at 2:00 PM
    cron.schedule('0 14 * * *', async () => {
        console.log('Running lunch reminder job');
        await sendMealReminder('Almuerzo');
    });

    // Afternoon snack reminder at 6:00 PM
    cron.schedule('0 18 * * *', async () => {
        console.log('Running afternoon snack reminder job');
        await sendMealReminder('Media tarde');
    });

    // Dinner reminder at 9:00 PM
    cron.schedule('0 21 * * *', async () => {
        console.log('Running dinner reminder job');
        await sendMealReminder('Cena');
    });

    console.log('Meal reminder scheduler initialized');
};

const sendMealReminder = async (mealType) => {
    try {
        // Get all user subscriptions (in production, query from database)
        const keys = await redisClient.keys('subscription:*');

        for (const key of keys) {
            const userId = key.replace('subscription:', '');

            // Check if user has logged meal today (would need to call meal service)
            // For now, send to all users
            await sendNotificationToUser(
                userId,
                `Recordatorio de ${mealType}`,
                `No olvides registrar tu ${mealType.toLowerCase()} y medir tu glucemia`,
                { type: 'meal_reminder', mealType }
            );
        }
    } catch (error) {
        console.error('Error sending meal reminders:', error);
    }
};

const schedulePostprandialReminder = async (userId, mealId, delayMinutes = 120) => {
    try {
        // Store reminder in Redis with expiry
        const reminderKey = `reminder:postprandial:${mealId}`;
        await redisClient.set(
            reminderKey,
            JSON.stringify({ userId, mealId }),
            { EX: delayMinutes * 60 }
        );

        // In production, use a proper job queue like Bull
        setTimeout(async () => {
            await sendNotificationToUser(
                userId,
                'Recordatorio de glucemia postprandial',
                'Han pasado 2 horas desde tu comida. Es momento de medir tu glucemia',
                { type: 'postprandial_reminder', mealId }
            );
        }, delayMinutes * 60 * 1000);
    } catch (error) {
        console.error('Error scheduling postprandial reminder:', error);
    }
};

module.exports = {
    scheduleMealReminders,
    schedulePostprandialReminder,
};
