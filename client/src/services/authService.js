import api from './api';

export const authService = {
  /**
   * Login siswa via NISN, atau admin/guru via email
   * @param {Object} credentials - { nisn, password } atau { email, password }
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  updateProfile: async ({ nama, email }) => {
    return await api.put('/auth/profile', { nama, email });
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    return await api.put('/auth/change-password', { oldPassword, newPassword });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
