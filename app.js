const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const { initializeCache, attachCachedUsersToRequest } = require('./middleware/users');
require('dotenv').config();

// Get port from .env file
const PORT = process.env.PORT;
// Initialize express app
const app = express();
// Initialize cache
initializeCache();
// JSON parser
app.use(express.json());
// URL parser
app.use(express.urlencoded({ extended: false }));
// Method override
app.use(methodOverride('_method'));
// Handlebars config
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        equals: (a, b) => a === b
    },
}));
app.set('view engine', 'handlebars');
// Add these lines after your existing middleware setup
app.use(express.static(path.join(__dirname, 'public')));
// Attach cached users to request
app.use(attachCachedUsersToRequest);
// Use the routes from userRoutes.js
app.use(require('./routes/users'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
