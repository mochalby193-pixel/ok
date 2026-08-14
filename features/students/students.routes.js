const express = require('express');
const router = express.Router();
const studentsController = require('./students.controller');
const { validate } = require('../../shared/middleware/validation');
const { authenticate, siswaOnly } = require('../../shared/middleware/auth');
const { validateProgress, validateQuizAnswer } = require('./students.validator');

/**
 * GET /api/students/dashboard
 * Get student dashboard (siswa only)
 */
router.get('/dashboard', authenticate, siswaOnly, studentsController.getDashboard);

/**
 * GET /api/students/progress/:lesson_id
 * Get lesson progress
 */
router.get('/progress/:lesson_id', authenticate, siswaOnly, studentsController.getLessonProgress);

/**
 * GET /api/students/lesson-quiz-scores/:lesson_id
 * Get saved quiz answers for a lesson (untuk restore state)
 */
router.get('/lesson-quiz-scores/:lesson_id', authenticate, siswaOnly, studentsController.getLessonQuizScores);

/**
 * POST /api/students/progress
 * Save lesson progress
 */
router.post(
  '/progress',
  authenticate,
  siswaOnly,
  validate(validateProgress),
  studentsController.saveProgress
);

/**
 * POST /api/students/quiz-answer
 * Submit quiz answer
 */
router.post(
  '/quiz-answer',
  authenticate,
  siswaOnly,
  validate(validateQuizAnswer),
  studentsController.submitQuizAnswer
);

/**
 * GET /api/students/quiz-scores
 * Get all quiz scores for student
 */
router.get('/quiz-scores', authenticate, siswaOnly, studentsController.getQuizScores);

/**
 * GET /api/students/lesson-scores
 * Get per-lesson score summary for dashboard cards
 */
router.get('/lesson-scores', authenticate, siswaOnly, studentsController.getLessonScores);

/**
 * GET /api/students/nilaiku
 * Get full score table (kelas, mapel, materi, skor, guru) for Nilaiku page
 */
router.get('/nilaiku', authenticate, siswaOnly, studentsController.getNilaiKu);

module.exports = router;
