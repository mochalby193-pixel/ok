const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../shared/middleware/validation');
const { authenticate, adminOnly } = require('../../shared/middleware/auth');
const { validateLogin, validateRegister } = require('./auth.validator');

/**
 * POST /api/auth/login
 * Public route - Login user
 */
router.post('/login', validate(validateLogin), authController.login);

/**
 * POST /api/auth/register
 * Protected route - Register new user (Admin only)
 */
router.post(
  '/register', 
  authenticate, 
  adminOnly, 
  validate(validateRegister), 
  authController.register
);

/**
 * GET /api/auth/me
 * Protected route - Get current user info
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * PUT /api/auth/profile
 * Protected route - Update own profile (nama, email)
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * PUT /api/auth/change-password
 * Protected route - Change own password
 */
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
