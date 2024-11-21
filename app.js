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
    layoutsDir: path.join(__dirname, 'views/layouts'),
}));
app.set('view engine', 'handlebars');
// Add these lines after your existing middleware setup
app.use(express.static(path.join(__dirname, 'public')));
// Store users at app level
let cachedUsers = [];
// Get all users
app.get('/', async (request, response) => {
    try {
        const keys = await client.keys('user:*');

        cachedUsers = await Promise.all(
            keys.map(async key => {
                return await client.hGetAll(key);
            })
        );
        response.render('userslist', {
            title: 'All users',
            users: cachedUsers,
        });
    } catch (error) {
        response.status(500).render('error', { message: 'Failed loading users' });
    }
});
// Search user
app.post('/users/search', async (request, response) => {
    const { searchTerm } = request.body;
    const filteredUsers = cachedUsers.filter(user => 
        user.id === searchTerm ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
    response.render('userslist', {
        users: filteredUsers
    });
});
// Get user by ID
app.get('/users/:id', async (request, response) => {
    const { id } = request.params;
    const user = cachedUsers.find(user => user.id === id);

    if (!user)
        return response.status(404).render('usernotfound', { message: "User's gone MIA! Let's get you back on track." });
    
    response.render('userdetails', {
        title: `${user.first_name}'s profile`,
        user
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

