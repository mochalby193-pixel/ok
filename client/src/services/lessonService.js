import api from './api';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const lessonService = {
  getAll: async (classSubjectId = null) => {
    const params = classSubjectId ? `?class_subject_id=${classSubjectId}` : '';
    return await api.get(`/lessons${params}`);
  },

  getById: async (id) => {
    return await api.get(`/lessons/${id}`);
  },

  // Returns list of { id, nama_kelas, tingkat, nama_mapel } for dropdowns
  getClassSubjects: async () => {
    return await api.get('/lessons/class-subjects');
  },

  // Returns list of { class_subject_id, jumlah_siswa } for accurate student counts
  getStudentCounts: async () => {
    return await api.get('/lessons/student-counts');
  },

  // Returns list of { class_subject_id, sudah_kerjakan } — siswa yang sudah kerjakan minimal 1 kuis
  getSudahKerjakan: async () => {
    return await api.get('/lessons/sudah-kerjakan');
  },

  create: async (formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/lessons`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  update: async (id, formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/lessons/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  delete: async (id) => {
    return await api.delete(`/lessons/${id}`);
  },

  importQuiz: async (lessonId, excelFile) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('excel_file', excelFile);
    const response = await axios.post(`${API_BASE_URL}/lessons/${lessonId}/import-quiz`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  downloadQuizTemplate: () => {
    const token = localStorage.getItem('token');
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/lessons/quiz-template`;
    link.setAttribute('download', 'template_kuis.xlsx');
    fetch(`${API_BASE_URL}/lessons/quiz-template`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });
  },

  /**
   * Ambil rekap nilai semua materi (JSON).
   * lessonId opsional untuk filter satu materi.
   */
  getRekapNilai: async (lessonId = null) => {
    const params = lessonId ? `?lesson_id=${lessonId}` : '';
    return await api.get(`/lessons/rekap-nilai${params}`);
  },

  /**
   * Unduh rekap nilai semua materi sebagai Excel.
   */
  downloadRekapNilai: (lessonId = null, filename = 'Rekap_Nilai.xlsx') => {
    const token = localStorage.getItem('token');
    const params = lessonId ? `?lesson_id=${lessonId}&format=excel` : '?format=excel';
    fetch(`${API_BASE_URL}/lessons/rekap-nilai${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Gagal mengunduh rekap nilai');
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => alert('Gagal unduh rekap: ' + err.message));
  },

  downloadStudentScores: (lessonId, filename = 'nilai_kuis.xlsx') => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/lessons/${lessonId}/scores`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Belum ada data nilai untuk materi ini');
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => alert('Gagal unduh nilai: ' + err.message));
  },
};
