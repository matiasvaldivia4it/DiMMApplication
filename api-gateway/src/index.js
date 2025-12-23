const app = require('./app');

const PORT = process.env.PORT || 4000;

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
    console.log('Service routes:');
    console.log('  /api/auth -> Auth Service');
    console.log('  /api/food -> Food Recognition Service');
    console.log('  /api/meals -> Meal Tracking Service');
    console.log('  /api/profile -> User Profile Service');
    console.log('  /api/notifications -> Notification Service');
    console.log('  /api/analytics -> Analytics Service');
});
