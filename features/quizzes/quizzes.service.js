const { query } = require('../../config/database');

const getAllQuizzes = async (lessonId, teacherId = null) => {
  let sql = `SELECT q.*, l.judul_bab, l.class_subject_id
             FROM quizzes q
             JOIN lessons l ON q.lesson_id = l.id
             JOIN class_subjects cs ON l.class_subject_id = cs.id
             WHERE 1=1`;

  const params = [];

  if (teacherId) {
    params.push(teacherId);
    sql += ` AND cs.teacher_id = $${params.length}`;
  }

  if (lessonId) {
    params.push(lessonId);
    sql += ` AND q.lesson_id = $${params.length}`;
  }

  sql += ` ORDER BY q.urutan, q.created_at`;

  const result = await query(sql, params);
  return result.rows;
};

const getQuizById = async (quizId) => {
  const result = await query(
    `SELECT q.*, l.judul_bab, l.class_subject_id
     FROM quizzes q
     JOIN lessons l ON q.lesson_id = l.id
     WHERE q.id = $1`,
    [quizId]
  );
  return result.rows[0];
};

// Helper: cek apakah lesson_id termasuk penugasan guru
const isLessonOwnedByTeacher = async (lessonId, teacherId) => {
  const result = await query(
    `SELECT l.id FROM lessons l
     JOIN class_subjects cs ON l.class_subject_id = cs.id
     WHERE l.id = $1 AND cs.teacher_id = $2`,
    [lessonId, teacherId]
  );
  return result.rows.length > 0;
};

const createQuiz = async (quizData) => {
  const { lesson_id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, poin, urutan } = quizData;
  
  const result = await query(
    `INSERT INTO quizzes (lesson_id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, poin, urutan)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [lesson_id, pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar.toLowerCase(), poin || 10, urutan || 0]
  );
  
  return result.rows[0];
};

const updateQuiz = async (quizId, quizData) => {
  const { pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, poin, urutan } = quizData;
  
  const result = await query(
    `UPDATE quizzes
     SET pertanyaan = COALESCE($1, pertanyaan),
         pilihan_a = COALESCE($2, pilihan_a),
         pilihan_b = COALESCE($3, pilihan_b),
         pilihan_c = COALESCE($4, pilihan_c),
         pilihan_d = COALESCE($5, pilihan_d),
         jawaban_benar = COALESCE($6, jawaban_benar),
         poin = COALESCE($7, poin),
         urutan = COALESCE($8, urutan)
     WHERE id = $9 RETURNING *`,
    [pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar?.toLowerCase(), poin, urutan, quizId]
  );
  
  return result.rows[0];
};

const deleteQuiz = async (quizId) => {
  const result = await query(
    `DELETE FROM quizzes WHERE id = $1 RETURNING *`,
    [quizId]
  );
  return result.rows[0];
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  isLessonOwnedByTeacher,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
