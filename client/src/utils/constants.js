export const ROLES = {
  ADMIN: 'admin',
  GURU: 'guru',
  SISWA: 'siswa',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const ROUTES = {
  LOGIN: '/login',
  STUDENT_DASHBOARD: '/student/dashboard',
  LESSON_DETAIL: '/student/lesson/:id',
  ADMIN_DASHBOARD: '/admin/dashboard',
  MANAGE_CLASSES: '/admin/classes',
  MANAGE_SUBJECTS: '/admin/subjects',
  MANAGE_LESSONS: '/admin/lessons',
  MANAGE_QUIZZES: '/admin/quizzes',
  MANAGE_USERS: '/admin/users',
};
