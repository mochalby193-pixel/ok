import api from './api';

export const studentService = {
  getDashboard: async () => {
    return await api.get('/students/dashboard');
  },

  getLessonProgress: async (lessonId) => {
    return await api.get(`/students/progress/${lessonId}`);
  },

  saveProgress: async (lessonId, isCompleted) => {
    return await api.post('/students/progress', {
      lesson_id: lessonId,
      is_completed: isCompleted,
    });
  },

  submitQuizAnswer: async (quizId, answer) => {
    return await api.post('/students/quiz-answer', {
      quiz_id: quizId,
      jawaban_siswa: answer,
    });
  },

  getQuizScores: async () => {
    return await api.get('/students/quiz-scores');
  },

  getLessonScores: async () => {
    return await api.get('/students/lesson-scores');
  },

  getLessonQuizScores: async (lessonId) => {
    return await api.get(`/students/lesson-quiz-scores/${lessonId}`);
  },

  getNilaiKu: async () => {
    return await api.get('/students/nilaiku');
  },
};
