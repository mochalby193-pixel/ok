const bcrypt = require('bcrypt');
const { query, getClient } = require('../../config/database');

/**
 * Get all users (admin only)
 */
const getAllUsers = async ({ role, search, class_id } = {}) => {
  let sql = `
    SELECT
      u.id,
      u.nama,
      u.email,
      u.role,
      u.is_active,
      u.created_at,
      s.id   AS student_id,
      s.nis,
      s.nisn,
      c.id   AS class_id,
      c.nama_kelas
    FROM users u
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN classes  c ON s.class_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (role) {
    params.push(role);
    sql += ` AND u.role = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (u.nama ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
  }

  if (class_id) {
    params.push(parseInt(class_id));
    sql += ` AND s.class_id = $${params.length}`;
  }

  sql += ' ORDER BY u.created_at DESC';

  const result = await query(sql, params);
  return result.rows;
};

/**
 * Get single user by id
 */
const getUserById = async (id) => {
  const result = await query(
    `SELECT u.id, u.nama, u.email, u.role, u.is_active, u.created_at,
            s.id AS student_id, s.nis, s.nisn, s.class_id, c.nama_kelas
     FROM users u
     LEFT JOIN students s ON u.id = s.user_id
     LEFT JOIN classes  c ON s.class_id = c.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
};

/**
 * Create a single user (with optional student record)
 */
const createUser = async ({ nama, email, password, role, nis, nisn, class_id }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Check duplicate email
    const dup = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (dup.rows.length > 0) throw new Error('Email already registered');

    // Check duplicate NISN for siswa
    if (role === 'siswa' && nisn) {
      const dupNisn = await client.query('SELECT id FROM students WHERE nisn = $1', [nisn]);
      if (dupNisn.rows.length > 0) throw new Error('NISN sudah terdaftar');
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const userRes = await client.query(
      `INSERT INTO users (nama, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nama, email, role`,
      [nama, email, hashedPw, role]
    );
    const newUser = userRes.rows[0];

    if (role === 'siswa') {
      await client.query(
        `INSERT INTO students (user_id, class_id, nis, nisn) VALUES ($1, $2, $3, $4)`,
        [newUser.id, class_id || null, nis || null, nisn || null]
      );
    }

    await client.query('COMMIT');
    return newUser;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update user
 */
const updateUser = async (id, { nama, email, role, is_active, nis, nisn, class_id, password }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Build dynamic UPDATE for users
    const fields = [];
    const values = [];

    if (nama !== undefined)      { values.push(nama);      fields.push(`nama = $${values.length}`); }
    if (email !== undefined)     { values.push(email);     fields.push(`email = $${values.length}`); }
    if (role !== undefined)      { values.push(role);      fields.push(`role = $${values.length}`); }
    if (is_active !== undefined) { values.push(is_active); fields.push(`is_active = $${values.length}`); }
    if (password !== undefined && password !== '') {
      const hashed = await bcrypt.hash(password, 10);
      values.push(hashed);
      fields.push(`password = $${values.length}`);
    }

    if (fields.length > 0) {
      values.push(id);
      await client.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length}`,
        values
      );
    }

    // Handle student record
    const existing = await client.query(
      'SELECT id FROM students WHERE user_id = $1', [id]
    );

    if (role === 'siswa' || existing.rows.length > 0) {
      if (existing.rows.length > 0) {
        await client.query(
          `UPDATE students SET class_id = $1, nis = $2, nisn = $3 WHERE user_id = $4`,
          [class_id || null, nis || null, nisn || null, id]
        );
      } else if (role === 'siswa') {
        await client.query(
          `INSERT INTO students (user_id, class_id, nis, nisn) VALUES ($1, $2, $3, $4)`,
          [id, class_id || null, nis || null, nisn || null]
        );
      }
    }

    await client.query('COMMIT');
    return await getUserById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Soft delete (deactivate) user
 */
const deleteUser = async (id) => {
  await query('UPDATE users SET is_active = false WHERE id = $1', [id]);
};

/**
 * Bulk create users from Excel data
 * Returns { success: [], errors: [] }
 */
const bulkCreateUsers = async (rows) => {
  const results = { success: [], errors: [] };

  for (const row of rows) {
    try {
      const user = await createUser({
        nama: row.nama,
        email: row.email,
        password: row.password,
        role: row.role,
        nis: row.nis || null,
        nisn: row.nisn || null,
        class_id: row.class_id || null,
      });
      results.success.push({ email: row.email, id: user.id });
    } catch (err) {
      results.errors.push({ email: row.email, reason: err.message });
    }
  }

  return results;
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkCreateUsers,
};
