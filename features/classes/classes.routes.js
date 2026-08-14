const express = require('express');
const router = express.Router();
const classesController = require('./classes.controller');
const { validate } = require('../../shared/middleware/validation');
const { authenticate, adminOrGuruOnly, adminOnly } = require('../../shared/middleware/auth');
const { validateClass } = require('./classes.validator');

/**
 * GET /api/classes
 * Get all classes
 */
router.get('/', authenticate, classesController.getAllClasses);

/**
 * GET /api/classes/:id
 * Get class by ID
 */
router.get('/:id', authenticate, classesController.getClassById);

/**
 * GET /api/classes/:id/students
 * Get students in a class
 */
router.get('/:id/students', authenticate, adminOrGuruOnly, classesController.getClassStudents);

/**
 * POST /api/classes
 * Create new class (Admin/Guru only)
 */
router.post(
  '/', 
  authenticate, 
  adminOrGuruOnly, 
  validate(validateClass), 
  classesController.createClass
);

/**
 * PUT /api/classes/:id
 * Update class (Admin/Guru only)
 */
router.put(
  '/:id', 
  authenticate, 
  adminOrGuruOnly, 
  classesController.updateClass
);

/**
 * DELETE /api/classes/:id
 * Delete class (Admin only)
 */
router.delete('/:id', authenticate, adminOnly, classesController.deleteClass);

module.exports = router;
