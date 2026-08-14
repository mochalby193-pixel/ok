const { query } = require('../../config/database');

const getAllClasses = async (schoolId) => {
  const result = await query(
    `SELECT c.*, COUNT(s.id) as jumlah_siswa
     FROM classes c
     LEFT JOIN students s ON c.id = s.class_id
     WHERE c.is_active = true AND c.school_id = $1
     GROUP BY c.id
     ORDER BY c.tingkat, c.nama_kelas`,
    [schoolId]
  );
  return result.rows;
};

const getClassById = async (classId, schoolId) => {
  const result = await query(
    `SELECT c.*, COUNT(s.id) as jumlah_siswa
     FROM classes c
     LEFT JOIN students s ON c.id = s.class_id
     WHERE c.id = $1 AND c.is_active = true AND c.school_id = $2
     GROUP BY c.id`,
    [classId, schoolId]
  );
  return result.rows[0];
};

const createClass = async (classData, schoolId) => {
  const { nama_kelas, tingkat, deskripsi } = classData;
  const result = await query(
    `INSERT INTO classes (school_id, nama_kelas, tingkat, deskripsi)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [schoolId, nama_kelas, tingkat, deskripsi || null]
  );
  return result.rows[0];
};

const updateClass = async (classId, classData, schoolId) => {
  const { nama_kelas, tingkat, deskripsi, is_active } = classData;
  const result = await query(
    `UPDATE classes
     SET nama_kelas = COALESCE($1, nama_kelas),
         tingkat    = COALESCE($2, tingkat),
         deskripsi  = COALESCE($3, deskripsi),
         is_active  = COALESCE($4, is_active)
     WHERE id = $5 AND school_id = $6
     RETURNING *`,
    [nama_kelas, tingkat, deskripsi, is_active, classId, schoolId]
  );
  return result.rows[0];
};

const deleteClass = async (classId, schoolId) => {
  const result = await query(
    `UPDATE classes SET is_active = false
     WHERE id = $1 AND school_id = $2
     RETURNING *`,
    [classId, schoolId]
  );
  return result.rows[0];
};

const getClassStudents = async (classId, schoolId) => {
  const result = await query(
    `SELECT u.id, u.nama, u.email, s.nis, s.nisn, s.id as student_id
     FROM students s
     JOIN users u ON s.user_id = u.id
     JOIN classes c ON s.class_id = c.id
     WHERE s.class_id = $1 AND c.school_id = $2 AND u.is_active = true
     ORDER BY u.nama`,
    [classId, schoolId]
  );
  return result.rows;
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
};
