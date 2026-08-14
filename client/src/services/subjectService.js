import api from './api';

export const subjectService = {
  getAll: async () => {
    return await api.get('/subjects');
  },

  getById: async (id) => {
    return await api.get(`/subjects/${id}`);
  },

  create: async (subjectData) => {
    return await api.post('/subjects', subjectData);
  },

  update: async (id, subjectData) => {
    return await api.put(`/subjects/${id}`, subjectData);
  },

  delete: async (id) => {
    return await api.delete(`/subjects/${id}`);
  },

  // Penugasan kelas-mapel-guru
  getAllClassSubjects: async () => {
    return await api.get('/subjects/class-subjects');
  },

  assignToClass: async (classId, subjectId, teacherId) => {
    return await api.post('/subjects/assign', {
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherId || null,
    });
  },

  removeClassSubject: async (id) => {
    return await api.delete(`/subjects/class-subjects/${id}`);
  },
};
