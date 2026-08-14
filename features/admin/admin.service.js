const { query } = require('../../config/database');

const getStats = async () => {
  // Run all queries in parallel for performance
  const [
    studentsResult,
    classesResult,
    lessonsResult,
    progressResult,
    quizzesResult,
    teachersResult,
    subjectsResult,
    quizScoreResult,
    recentActivityResult,
    topClassesResult,
    completionByClassResult,
  ] = await Promise.all([
    // Total active students
    query(`SELECT COUNT(*) as total_students FROM students s JOIN users u ON s.user_id = u.id WHERE u.is_active = true`),
    // Total active classes
    query(`SELECT COUNT(*) as total_classes FROM classes WHERE is_active = true`),
    // Total published lessons
    query(`SELECT COUNT(*) as total_lessons FROM lessons WHERE is_published = true`),
    // Progress stats
    query(`SELECT 
       COUNT(CASE WHEN is_completed = true THEN 1 END) as completed,
       COUNT(*) as total
     FROM student_progress`),
    // Total quizzes
    query(`SELECT COUNT(*) as total_quizzes FROM quizzes`),
    // Total active teachers
    query(`SELECT COUNT(*) as total_teachers FROM users WHERE role = 'guru' AND is_active = true`),
    // Total subjects
    query(`SELECT COUNT(*) as total_subjects FROM subjects`),
    // Average quiz score
    query(`SELECT AVG(poin_didapat)::numeric(5,2) as avg_score, COUNT(*) as total_attempts FROM quiz_scores`),
    // Recent activity — last 5 student progress updates
    query(`SELECT u.nama, l.judul_bab, sp.updated_at, sp.is_completed
           FROM student_progress sp
           JOIN students s ON sp.student_id = s.id
           JOIN users u ON s.user_id = u.id
           JOIN lessons l ON sp.lesson_id = l.id
           ORDER BY sp.updated_at DESC
           LIMIT 5`),
    // Top 5 most active classes by lesson completion
    query(`SELECT c.nama_kelas, c.tingkat,
             COUNT(CASE WHEN sp.is_completed = true THEN 1 END) as completed_count,
             COUNT(sp.id) as total_count
           FROM classes c
           JOIN students st ON st.class_id = c.id
           LEFT JOIN student_progress sp ON sp.student_id = st.id
           WHERE c.is_active = true
           GROUP BY c.id, c.nama_kelas, c.tingkat
           ORDER BY completed_count DESC
           LIMIT 5`),
    // Completion rate per class (for chart)
    query(`SELECT c.nama_kelas,
             ROUND(
               COUNT(CASE WHEN sp.is_completed = true THEN 1 END)::numeric /
               NULLIF(COUNT(sp.id), 0) * 100, 1
             ) as completion_rate
           FROM classes c
           JOIN students st ON st.class_id = c.id
           LEFT JOIN student_progress sp ON sp.student_id = st.id
           WHERE c.is_active = true
           GROUP BY c.id, c.nama_kelas
           ORDER BY c.nama_kelas
           LIMIT 8`),
  ]);

  const avgProgress = progressResult.rows[0].total > 0
    ? (progressResult.rows[0].completed / progressResult.rows[0].total * 100).toFixed(2)
    : 0;

  return {
    total_students: parseInt(studentsResult.rows[0].total_students),
    total_classes: parseInt(classesResult.rows[0].total_classes),
    total_lessons: parseInt(lessonsResult.rows[0].total_lessons),
    total_quizzes: parseInt(quizzesResult.rows[0].total_quizzes),
    total_teachers: parseInt(teachersResult.rows[0].total_teachers),
    total_subjects: parseInt(subjectsResult.rows[0].total_subjects),
    average_progress: parseFloat(avgProgress),
    avg_quiz_score: parseFloat(quizScoreResult.rows[0].avg_score) || 0,
    total_quiz_attempts: parseInt(quizScoreResult.rows[0].total_attempts) || 0,
    completed_lessons: parseInt(progressResult.rows[0].completed) || 0,
    total_progress_records: parseInt(progressResult.rows[0].total) || 0,
    recent_activity: recentActivityResult.rows,
    top_classes: topClassesResult.rows,
    completion_by_class: completionByClassResult.rows,
  };
};

const getAllStudents = async () => {
  const result = await query(
    `SELECT 
       s.id as student_id,
       s.nis,
       u.id as user_id,
       u.nama,
       u.email,
       c.id as class_id,
       c.nama_kelas,
       c.tingkat,
       COUNT(sp.id) as total_lessons,
       COUNT(CASE WHEN sp.is_completed = true THEN 1 END) as completed_lessons
     FROM students s
     JOIN users u ON s.user_id = u.id
     LEFT JOIN classes c ON s.class_id = c.id
     LEFT JOIN student_progress sp ON s.id = sp.student_id
     WHERE u.is_active = true
     GROUP BY s.id, s.nis, u.id, u.nama, u.email, c.id, c.nama_kelas, c.tingkat
     ORDER BY u.nama`
  );
  
  return result.rows;
};

module.exports = {
  getStats,
  getAllStudents,
};
