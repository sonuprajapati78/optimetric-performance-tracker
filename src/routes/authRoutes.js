const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * POST /api/v1/auth/register
 * Public - Register new employee
 */
router.post('/register', authController.register);

/**
 * POST /api/v1/auth/login
 * Public - Login employee
 */
router.post('/login', authController.login);

/**
 * GET /api/v1/auth/me
 * Private - Get current employee profile
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * POST /api/v1/auth/logout
 * Private - Logout
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * GET /api/v1/auth/verify
 * Private - Verify token is valid
 */
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;
