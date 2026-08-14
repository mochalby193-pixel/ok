const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const studentsService = require('./students.service');

/**
 * Get student dashboard
 * GET /api/students/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    
    if (!studentId) {
      return error(res, 'Student ID not found in token', STATUS_CODES.BAD_REQUEST);
    }
    
    const lessons = await studentsService.getStudentDashboard(studentId);
    
    // Group lessons by subject
    const groupedLessons = lessons.reduce((acc, lesson) => {
      const subject = lesson.nama_mapel;
      if (!acc[subject]) {
        acc[subject] = {
          subject_name: subject,
          subject_icon: lesson.subject_icon,
          lessons: [],
        };
      }
      acc[subject].lessons.push({
        lesson_id: lesson.lesson_id,
        judul_bab: lesson.judul_bab,
        urutan: lesson.urutan,
        quiz_count: parseInt(lesson.quiz_count),
        media_url: lesson.media_url,
        pdf_url: lesson.pdf_url,
        is_completed: lesson.is_completed,
        completed_at: lesson.completed_at,
      });
      return acc;
    }, {});
    
    return success(res, Object.values(groupedLessons), 'Dashboard data retrieved');
  } catch (err) {
    console.error('Get dashboard error:', err);
    return error(res, 'Failed to get dashboard', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get lesson progress
 * GET /api/students/progress/:lesson_id
 */
const getLessonProgress = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const { lesson_id } = req.params;
    
    const progress = await studentsService.getLessonProgress(studentId, lesson_id);
    
    return success(res, progress || null, 'Progress retrieved');
  } catch (err) {
    console.error('Get progress error:', err);
    return error(res, 'Failed to get progress', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get quiz scores for a lesson (restore state)
 * GET /api/students/lesson-quiz-scores/:lesson_id
 */
const getLessonQuizScores = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const { lesson_id } = req.params;

    if (!studentId) {
      return error(res, 'Student ID not found in token', STATUS_CODES.BAD_REQUEST);
    }

    const scores = await studentsService.getQuizScoresByLesson(studentId, lesson_id);
    return success(res, scores, 'Lesson quiz scores retrieved');
  } catch (err) {
    console.error('Get lesson quiz scores error:', err);
    return error(res, 'Failed to get lesson quiz scores', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Save progress
 * POST /api/students/progress
 */
const saveProgress = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const { lesson_id, is_completed } = req.body;
    
    const progress = await studentsService.saveProgress(studentId, lesson_id, is_completed);
    
    return success(res, progress, 'Progress saved successfully');
  } catch (err) {
    console.error('Save progress error:', err);
    return error(res, 'Failed to save progress', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Submit quiz answer
 * POST /api/students/quiz-answer
 */
const submitQuizAnswer = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    const { quiz_id, jawaban_siswa } = req.body;
    
    const result = await studentsService.submitQuizAnswer(studentId, quiz_id, jawaban_siswa);
    
    return success(res, result, 'Quiz answer submitted');
  } catch (err) {
    console.error('Submit quiz error:', err);
    
    if (err.message === 'Quiz not found') {
      return error(res, err.message, STATUS_CODES.NOT_FOUND);
    }
    
    return error(res, 'Failed to submit answer', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get quiz scores
 * GET /api/students/quiz-scores
 */
const getQuizScores = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    
    const scores = await studentsService.getQuizScores(studentId);
    
    return success(res, scores, 'Quiz scores retrieved');
  } catch (err) {
    console.error('Get quiz scores error:', err);
    return error(res, 'Failed to get scores', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get per-lesson score summary for dashboard cards
 * GET /api/students/lesson-scores
 */
const getLessonScores = async (req, res) => {
  try {
    const studentId = req.user.student_id;

    if (!studentId) {
      return error(res, 'Student ID not found in token', STATUS_CODES.BAD_REQUEST);
    }

    const scores = await studentsService.getLessonScoreSummary(studentId);
    return success(res, scores, 'Lesson scores retrieved');
  } catch (err) {
    console.error('Get lesson scores error:', err);
    return error(res, 'Failed to get lesson scores', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get "Nilaiku" — full score table for student
 * GET /api/students/nilaiku
 */
const getNilaiKu = async (req, res) => {
  try {
    const studentId = req.user.student_id;

    if (!studentId) {
      return error(res, 'Student ID not found in token', STATUS_CODES.BAD_REQUEST);
    }

    const data = await studentsService.getNilaiKu(studentId);
    return success(res, data, 'Nilaiku retrieved');
  } catch (err) {
    console.error('Get nilaiku error:', err);
    return error(res, 'Failed to get nilaiku', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getDashboard,
  getLessonProgress,
  getLessonQuizScores,
  saveProgress,
  submitQuizAnswer,
  getQuizScores,
  getLessonScores,
  getNilaiKu,
};
