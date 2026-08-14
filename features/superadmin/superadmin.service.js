const bcrypt = require('bcrypt');
const { query, getClient } = require('../../config/database');

// ─── USER MANAGEMENT (semua user, semua sekolah) ──────────────────────────────

const getAllUsers = async ({ role, search, school_id } = {}) => {
  let sql = `
    SELECT u.id, u.nama, u.email, u.role, u.is_active,
           u.school_id, u.created_at,
           sch.nama AS nama_sekolah,
           s.id AS student_id, s.nis, s.nisn,
           c.id AS class_id, c.nama_kelas
    FROM users u
    LEFT JOIN schools sch ON u.school_id = sch.id
    LEFT JOIN students s  ON u.id = s.user_id
    LEFT JOIN classes  c  ON s.class_id = c.id
    WHERE u.role != 'superadmin'
  `;
  const params = [];

  if (role)      { params.push(role);           sql += ` AND u.role = $${params.length}`; }
  if (school_id) { params.push(parseInt(school_id)); sql += ` AND u.school_id = $${params.length}`; }
  if (search)    { params.push(`%${search}%`);  sql += ` AND (u.nama ILIKE $${params.length} OR u.email ILIKE $${params.length})`; }

  sql += ' ORDER BY u.school_id NULLS LAST, u.role, u.nama';
  const result = await query(sql, params);
  return result.rows;
};

const getUserById = async (id) => {
  const result = await query(
    `SELECT u.id, u.nama, u.email, u.role, u.is_active,
            u.school_id, sch.nama AS nama_sekolah, u.created_at,
            s.id AS student_id, s.nis, s.nisn, s.class_id, c.nama_kelas
     FROM users u
     LEFT JOIN schools sch ON u.school_id = sch.id
     LEFT JOIN students s  ON u.id = s.user_id
     LEFT JOIN classes  c  ON s.class_id = c.id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0];
};

const updateUser = async (id, { nama, email, role, is_active, password }) => {
  // Tidak boleh edit superadmin
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const fields = [], values = [];
    if (nama      !== undefined) { values.push(nama);      fields.push(`nama = $${values.length}`); }
    if (email     !== undefined) { values.push(email);     fields.push(`email = $${values.length}`); }
    if (role      !== undefined) { values.push(role);      fields.push(`role = $${values.length}`); }
    if (is_active !== undefined) { values.push(is_active); fields.push(`is_active = $${values.length}`); }
    if (password  && password.length >= 6) {
      const h = await bcrypt.hash(password, 10);
      values.push(h); fields.push(`password = $${values.length}`);
    }
    if (fields.length > 0) {
      values.push(id);
      await client.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
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

const deleteUser = async (id) => {
  await query('UPDATE users SET is_active = false WHERE id = $1', [id]);
};

// ─── USER REQUESTS ────────────────────────────────────────────────────────────

const getPendingRequests = async () => {
  const result = await query(
    `SELECT ur.*, sch.nama AS nama_sekolah, u.nama AS nama_pengawas
     FROM user_requests ur
     LEFT JOIN schools sch ON ur.school_id = sch.id
     LEFT JOIN users   u   ON ur.requested_by = u.id
     ORDER BY ur.created_at DESC`
  );
  return result.rows;
};

const approveRequest = async (requestId) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Ambil data request
    const reqResult = await client.query(
      'SELECT * FROM user_requests WHERE id = $1 AND status = $2',
      [requestId, 'pending']
    );
    if (reqResult.rows.length === 0) throw new Error('Request tidak ditemukan atau sudah diproses');
    const req = reqResult.rows[0];

    // Cek email duplikat
    const dup = await client.query('SELECT id FROM users WHERE email = $1', [req.email]);
    if (dup.rows.length > 0) throw new Error('Email sudah terdaftar');

    // Buat user
    await client.query(
      `INSERT INTO users (school_id, nama, email, password, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.school_id, req.nama, req.email, req.password, req.role]
    );

    // Update status request
    await client.query(
      `UPDATE user_requests SET status = 'approved', updated_at = NOW() WHERE id = $1`,
      [requestId]
    );

    await client.query('COMMIT');
    return { message: 'Akun berhasil dibuat' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const rejectRequest = async (requestId, note) => {
  const result = await query(
    `UPDATE user_requests
     SET status = 'rejected', note = $1, updated_at = NOW()
     WHERE id = $2 AND status = 'pending'
     RETURNING *`,
    [note || null, requestId]
  );
  if (result.rows.length === 0) throw new Error('Request tidak ditemukan atau sudah diproses');
  return result.rows[0];
};

// ─── PENGAWAS — buat request ──────────────────────────────────────────────────

const createRequest = async ({ school_id, nama, email, password, requestedBy }) => {
  // Cek email duplikat di users
  const dupUser = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (dupUser.rows.length > 0) throw new Error('Email sudah terdaftar sebagai user');

  // Cek email duplikat di requests pending
  const dupReq = await query(
    `SELECT id FROM user_requests WHERE email = $1 AND status = 'pending'`,
    [email]
  );
  if (dupReq.rows.length > 0) throw new Error('Request dengan email ini sudah ada dan masih pending');

  const hashed = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO user_requests (school_id, nama, email, password, role, requested_by)
     VALUES ($1, $2, $3, $4, 'admin', $5)
     RETURNING id, school_id, nama, email, role, status, created_at`,
    [school_id, nama, email, hashed, requestedBy]
  );
  return result.rows[0];
};

// Pengawas lihat request miliknya
const getMyRequests = async (requestedBy) => {
  const result = await query(
    `SELECT ur.*, sch.nama AS nama_sekolah
     FROM user_requests ur
     LEFT JOIN schools sch ON ur.school_id = sch.id
     WHERE ur.requested_by = $1
     ORDER BY ur.created_at DESC`,
    [requestedBy]
  );
  return result.rows;
};

module.exports = {
  getAllUsers, getUserById, updateUser, deleteUser,
  getPendingRequests, approveRequest, rejectRequest,
  createRequest, getMyRequests,
};
