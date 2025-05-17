const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Google OAuth
router.post('/google', googleAuth);

// Get user profile (protected route)
router.get('/profile', authenticate, getProfile);

module.exports = router; 