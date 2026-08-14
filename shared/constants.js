// User roles
const ROLES = {
  SUPERADMIN: 'superadmin',
  PENGAWAS: 'pengawas',
  ADMIN: 'admin',
  GURU: 'guru',
  SISWA: 'siswa',
};

// HTTP status codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Quiz answer options
const QUIZ_OPTIONS = ['a', 'b', 'c', 'd'];

// Tingkat kelas (grade levels)
const TINGKAT = [1, 2, 3, 4, 5, 6];

module.exports = {
  ROLES,
  STATUS_CODES,
  QUIZ_OPTIONS,
  TINGKAT,
};
