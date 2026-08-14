import api from './api';

export const superadminService = {
  // Users — semua user semua sekolah
  getAllUsers: (params = {}) => {
    const q = new URLSearchParams();
    if (params.role)      q.append('role', params.role);
    if (params.search)    q.append('search', params.search);
    if (params.school_id) q.append('school_id', params.school_id);
    return api.get(`/superadmin/users?${q.toString()}`);
  },
  getUserById:  (id)       => api.get(`/superadmin/users/${id}`),
  updateUser:   (id, data) => api.put(`/superadmin/users/${id}`, data),
  deleteUser:   (id)       => api.delete(`/superadmin/users/${id}`),

  // Requests — superadmin kelola
  getRequests:     ()            => api.get('/superadmin/requests'),
  approveRequest:  (id)          => api.post(`/superadmin/requests/${id}/approve`),
  rejectRequest:   (id, note)    => api.post(`/superadmin/requests/${id}/reject`, { note }),

  // Requests — pengawas ajukan
  createRequest:   (data)        => api.post('/superadmin/requests', data),
  getMyRequests:   ()            => api.get('/superadmin/my-requests'),
};
