const { query, getClient } = require('../../config/database');

/**
 * Get student dashboard data (lessons by class)
 */
const getStudentDashboard = async (studentId) => {
  const result = await query(
    `SELECT 
       l.id as lesson_id,
       l.judul_bab,
       l.konten_teks,
       l.media_url,
       l.pdf_url,
       l.urutan,
       s.nama_mapel,
       s.icon_url as subject_icon,
       cs.id as class_subject_id,
       sp.is_completed,
       sp.completed_at,
       (SELECT COUNT(*) FROM quizzes WHERE lesson_id = l.id) as quiz_count
     FROM students st
     JOIN classes c ON st.class_id = c.id
     JOIN class_subjects cs ON c.id = cs.class_id AND cs.is_active = true
     JOIN subjects s ON cs.subject_id = s.id AND s.is_active = true
     JOIN lessons l ON cs.id = l.class_subject_id AND l.is_published = true
     LEFT JOIN student_progress sp ON st.id = sp.student_id AND l.id = sp.lesson_id
     WHERE st.id = $1
     ORDER BY s.nama_mapel, l.urutan`,
    [studentId]
  );
  
  return result.rows;
};

/**
 * Get lesson progress for a student
 */
const getLessonProgress = async (studentId, lessonId) => {
  const result = await query(
    `SELECT * FROM student_progress
     WHERE student_id = $1 AND lesson_id = $2`,
    [studentId, lessonId]
  );
  
  return result.rows[0];
};

/**
 * Save or update student progress
 */
const saveProgress = async (studentId, lessonId, isCompleted) => {
  const result = await query(
    `INSERT INTO student_progress (student_id, lesson_id, is_completed, completed_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (student_id, lesson_id)
     DO UPDATE SET 
       is_completed = $3,
       completed_at = $4,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [studentId, lessonId, isCompleted, isCompleted ? new Date() : null]
  );
  
  return result.rows[0];
};

/**
 * Submit quiz answer and get score
 */
const submitQuizAnswer = async (studentId, quizId, jawabanSiswa) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    // Get correct answer
    const quizResult = await client.query(
      'SELECT jawaban_benar, poin FROM quizzes WHERE id = $1',
      [quizId]
    );
    
    if (quizResult.rows.length === 0) {
      throw new Error('Quiz not found');
    }
    
    const { jawaban_benar, poin } = quizResult.rows[0];
    const isCorrect = jawabanSiswa.toLowerCase() === jawaban_benar.toLowerCase();
    const poinDidapat = isCorrect ? poin : 0;
    
    // Save quiz score
    const scoreResult = await client.query(
      `INSERT INTO quiz_scores (student_id, quiz_id, jawaban_siswa, is_correct, poin_didapat)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id, quiz_id)
       DO UPDATE SET 
         jawaban_siswa = $3,
         is_correct = $4,
         poin_didapat = $5,
         scored_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [studentId, quizId, jawabanSiswa.toLowerCase(), isCorrect, poinDidapat]
    );
    
    await client.query('COMMIT');
    
    return {
      ...scoreResult.rows[0],
      correct_answer: jawaban_benar,
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get quiz scores for a student filtered by lesson — untuk restore hasil di LessonDetail
 */
const getQuizScoresByLesson = async (studentId, lessonId) => {
  const result = await query(
    `SELECT qs.quiz_id, qs.jawaban_siswa, qs.is_correct, q.jawaban_benar
     FROM quiz_scores qs
     JOIN quizzes q ON qs.quiz_id = q.id
     WHERE qs.student_id = $1 AND q.lesson_id = $2`,
    [studentId, lessonId]
  );
  return result.rows;
};

/**
 * Get quiz scores for a student
 */
const getQuizScores = async (studentId) => {
  const result = await query(
    `SELECT 
       qs.*,
       q.pertanyaan,
       l.judul_bab,
       s.nama_mapel
     FROM quiz_scores qs
     JOIN quizzes q ON qs.quiz_id = q.id
     JOIN lessons l ON q.lesson_id = l.id
     JOIN class_subjects cs ON l.class_subject_id = cs.id
     JOIN subjects s ON cs.subject_id = s.id
     WHERE qs.student_id = $1
     ORDER BY qs.scored_at DESC`,
    [studentId]
  );
  
  return result.rows;
};

/**
 * Get per-lesson quiz score summary for student dashboard cards
 * Returns: lesson_id, total_soal, soal_dijawab, total_poin, poin_didapat, nilai (0-100)
 */
const getLessonScoreSummary = async (studentId) => {
  const result = await query(
    `SELECT
       l.id                                        AS lesson_id,
       COUNT(q.id)                                 AS total_soal,
       COUNT(qs.id)                                AS soal_dijawab,
       COALESCE(SUM(q.poin), 0)                    AS total_poin,
       COALESCE(SUM(qs.poin_didapat), 0)           AS poin_didapat,
       CASE
         WHEN COALESCE(SUM(q.poin), 0) = 0 THEN NULL
         ELSE ROUND(
           (COALESCE(SUM(qs.poin_didapat), 0) * 100.0)
           / COALESCE(SUM(q.poin), 0)
         )
       END                                         AS nilai
     FROM students st
     JOIN classes c         ON st.class_id = c.id
     JOIN class_subjects cs ON c.id = cs.class_id AND cs.is_active = true
     JOIN lessons l         ON cs.id = l.class_subject_id AND l.is_published = true
     LEFT JOIN quizzes q    ON q.lesson_id = l.id
     LEFT JOIN quiz_scores qs
               ON qs.quiz_id = q.id AND qs.student_id = st.id
     WHERE st.id = $1
     GROUP BY l.id`,
    [studentId]
  );
  return result.rows;
};

/**
 * Get full "Nilaiku" table:
 * kelas, mapel, materi (judul_bab), skor (0-100), nama guru, lesson_id
 * Only lessons that have quizzes AND the student has attempted at least one quiz
 */
const getNilaiKu = async (studentId) => {
  const result = await query(
    `SELECT
       c.nama_kelas                                              AS nama_kelas,
       s.nama_mapel,
       l.id                                                      AS lesson_id,
       l.judul_bab,
       l.urutan,
       u.nama                                                    AS nama_guru,
       COUNT(q.id)                                               AS total_soal,
       COUNT(qs.id)                                              AS soal_dijawab,
       COALESCE(SUM(q.poin), 0)                                  AS total_poin,
       COALESCE(SUM(qs.poin_didapat), 0)                         AS poin_didapat,
       CASE
         WHEN COALESCE(SUM(q.poin), 0) = 0 THEN 0
         ELSE ROUND(
           (COALESCE(SUM(qs.poin_didapat), 0) * 100.0)
           / COALESCE(SUM(q.poin), 0)
         )
       END                                                       AS skor
     FROM students st
     JOIN classes c          ON st.class_id = c.id
     JOIN class_subjects cs  ON c.id = cs.class_id AND cs.is_active = true
     JOIN subjects s         ON cs.subject_id = s.id AND s.is_active = true
     JOIN lessons l          ON cs.id = l.class_subject_id AND l.is_published = true
     LEFT JOIN users u       ON cs.teacher_id = u.id
     LEFT JOIN quizzes q     ON q.lesson_id = l.id
     LEFT JOIN quiz_scores qs
               ON qs.quiz_id = q.id AND qs.student_id = st.id
     WHERE st.id = $1
     GROUP BY c.nama_kelas, s.nama_mapel, l.id, l.judul_bab, l.urutan, u.nama
     HAVING COUNT(q.id) > 0 AND COUNT(qs.id) > 0
     ORDER BY s.nama_mapel, l.urutan`,
    [studentId]
  );
  return result.rows;
};

module.exports = {
  getStudentDashboard,
  getLessonProgress,
  saveProgress,
  submitQuizAnswer,
  getQuizScores,
  getQuizScoresByLesson,
  getLessonScoreSummary,
  getNilaiKu,
};
