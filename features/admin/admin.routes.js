const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { authenticate, adminOrGuruOnly } = require('../../shared/middleware/auth');

router.get('/stats', authenticate, adminOrGuruOnly, adminController.getStats);
router.get('/students', authenticate, adminOrGuruOnly, adminController.getAllStudents);

module.exports = router;
