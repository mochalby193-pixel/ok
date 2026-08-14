import api from './api';

export const classService = {
  getAll: async () => {
    return await api.get('/classes');
  },

  getById: async (id) => {
    return await api.get(`/classes/${id}`);
  },

  create: async (classData) => {
    return await api.post('/classes', classData);
  },

  update: async (id, classData) => {
    return await api.put(`/classes/${id}`, classData);
  },

  delete: async (id) => {
    return await api.delete(`/classes/${id}`);
  },

  getStudents: async (id) => {
    return await api.get(`/classes/${id}/students`);
  },
};
