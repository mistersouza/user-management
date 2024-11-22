const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const redis = require('redis');
const shortid = require('shortid');
const { body, validationResult } = require('express-validator');
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
    helpers: {
        getErrors: (errors, field) => (errors.find(error => error.path === field)),
        equals: (a, b) => a === b
    },
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
// New user form
app.get('/users/new', (request, response) => {
    response.render('newuserform');
});
// Validation middleware
const validateUser = [
    body('first_name')
        .trim()
        .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('last_name')
        .trim()
        .isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email'),
    body('department')
        .trim()
        .notEmpty().withMessage('Department is required')
];
// Create new user
app.post('/users', validateUser, async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(400).render('newuserform', {
            errors: errors.array(),
            input: request.body,
        });
    }
   try {
        const { first_name, last_name, email, department } = request.body;
        const id = shortid.generate();
        const user = { id, first_name, last_name, email, department };
        await client.hSet(`user:${id}`, user);
        response.redirect('/');
    } catch (error) {
        response.status(500).render('error', { message: 'Failed to create user' });
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
// Delete user
app.delete('/users/:id', async (request, response) => {
    console.log('Delete route hit with ID:', request.params.id);
    const { id } = request.params;
    const user = cachedUsers.find(user => user.id === id);

    if (!user)
        return response.status(404).render('usernotfound', { message: "User's gone MIA! Let's get you back on track." });

    await client.del(`user:${id}`);
    response.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

