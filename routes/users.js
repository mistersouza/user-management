const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const shortid = require('shortid');
const { validateUser } = require('../middleware/validation');
const { handleUserNotFound } = require('../utils/errorHandlers');
const client = require('../config/redis');

// Get all users
router.get('/', async (request, response) => {
    try {
        response.render('userslist', {
            title: 'All users',
            users: Object.values(request.cachedUsers), 
        });
    } catch (error) {
        response.status(500).render('error', { message: 'Failed loading users' });
    }
});
// New user form
router.get('/new', (request, response) => {
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
        cachedUsers[id] = user;
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
    const user = request.cachedUsers[id];

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
    const user = request.cachedUsers[id];

    if (!user) return handleUserNotFound(response);

    await client.del(`user:${id}`);
    response.redirect('/');
});
// Update user
router.patch('/users/:id', async (request, response) => {
    const { id } = request.params;
    const user = request.cachedUsers[id];

    if (!user) return handleUserNotFound(response);

    const { first_name, last_name, email, department } = request.body;
    
    await client.hSet(`user:${id}`, {
        first_name,
        last_name,
        email,
        department
    });
    
    request.cachedUsers[id] = {
        id,
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        email: email || user.email,
        department: department || user.department,
    };

    response.json({
        message: 'User updated successfully',
        user: request.cachedUsers[id],
    });
});

module.exports = router;
