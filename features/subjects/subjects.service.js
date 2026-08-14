const { query } = require('../../config/database');

const getAllSubjects = async (schoolId) => {
  const result = await query(
    `SELECT * FROM subjects WHERE is_active = true AND school_id = $1 ORDER BY nama_mapel`,
    [schoolId]
  );
  return result.rows;
};

const getAllClassSubjects = async (schoolId) => {
  const result = await query(
    `SELECT cs.id, cs.class_id, cs.subject_id, cs.teacher_id, cs.is_active,
            c.nama_kelas, c.tingkat,
            s.nama_mapel,
            u.nama AS nama_guru, u.email AS email_guru
     FROM class_subjects cs
     JOIN classes  c ON cs.class_id  = c.id
     JOIN subjects s ON cs.subject_id = s.id
     LEFT JOIN users u ON cs.teacher_id = u.id
     WHERE c.is_active = true AND s.is_active = true AND c.school_id = $1
     ORDER BY c.tingkat, c.nama_kelas, s.nama_mapel`,
    [schoolId]
  );
  return result.rows;
};

const removeClassSubject = async (id, schoolId) => {
  const result = await query(
    `DELETE FROM class_subjects cs
     USING classes c
     WHERE cs.id = $1 AND cs.class_id = c.id AND c.school_id = $2
     RETURNING cs.*`,
    [id, schoolId]
  );
  return result.rows[0];
};

const getSubjectById = async (subjectId, schoolId) => {
  const result = await query(
    `SELECT * FROM subjects WHERE id = $1 AND is_active = true AND school_id = $2`,
    [subjectId, schoolId]
  );
  return result.rows[0];
};

const createSubject = async (subjectData, schoolId) => {
  const { nama_mapel, deskripsi, icon_url } = subjectData;
  const result = await query(
    `INSERT INTO subjects (school_id, nama_mapel, deskripsi, icon_url)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [schoolId, nama_mapel, deskripsi || null, icon_url || null]
  );
  return result.rows[0];
};

const updateSubject = async (subjectId, subjectData, schoolId) => {
  const { nama_mapel, deskripsi, icon_url, is_active } = subjectData;
  const result = await query(
    `UPDATE subjects
     SET nama_mapel = COALESCE($1, nama_mapel),
         deskripsi  = COALESCE($2, deskripsi),
         icon_url   = COALESCE($3, icon_url),
         is_active  = COALESCE($4, is_active)
     WHERE id = $5 AND school_id = $6 RETURNING *`,
    [nama_mapel, deskripsi, icon_url, is_active, subjectId, schoolId]
  );
  return result.rows[0];
};

const deleteSubject = async (subjectId, schoolId) => {
  const result = await query(
    `UPDATE subjects SET is_active = false WHERE id = $1 AND school_id = $2 RETURNING *`,
    [subjectId, schoolId]
  );
  return result.rows[0];
};

const assignSubjectToClass = async (classId, subjectId, teacherId, schoolId) => {
  // Validasi class dan subject milik sekolah yang sama
  const result = await query(
    `INSERT INTO class_subjects (class_id, subject_id, teacher_id)
     SELECT c.id, s.id, $3
     FROM classes c, subjects s
     WHERE c.id = $1 AND s.id = $2 AND c.school_id = $4 AND s.school_id = $4
     ON CONFLICT (class_id, subject_id) DO UPDATE
     SET teacher_id = $3, is_active = true
     RETURNING *`,
    [classId, subjectId, teacherId || null, schoolId]
  );
  return result.rows[0];
};

module.exports = {
  getAllSubjects,
  getAllClassSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  assignSubjectToClass,
  removeClassSubject,
};
