import api from './api';

export const userManagementService = {
  // ── List & single ──────────────────────────────────────────────
  getAll: async ({ role, search, class_id } = {}) => {
    const params = new URLSearchParams();
    if (role)     params.append('role', role);
    if (search)   params.append('search', search);
    if (class_id) params.append('class_id', class_id);
    return await api.get(`/admin/users?${params.toString()}`);
  },

  getById: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },

  // ── CRUD ───────────────────────────────────────────────────────
  create: async (data) => {
    return await api.post('/admin/users', data);
  },

  update: async (id, data) => {
    return await api.put(`/admin/users/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },

  // ── Excel ──────────────────────────────────────────────────────
  downloadTemplate: () => {
    // Direct browser download — bypass axios interceptor
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${base}/admin/users/template`;

    const a = document.createElement('a');
    a.href = url;
    // Add token via URL won't work for auth header; use fetch + blob instead
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = 'template_import_users.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      });
  },

  uploadExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/admin/users/upload-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
