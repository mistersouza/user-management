const express = require('express');
const shortid = require('shortid');
const { validateUser } = require('../middleware/validation');
const { handleUserNotFound } = require('../utils/errorHandlers');
const { validationResult } = require('express-validator');
const client = require('../config/redis');
const router = express.Router();

// Store users at app level
let cachedUsers = {};
// Get all users
router.get('/', async (request, response) => {
    try {
        const keys = await client.keys('user:*');
        const usersArray = await Promise.all(
            keys.map(async key => {
                const user = await client.hGetAll(key);
                if (user && user.id) return user;
            })
        );
        // Get users into an object by user ID
        cachedUsers = usersArray.reduce((users, user) => {
            users[user.id] = user; 
            return users;
        }, {});

        response.render('userslist', {
            title: 'All users',
            users: Object.values(cachedUsers), 
        });
    } catch (error) {
        response.status(500).render('error', { message: 'Failed loading users' });
    }
});
// New user form
router.get('/users/new', (request, response) => {
    response.render('newuserform');
});
// Create new user
router.post('/users', validateUser, async (request, response) => {
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
router.post('/users/search', async (request, response) => {
    const { searchTerm } = request.body;
    const filteredUsers = Object.values(cachedUsers).filter(user => 
        user.id === searchTerm ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!filteredUsers.length)
        return handleUserNotFound(response, 'We searched high and low but found no matches. Try again!');

    response.render('userslist', {
        users: filteredUsers
    });
});
// Get user by ID
router.get('/users/:id', async (request, response) => {
    const { id } = request.params;
    const user = cachedUsers[id];

    if (!user) return handleUserNotFound(response);
    
    response.render('userdetails', {
        title: `${user.first_name}'s profile`,
        user
    });
});

// Delete user
router.delete('/users/:id', async (request, response) => {
    console.log('Delete route hit with ID:', request.params.id);
    const { id } = request.params;
    const user = cachedUsers[id];

    if (!user) return handleUserNotFound(response);

    await client.del(`user:${id}`);
    response.redirect('/');
});

module.exports = router;
