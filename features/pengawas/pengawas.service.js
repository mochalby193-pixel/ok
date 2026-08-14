const bcrypt = require('bcrypt');
const { query, getClient } = require('../../config/database');

/** Ambil semua sekolah */
const getAllSchools = async () => {
  const result = await query(
    `SELECT s.*, 
            COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'admin') AS jumlah_admin,
            COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'guru')  AS jumlah_guru,
            COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'siswa') AS jumlah_siswa,
            COUNT(DISTINCT c.id) AS jumlah_kelas
     FROM schools s
     LEFT JOIN users u ON u.school_id = s.id AND u.is_active = true
     LEFT JOIN classes c ON c.school_id = s.id AND c.is_active = true
     GROUP BY s.id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
};

/** Ambil detail satu sekolah */
const getSchoolById = async (schoolId) => {
  const result = await query(
    `SELECT * FROM schools WHERE id = $1`, [schoolId]
  );
  return result.rows[0];
};

/** Buat sekolah baru */
const createSchool = async ({ nama, kode, alamat }) => {
  const result = await query(
    `INSERT INTO schools (nama, kode, alamat) VALUES ($1, $2, $3) RETURNING *`,
    [nama, kode || null, alamat || null]
  );
  return result.rows[0];
};

/** Update sekolah */
const updateSchool = async (schoolId, { nama, kode, alamat, is_active }) => {
  const result = await query(
    `UPDATE schools
     SET nama      = COALESCE($1, nama),
         kode      = COALESCE($2, kode),
         alamat    = COALESCE($3, alamat),
         is_active = COALESCE($4, is_active)
     WHERE id = $5 RETURNING *`,
    [nama, kode, alamat, is_active, schoolId]
  );
  return result.rows[0];
};

/** Ambil daftar admin sekolah tertentu */
const getSchoolAdmins = async (schoolId) => {
  const result = await query(
    `SELECT id, nama, email, is_active, created_at
     FROM users
     WHERE school_id = $1 AND role = 'admin'
     ORDER BY created_at DESC`,
    [schoolId]
  );
  return result.rows;
};

/** Tambah admin untuk sekolah tertentu */
const createSchoolAdmin = async ({ nama, email, password, schoolId }) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const dup = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (dup.rows.length > 0) throw new Error('Email already registered');
    const hashed = await bcrypt.hash(password, 10);
    const res = await client.query(
      `INSERT INTO users (school_id, nama, email, password, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, nama, email, role, school_id`,
      [schoolId, nama, email, hashed]
    );
    await client.query('COMMIT');
    return res.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/** Rekap nilai siswa per sekolah (pengawas bisa lihat nilai) */
const getSchoolScores = async (schoolId) => {
  const result = await query(
    `SELECT
       sch.nama                                                    AS nama_sekolah,
       c.nama_kelas,
       s.nama_mapel,
       l.judul_bab,
       u.nama                                                      AS nama_siswa,
       st.nisn,
       COUNT(q.id)                                                 AS total_soal,
       COUNT(qs.id)                                                AS soal_dijawab,
       COALESCE(SUM(CASE WHEN qs.is_correct THEN 1 ELSE 0 END),0) AS soal_benar,
       CASE
         WHEN COALESCE(SUM(q.poin),0) = 0 THEN NULL
         ELSE ROUND((COALESCE(SUM(qs.poin_didapat),0)*100.0)/SUM(q.poin))
       END AS nilai
     FROM schools sch
     JOIN classes c         ON c.school_id  = sch.id
     JOIN class_subjects cs ON cs.class_id  = c.id
     JOIN subjects s        ON s.id         = cs.subject_id
     JOIN lessons l         ON l.class_subject_id = cs.id AND l.is_published = true
     JOIN students st       ON st.class_id  = c.id
     JOIN users u           ON u.id         = st.user_id AND u.is_active = true
     LEFT JOIN quizzes q    ON q.lesson_id  = l.id
     LEFT JOIN quiz_scores qs ON qs.quiz_id = q.id AND qs.student_id = st.id
     WHERE sch.id = $1
     GROUP BY sch.nama, c.nama_kelas, s.nama_mapel, l.judul_bab, u.nama, st.nisn
     ORDER BY c.nama_kelas, s.nama_mapel, u.nama`,
    [schoolId]
  );
  return result.rows;
};

/** Statistik ringkas per sekolah */
const getSchoolStats = async (schoolId) => {
  const result = await query(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE school_id=$1 AND role='guru' AND is_active=true)  AS jumlah_guru,
       (SELECT COUNT(*) FROM users WHERE school_id=$1 AND role='siswa' AND is_active=true) AS jumlah_siswa,
       (SELECT COUNT(*) FROM classes WHERE school_id=$1 AND is_active=true)                AS jumlah_kelas,
       (SELECT COUNT(*) FROM subjects WHERE school_id=$1 AND is_active=true)               AS jumlah_mapel,
       (SELECT COUNT(*) FROM lessons l JOIN class_subjects cs ON l.class_subject_id=cs.id JOIN classes c ON cs.class_id=c.id WHERE c.school_id=$1 AND l.is_published=true) AS jumlah_materi`,
    [schoolId]
  );
  return result.rows[0];
};

module.exports = {
  getAllSchools,
  getSchoolById,
  createSchool,
  updateSchool,
  getSchoolAdmins,
  createSchoolAdmin,
  getSchoolScores,
  getSchoolStats,
};
