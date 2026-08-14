const { isValidEmail } = require('../../shared/utils/sqlSanitizer');
const { ROLES } = require('../../shared/constants');

/**
 * Validate login data
 * Mendukung dua mode:
 *   - Siswa : { nisn, password }
 *   - Admin/Guru : { email, password }
 */
const validateLogin = (data) => {
  const errors = [];

  const hasNisn  = !!data.nisn;
  const hasEmail = !!data.email;

  if (!hasNisn && !hasEmail) {
    errors.push('Email atau NISN wajib diisi');
  }

  if (hasNisn) {
    const nisnStr = String(data.nisn).trim();
    if (!/^\d{10}$/.test(nisnStr)) {
      errors.push('NISN harus berupa 10 digit angka');
    }
  }

  if (hasEmail && !isValidEmail(data.email)) {
    errors.push('Format email tidak valid');
  }

  if (!data.password) {
    errors.push('Password wajib diisi');
  } else if (data.password.length < 6) {
    errors.push('Password minimal 6 karakter');
  }

  return errors;
};

/**
 * Validate register data
 */
const validateRegister = (data) => {
  const errors = [];
  
  if (!data.nama || data.nama.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (!data.role) {
    errors.push('Role is required');
  } else if (!Object.values(ROLES).includes(data.role)) {
    errors.push('Invalid role. Must be admin, guru, or siswa');
  }
  
  // Additional validation for siswa
  if (data.role === ROLES.SISWA) {
    if (!data.class_id) {
      errors.push('Class ID is required for siswa role');
    }
    if (data.nisn !== undefined && data.nisn !== null && data.nisn !== '') {
      const nisnStr = String(data.nisn).trim();
      if (!/^\d{10}$/.test(nisnStr)) {
        errors.push('NISN harus berupa 10 digit angka');
      }
    }
  }
  
  return errors;
};

module.exports = {
  validateLogin,
  validateRegister,
};
