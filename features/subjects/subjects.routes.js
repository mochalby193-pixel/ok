const express = require('express');
const router = express.Router();
const subjectsController = require('./subjects.controller');
const { validate } = require('../../shared/middleware/validation');
const { authenticate, adminOrGuruOnly, adminOnly } = require('../../shared/middleware/auth');
const { validateSubject, validateAssignSubject } = require('./subjects.validator');

router.get('/', authenticate, subjectsController.getAllSubjects);
router.get('/class-subjects', authenticate, adminOnly, subjectsController.getAllClassSubjects);
router.get('/:id', authenticate, subjectsController.getSubjectById);
router.post('/', authenticate, adminOrGuruOnly, validate(validateSubject), subjectsController.createSubject);
router.put('/:id', authenticate, adminOrGuruOnly, subjectsController.updateSubject);
router.delete('/:id', authenticate, adminOrGuruOnly, subjectsController.deleteSubject);
router.post('/assign', authenticate, adminOnly, validate(validateAssignSubject), subjectsController.assignSubject);
router.delete('/class-subjects/:id', authenticate, adminOnly, subjectsController.removeClassSubject);

module.exports = router;
