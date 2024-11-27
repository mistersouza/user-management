const { body } = require('express-validator');

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

module.exports = { validateUser };
