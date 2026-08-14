import api from './api';

export const pengawasService = {
  // Sekolah
  getAllSchools: () => api.get('/pengawas/schools'),
  getSchoolById: (id) => api.get(`/pengawas/schools/${id}`),
  createSchool: (data) => api.post('/pengawas/schools', data),
  updateSchool: (id, data) => api.put(`/pengawas/schools/${id}`, data),

  // Admin sekolah
  getSchoolAdmins: (schoolId) => api.get(`/pengawas/schools/${schoolId}/admins`),
  createSchoolAdmin: (schoolId, data) => api.post(`/pengawas/schools/${schoolId}/admins`, data),

  // Nilai & statistik
  getSchoolScores: (schoolId) => api.get(`/pengawas/schools/${schoolId}/scores`),
  getSchoolStats: (schoolId) => api.get(`/pengawas/schools/${schoolId}/stats`),
};
