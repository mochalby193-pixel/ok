const bcrypt = require('bcrypt');
const { query, getClient } = require('../../config/database');

/**
 * Find user by email (include school_id)
 */
const findUserByEmail = async (email) => {
  const result = await query(
    `SELECT u.*, s.id as student_id, s.class_id, s.nisn
     FROM users u
     LEFT JOIN students s ON u.id = s.user_id
     WHERE u.email = $1`,
    [email]
  );
  return result.rows[0];
};

/**
 * Find siswa by NISN (include school_id)
 */
const findUserByNisn = async (nisn) => {
  const result = await query(
    `SELECT u.*, s.id as student_id, s.class_id, s.nisn
     FROM users u
     INNER JOIN students s ON u.id = s.user_id
     WHERE s.nisn = $1`,
    [nisn]
  );
  return result.rows[0];
};

/**
 * Find user by ID with additional info (include school_id)
 */
const findUserById = async (userId) => {
  const result = await query(
    `SELECT u.id, u.nama, u.email, u.role, u.is_active, u.school_id,
            s.id as student_id, s.class_id, s.nisn
     FROM users u
     LEFT JOIN students s ON u.id = s.user_id
     WHERE u.id = $1`,
    [userId]
  );
  return result.rows[0];
};

/**
 * Verify password
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Register new user with transaction (include school_id)
 */
const registerUser = async (userData) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );
    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(userData.password);

    const userResult = await client.query(
      `INSERT INTO users (school_id, nama, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nama, email, role, school_id`,
      [userData.school_id || null, userData.nama, userData.email, hashedPassword, userData.role]
    );

    const newUser = userResult.rows[0];

    if (userData.role === 'siswa' && userData.class_id) {
      await client.query(
        `INSERT INTO students (user_id, class_id, nis, nisn)
         VALUES ($1, $2, $3, $4)`,
        [newUser.id, userData.class_id, userData.nis || null, userData.nisn || null]
      );
    }

    await client.query('COMMIT');
    return newUser;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update user profile (nama, email)
 */
const updateProfile = async (userId, { nama, email }) => {
  if (email) {
    const existing = await query(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email, userId]
    );
    if (existing.rows.length > 0) {
      throw new Error('Email sudah digunakan akun lain');
    }
  }

  const result = await query(
    `UPDATE users
     SET nama  = COALESCE($1, nama),
         email = COALESCE($2, email)
     WHERE id = $3
     RETURNING id, nama, email, role`,
    [nama || null, email || null, userId]
  );
  return result.rows[0];
};

/**
 * Change password — verifies old password first
 */
const changePassword = async (userId, { oldPassword, newPassword }) => {
  const userResult = await query(
    'SELECT password FROM users WHERE id = $1',
    [userId]
  );
  const user = userResult.rows[0];
  if (!user) throw new Error('User tidak ditemukan');

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) throw new Error('Password lama tidak sesuai');

  const hashed = await hashPassword(newPassword);
  await query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);
};

module.exports = {
  findUserByEmail,
  findUserByNisn,
  findUserById,
  verifyPassword,
  hashPassword,
  registerUser,
  updateProfile,
  changePassword,
};
