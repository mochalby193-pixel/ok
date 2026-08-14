const { query } = require('../../config/database');

const getAllLessons = async (classSubjectId, teacherId = null, schoolId = null) => {
  let sql = `SELECT l.*, s.nama_mapel, c.nama_kelas
             FROM lessons l
             JOIN class_subjects cs ON l.class_subject_id = cs.id
             JOIN subjects s ON cs.subject_id = s.id
             JOIN classes c ON cs.class_id = c.id
             WHERE 1=1`;

  const params = [];

  if (schoolId) {
    params.push(schoolId);
    sql += ` AND c.school_id = $${params.length}`;
  }
  if (teacherId) {
    params.push(teacherId);
    sql += ` AND cs.teacher_id = $${params.length}`;
  }
  if (classSubjectId) {
    params.push(classSubjectId);
    sql += ` AND l.class_subject_id = $${params.length}`;
  }

  sql += ` ORDER BY l.urutan, l.created_at`;
  const result = await query(sql, params);
  return result.rows;
};

const getLessonById = async (lessonId) => {
  const result = await query(
    `SELECT l.*, s.nama_mapel, c.nama_kelas, c.tingkat
     FROM lessons l
     JOIN class_subjects cs ON l.class_subject_id = cs.id
     JOIN subjects s ON cs.subject_id = s.id
     JOIN classes c ON cs.class_id = c.id
     WHERE l.id = $1`,
    [lessonId]
  );
  return result.rows[0];
};

const getClassSubjects = async (teacherId = null, schoolId = null) => {
  let sql = `SELECT cs.id, cs.class_id, cs.subject_id, c.nama_kelas, c.tingkat, s.nama_mapel
             FROM class_subjects cs
             JOIN classes c ON cs.class_id = c.id
             JOIN subjects s ON cs.subject_id = s.id
             WHERE c.is_active = true AND s.is_active = true`;

  const params = [];

  if (schoolId) {
    params.push(schoolId);
    sql += ` AND c.school_id = $${params.length}`;
  }
  if (teacherId) {
    params.push(teacherId);
    sql += ` AND cs.teacher_id = $${params.length}`;
  }

  sql += ` ORDER BY c.tingkat, c.nama_kelas, s.nama_mapel`;
  const result = await query(sql, params);
  return result.rows;
};

const createLesson = async (lessonData) => {
  const { class_subject_id, judul_bab, konten_teks, media_url, pdf_url, urutan, is_published } = lessonData;

  const result = await query(
    `INSERT INTO lessons (class_subject_id, judul_bab, konten_teks, media_url, pdf_url, urutan, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [
      class_subject_id,
      judul_bab,
      konten_teks || '',
      media_url || null,
      pdf_url || null,
      urutan || 0,
      is_published !== undefined ? is_published : false,
    ]
  );

  return result.rows[0];
};

const updateLesson = async (lessonId, lessonData) => {
  const { judul_bab, konten_teks, media_url, pdf_url, urutan, is_published } = lessonData;

  const result = await query(
    `UPDATE lessons
     SET judul_bab      = COALESCE($1, judul_bab),
         konten_teks    = COALESCE($2, konten_teks),
         media_url      = $3,
         pdf_url        = $4,
         urutan         = COALESCE($5, urutan),
         is_published   = COALESCE($6, is_published)
     WHERE id = $7 RETURNING *`,
    [judul_bab, konten_teks, media_url || null, pdf_url || null, urutan, is_published, lessonId]
  );

  return result.rows[0];
};

const deleteLesson = async (lessonId) => {
  const result = await query(
    `DELETE FROM lessons WHERE id = $1 RETURNING *`,
    [lessonId]
  );
  return result.rows[0];
};

const bulkCreateQuizzes = async (lessonId, quizzes) => {
  const results = [];
  for (const q of quizzes) {
    const r = await query(
      `INSERT INTO quizzes (lesson_id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, poin, urutan)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        lessonId,
        q.pertanyaan,
        q.pilihan_a,
        q.pilihan_b,
        q.pilihan_c,
        q.pilihan_d,
        q.jawaban_benar.toLowerCase(),
        q.poin || 10,
        q.urutan || 0,
      ]
    );
    results.push(r.rows[0]);
  }
  return results;
};

// Helper: ambil satu class_subject by id (untuk validasi ownership)
const getClassSubjectById = async (csId) => {
  const result = await query(
    `SELECT id, teacher_id FROM class_subjects WHERE id = $1`,
    [csId]
  );
  return result.rows[0];
};

/**
 * Get quiz scores for all students in a lesson (for teacher export)
 * Returns one row per student with: nama, nisn, nilai (0-100), soal_benar, total_soal
 */
const getStudentScoresByLesson = async (lessonId) => {
  const result = await query(
    `SELECT
       u.nama                                             AS nama_siswa,
       st.nisn,
       c.nama_kelas,
       c.tingkat,
       l.judul_bab,
       s.nama_mapel,
       COUNT(q.id)                                       AS total_soal,
       COUNT(qs.id)                                      AS soal_dijawab,
       COALESCE(SUM(CASE WHEN qs.is_correct THEN 1 ELSE 0 END), 0) AS soal_benar,
       COALESCE(SUM(q.poin), 0)                          AS total_poin,
       COALESCE(SUM(qs.poin_didapat), 0)                 AS poin_didapat,
       CASE
         WHEN COALESCE(SUM(q.poin), 0) = 0 THEN 0
         ELSE ROUND(
           (COALESCE(SUM(qs.poin_didapat), 0) * 100.0)
           / COALESCE(SUM(q.poin), 0)
         )
       END                                               AS nilai
     FROM lessons l
     JOIN class_subjects cs ON l.class_subject_id = cs.id
     JOIN subjects s        ON cs.subject_id = s.id
     JOIN classes c         ON cs.class_id = c.id
     JOIN students st       ON st.class_id = c.id
     JOIN users u           ON st.user_id = u.id
     LEFT JOIN quizzes q    ON q.lesson_id = l.id
     LEFT JOIN quiz_scores qs
               ON qs.quiz_id = q.id AND qs.student_id = st.id
     WHERE l.id = $1
     GROUP BY u.nama, st.nisn, c.nama_kelas, c.tingkat, l.judul_bab, s.nama_mapel
     ORDER BY u.nama`,
    [lessonId]
  );
  return result.rows;
};

/**
 * Rekap nilai semua materi — satu baris per (materi × siswa)
 * Bisa difilter by teacherId (guru hanya lihat materi miliknya)
 * Bisa difilter by lessonId untuk mempersempit ke satu materi
 */
const getAllLessonsScores = async ({ teacherId = null, lessonId = null } = {}) => {
  const params = [];
  let where = 'WHERE 1=1';

  if (teacherId) {
    params.push(teacherId);
    where += ` AND cs.teacher_id = $${params.length}`;
  }

  if (lessonId) {
    params.push(lessonId);
    where += ` AND l.id = $${params.length}`;
  }

  const result = await query(
    `SELECT
       l.id                                                        AS lesson_id,
       l.judul_bab,
       s.nama_mapel,
       c.nama_kelas,
       c.tingkat,
       u.nama                                                      AS nama_siswa,
       st.nisn,
       COUNT(q.id)                                                 AS total_soal,
       COUNT(qs.id)                                                AS soal_dijawab,
       COALESCE(SUM(CASE WHEN qs.is_correct THEN 1 ELSE 0 END),0) AS soal_benar,
       COALESCE(SUM(q.poin), 0)                                   AS total_poin,
       COALESCE(SUM(qs.poin_didapat), 0)                          AS poin_didapat,
       CASE
         WHEN COALESCE(SUM(q.poin), 0) = 0 THEN NULL
         ELSE ROUND(
           (COALESCE(SUM(qs.poin_didapat), 0) * 100.0)
           / COALESCE(SUM(q.poin), 0)
         )
       END                                                        AS nilai
     FROM lessons l
     JOIN class_subjects cs ON l.class_subject_id = cs.id
     JOIN subjects s        ON cs.subject_id = s.id
     JOIN classes c         ON cs.class_id = c.id
     JOIN students st       ON st.class_id = c.id
     JOIN users u           ON st.user_id = u.id
     LEFT JOIN quizzes q    ON q.lesson_id = l.id
     LEFT JOIN quiz_scores qs
               ON qs.quiz_id = q.id AND qs.student_id = st.id
     ${where}
     GROUP BY l.id, l.judul_bab, s.nama_mapel, c.nama_kelas, c.tingkat,
              u.nama, st.nisn
     ORDER BY s.nama_mapel, l.urutan, c.nama_kelas, u.nama`,
    params
  );
  return result.rows;
};

const getStudentCountPerClassSubject = async (teacherId = null, schoolId = null) => {
  const params = [];
  let where = 'WHERE c.is_active = true AND s.is_active = true';

  if (schoolId) { params.push(schoolId); where += ` AND c.school_id = $${params.length}`; }
  if (teacherId) { params.push(teacherId); where += ` AND cs.teacher_id = $${params.length}`; }

  const result = await query(
    `SELECT cs.id AS class_subject_id, COUNT(st.id) AS jumlah_siswa
     FROM class_subjects cs
     JOIN classes c  ON cs.class_id  = c.id
     JOIN subjects s ON cs.subject_id = s.id
     LEFT JOIN students st ON st.class_id = c.id
     ${where}
     GROUP BY cs.id`,
    params
  );
  return result.rows;
};

const getSudahKerjakanPerClassSubject = async (teacherId = null, schoolId = null) => {
  const params = [];
  let where = 'WHERE c.is_active = true AND s.is_active = true';

  if (schoolId) { params.push(schoolId); where += ` AND c.school_id = $${params.length}`; }
  if (teacherId) { params.push(teacherId); where += ` AND cs.teacher_id = $${params.length}`; }

  const result = await query(
    `SELECT cs.id AS class_subject_id, COUNT(DISTINCT st.id) AS sudah_kerjakan
     FROM class_subjects cs
     JOIN classes  c  ON cs.class_id   = c.id
     JOIN subjects s  ON cs.subject_id = s.id
     JOIN lessons  l  ON l.class_subject_id = cs.id
     JOIN quizzes  q  ON q.lesson_id = l.id
     JOIN quiz_scores qs ON qs.quiz_id = q.id
     JOIN students st ON st.id = qs.student_id AND st.class_id = c.id
     ${where}
     GROUP BY cs.id`,
    params
  );
  return result.rows;
};

module.exports = {
  getAllLessons,
  getLessonById,
  getClassSubjects,
  getClassSubjectById,
  createLesson,
  updateLesson,
  deleteLesson,
  bulkCreateQuizzes,
  getStudentScoresByLesson,
  getAllLessonsScores,
  getStudentCountPerClassSubject,
  getSudahKerjakanPerClassSubject,
};
