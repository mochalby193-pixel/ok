import api from './api';

export const quizService = {
  getAll: async (lessonId = null) => {
    const params = lessonId ? `?lesson_id=${lessonId}` : '';
    return await api.get(`/quizzes${params}`);
  },

  getById: async (id) => {
    return await api.get(`/quizzes/${id}`);
  },

  create: async (quizData) => {
    return await api.post('/quizzes', quizData);
  },

  update: async (id, quizData) => {
    return await api.put(`/quizzes/${id}`, quizData);
  },

  delete: async (id) => {
    return await api.delete(`/quizzes/${id}`);
  },
};
