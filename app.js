const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const redis = require('redis');
require('dotenv').config();

// Get port from .env file
const PORT = process.env.PORT;
// Initialize express app
const app = express();
// JSON parser
app.use(express.json());
// URL parser
app.use(express.urlencoded({ extended: false }));
// Redis client
const client = redis.createClient();
// Connect to Redis
client.connect();
// Check if Redis is connected
client.on('connect', () => {
    console.log('Connected to Redis...');
});
// Method override
app.use(methodOverride('_method'));
// Handlebars config
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'handlebars');
// Add these lines after your existing middleware setup
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    try {
        response.render('searchusers', {
            title: 'Search users',
        })
    } catch (error) {
        response.status(500).render('error', { message: 'Failed to load search page' });
    }
});
// Search users
app.post('/users/search', (request, response) => {
    const dummyUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    response.json(dummyUser);
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

