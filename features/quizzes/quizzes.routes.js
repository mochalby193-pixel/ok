const express = require('express');
const router = express.Router();
const quizzesController = require('./quizzes.controller');
const { validate } = require('../../shared/middleware/validation');
const { authenticate, adminOrGuruOnly } = require('../../shared/middleware/auth');
const { validateQuiz } = require('./quizzes.validator');

router.get('/', authenticate, quizzesController.getAllQuizzes);
router.get('/:id', authenticate, quizzesController.getQuizById);
router.post('/', authenticate, adminOrGuruOnly, validate(validateQuiz), quizzesController.createQuiz);
router.put('/:id', authenticate, adminOrGuruOnly, quizzesController.updateQuiz);
router.delete('/:id', authenticate, adminOrGuruOnly, quizzesController.deleteQuiz);

module.exports = router;
