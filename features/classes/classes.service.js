const { query } = require('../../config/database');

/**
 * Get all classes with student count
 */
const getAllClasses = async () => {
  const result = await query(
    `SELECT c.*, COUNT(s.id) as jumlah_siswa
     FROM classes c
     LEFT JOIN students s ON c.id = s.class_id
     WHERE c.is_active = true
     GROUP BY c.id
     ORDER BY c.tingkat, c.nama_kelas`
  );
  return result.rows;
};

/**
 * Get class by ID
 */
const getClassById = async (classId) => {
  const result = await query(
    `SELECT c.*, COUNT(s.id) as jumlah_siswa
     FROM classes c
     LEFT JOIN students s ON c.id = s.class_id
     WHERE c.id = $1 AND c.is_active = true
     GROUP BY c.id`,
    [classId]
  );
  return result.rows[0];
};

/**
 * Create new class
 */
const createClass = async (classData) => {
  const { nama_kelas, tingkat, deskripsi } = classData;
  
  const result = await query(
    `INSERT INTO classes (nama_kelas, tingkat, deskripsi)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nama_kelas, tingkat, deskripsi || null]
  );
  
  return result.rows[0];
};

/**
 * Update class
 */
const updateClass = async (classId, classData) => {
  const { nama_kelas, tingkat, deskripsi, is_active } = classData;
  
  const result = await query(
    `UPDATE classes
     SET nama_kelas = COALESCE($1, nama_kelas),
         tingkat = COALESCE($2, tingkat),
         deskripsi = COALESCE($3, deskripsi),
         is_active = COALESCE($4, is_active)
     WHERE id = $5
     RETURNING *`,
    [nama_kelas, tingkat, deskripsi, is_active, classId]
  );
  
  return result.rows[0];
};

/**
 * Delete class (soft delete)
 */
const deleteClass = async (classId) => {
  const result = await query(
    `UPDATE classes
     SET is_active = false
     WHERE id = $1
     RETURNING *`,
    [classId]
  );
  
  return result.rows[0];
};

/**
 * Get students in a class
 */
const getClassStudents = async (classId) => {
  const result = await query(
    `SELECT u.id, u.nama, u.email, s.nis, s.id as student_id
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.class_id = $1 AND u.is_active = true
     ORDER BY u.nama`,
    [classId]
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
