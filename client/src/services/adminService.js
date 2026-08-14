import api from './api';

export const adminService = {
  getStats: async () => {
    return await api.get('/admin/stats');
  },

  getAllStudents: async () => {
    return await api.get('/admin/students');
  },
};
