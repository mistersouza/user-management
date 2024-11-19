const express = require('express');
const exHandlebars = require('express-handlebars');
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});