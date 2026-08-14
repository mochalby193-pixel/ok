const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const quizzesService = require('./quizzes.service');

const getAllQuizzes = async (req, res) => {
  try {
    const { lesson_id } = req.query;
    // Guru hanya lihat kuis dari penugasannya
    const teacherId = req.user.role === 'guru' ? req.user.id : null;
    const quizzes = await quizzesService.getAllQuizzes(lesson_id, teacherId);
    return success(res, quizzes, 'Quizzes retrieved successfully');
  } catch (err) {
    console.error('Get quizzes error:', err);
    return error(res, 'Failed to get quizzes', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await quizzesService.getQuizById(id);
    if (!quiz) return error(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
    return success(res, quiz, 'Quiz retrieved successfully');
  } catch (err) {
    console.error('Get quiz error:', err);
    return error(res, 'Failed to get quiz', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const createQuiz = async (req, res) => {
  try {
    const quizData = req.body;

    // Guru hanya boleh buat kuis untuk lesson dari penugasannya
    if (req.user.role === 'guru') {
      const owned = await quizzesService.isLessonOwnedByTeacher(quizData.lesson_id, req.user.id);
      if (!owned) {
        return error(res, 'Anda tidak memiliki akses ke materi ini', STATUS_CODES.FORBIDDEN);
      }
    }

    const newQuiz = await quizzesService.createQuiz(quizData);
    return success(res, newQuiz, 'Quiz created successfully', STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Create quiz error:', err);
    return error(res, 'Failed to create quiz', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quizData = req.body;

    // Guru hanya boleh update kuis dari penugasannya
    if (req.user.role === 'guru') {
      const existing = await quizzesService.getQuizById(id);
      if (!existing) return error(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
      const owned = await quizzesService.isLessonOwnedByTeacher(existing.lesson_id, req.user.id);
      if (!owned) {
        return error(res, 'Anda tidak memiliki akses ke kuis ini', STATUS_CODES.FORBIDDEN);
      }
    }

    const updatedQuiz = await quizzesService.updateQuiz(id, quizData);
    if (!updatedQuiz) return error(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
    return success(res, updatedQuiz, 'Quiz updated successfully');
  } catch (err) {
    console.error('Update quiz error:', err);
    return error(res, 'Failed to update quiz', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    // Guru hanya boleh hapus kuis dari penugasannya
    if (req.user.role === 'guru') {
      const existing = await quizzesService.getQuizById(id);
      if (!existing) return error(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
      const owned = await quizzesService.isLessonOwnedByTeacher(existing.lesson_id, req.user.id);
      if (!owned) {
        return error(res, 'Anda tidak memiliki akses ke kuis ini', STATUS_CODES.FORBIDDEN);
      }
    }

    const deletedQuiz = await quizzesService.deleteQuiz(id);
    if (!deletedQuiz) return error(res, 'Quiz not found', STATUS_CODES.NOT_FOUND);
    return success(res, deletedQuiz, 'Quiz deleted successfully');
  } catch (err) {
    console.error('Delete quiz error:', err);
    return error(res, 'Failed to delete quiz', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
