const { generateToken } = require('../../config/jwt');
const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const authService = require('./auth.service');

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, nisn, password } = req.body;
    
    let user;

    if (nisn) {
      // Login siswa menggunakan NISN
      user = await authService.findUserByNisn(nisn);
    } else {
      // Login admin/guru menggunakan email
      user = await authService.findUserByEmail(email);
    }
    
    if (!user) {
      const message = nisn ? 'NISN atau password salah' : 'Email atau password salah';
      return error(res, message, STATUS_CODES.UNAUTHORIZED);
    }

    // Jika login via NISN, pastikan akun memang siswa
    if (nisn && user.role !== 'siswa') {
      return error(res, 'NISN atau password salah', STATUS_CODES.UNAUTHORIZED);
    }
    
    // Check if account is active
    if (!user.is_active) {
      return error(res, 'Akun tidak aktif', STATUS_CODES.FORBIDDEN);
    }
    
    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      const message = nisn ? 'NISN atau password salah' : 'Email atau password salah';
      return error(res, message, STATUS_CODES.UNAUTHORIZED);
    }
    
    // Generate JWT token
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      school_id: user.school_id || null,
      is_superadmin: user.is_superadmin || false,
      student_id: user.student_id || null,
      class_id: user.class_id || null,
    };
    
    const token = generateToken(tokenPayload);
    
    // Return user data (without password) and token
    const userData = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      school_id: user.school_id || null,
      is_superadmin: user.is_superadmin || false,
      student_id: user.student_id,
      class_id: user.class_id,
      nisn: user.nisn || null,
    };
    
    return success(res, { token, user: userData }, 'Login berhasil');
    
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login gagal', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Register new user
 * POST /api/auth/register
 * (Admin only)
 */
const register = async (req, res) => {
  try {
    const userData = req.body;
    
    // Register user
    const newUser = await authService.registerUser(userData);
    
    return success(
      res, 
      newUser, 
      'User registered successfully', 
      STATUS_CODES.CREATED
    );
    
  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.message === 'Email already registered') {
      return error(res, err.message, STATUS_CODES.CONFLICT);
    }
    
    return error(res, 'Registration failed', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await authService.findUserById(userId);
    
    if (!user) {
      return error(res, 'User not found', STATUS_CODES.NOT_FOUND);
    }
    
    // Return user data without password
    const userData = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      student_id: user.student_id,
      class_id: user.class_id,
      is_active: user.is_active,
    };
    
    return success(res, userData, 'User info retrieved');
    
  } catch (err) {
    console.error('Get current user error:', err);
    return error(res, 'Failed to get user info', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update own profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama, email } = req.body;

    if (!nama && !email) {
      return error(res, 'Tidak ada data yang diubah', STATUS_CODES.BAD_REQUEST);
    }

    const updated = await authService.updateProfile(userId, { nama, email });
    return success(res, updated, 'Profil berhasil diperbarui');
  } catch (err) {
    console.error('Update profile error:', err);
    if (err.message === 'Email sudah digunakan akun lain') {
      return error(res, err.message, STATUS_CODES.CONFLICT);
    }
    return error(res, 'Gagal memperbarui profil', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Change own password
 * PUT /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return error(res, 'Password lama dan baru wajib diisi', STATUS_CODES.BAD_REQUEST);
    }
    if (newPassword.length < 6) {
      return error(res, 'Password baru minimal 6 karakter', STATUS_CODES.BAD_REQUEST);
    }

    await authService.changePassword(userId, { oldPassword, newPassword });
    return success(res, null, 'Password berhasil diubah');
  } catch (err) {
    console.error('Change password error:', err);
    if (err.message === 'Password lama tidak sesuai') {
      return error(res, err.message, STATUS_CODES.UNAUTHORIZED);
    }
    return error(res, 'Gagal mengubah password', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  login,
  register,
  getCurrentUser,
  updateProfile,
  changePassword,
};
