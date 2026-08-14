const path = require('path');
const XLSX = require('xlsx');
const { success, error } = require('../../shared/utils/response');
const { STATUS_CODES } = require('../../shared/constants');
const lessonsService = require('./lessons.service');

// ─── GET ALL ─────────────────────────────────────────────────────────────────
const getAllLessons = async (req, res) => {
  try {
    const { class_subject_id } = req.query;
    // Guru hanya lihat materi dari penugasannya
    const teacherId = req.user.role === 'guru' ? req.user.id : null;
    const lessons = await lessonsService.getAllLessons(class_subject_id, teacherId);
    return success(res, lessons, 'Lessons retrieved successfully');
  } catch (err) {
    console.error('Get lessons error:', err);
    return error(res, 'Failed to get lessons', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── GET BY ID ────────────────────────────────────────────────────────────────
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const lesson = await lessonsService.getLessonById(id);
    if (!lesson) return error(res, 'Lesson not found', STATUS_CODES.NOT_FOUND);
    return success(res, lesson, 'Lesson retrieved successfully');
  } catch (err) {
    console.error('Get lesson error:', err);
    return error(res, 'Failed to get lesson', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── GET CLASS SUBJECTS DROPDOWN ──────────────────────────────────────────────
const getClassSubjects = async (req, res) => {
  try {
    // Guru hanya lihat penugasan miliknya sendiri
    const teacherId = req.user.role === 'guru' ? req.user.id : null;
    const classSubjects = await lessonsService.getClassSubjects(teacherId);
    return success(res, classSubjects, 'Class subjects retrieved successfully');
  } catch (err) {
    console.error('Get class subjects error:', err);
    return error(res, 'Failed to get class subjects', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
const createLesson = async (req, res) => {
  try {
    const lessonData = { ...req.body };

    // Attach uploaded PDF path if present
    if (req.file) {
      lessonData.pdf_url = `/uploads/${req.file.filename}`;
    }

    if (!lessonData.class_subject_id) {
      return error(res, 'class_subject_id wajib diisi', STATUS_CODES.BAD_REQUEST);
    }
    if (!lessonData.judul_bab || lessonData.judul_bab.trim().length < 3) {
      return error(res, 'Judul bab minimal 3 karakter', STATUS_CODES.BAD_REQUEST);
    }

    const newLesson = await lessonsService.createLesson(lessonData);
    return success(res, newLesson, 'Lesson created successfully', STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Create lesson error:', err);
    return error(res, 'Failed to create lesson', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const lessonData = { ...req.body };

    if (req.file) {
      lessonData.pdf_url = `/uploads/${req.file.filename}`;
    }

    // Guru hanya boleh edit materi dari penugasannya
    if (req.user.role === 'guru') {
      const existing = await lessonsService.getLessonById(id);
      if (!existing) return error(res, 'Lesson not found', STATUS_CODES.NOT_FOUND);
      const cs = await lessonsService.getClassSubjectById(existing.class_subject_id);
      if (!cs || String(cs.teacher_id) !== String(req.user.id)) {
        return error(res, 'Anda tidak memiliki akses ke materi ini', STATUS_CODES.FORBIDDEN);
      }
    }

    const updatedLesson = await lessonsService.updateLesson(id, lessonData);
    if (!updatedLesson) return error(res, 'Lesson not found', STATUS_CODES.NOT_FOUND);
    return success(res, updatedLesson, 'Lesson updated successfully');
  } catch (err) {
    console.error('Update lesson error:', err);
    return error(res, 'Failed to update lesson', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    // Guru hanya boleh hapus materi dari penugasannya
    if (req.user.role === 'guru') {
      const existing = await lessonsService.getLessonById(id);
      if (!existing) return error(res, 'Lesson not found', STATUS_CODES.NOT_FOUND);
      const cs = await lessonsService.getClassSubjectById(existing.class_subject_id);
      if (!cs || String(cs.teacher_id) !== String(req.user.id)) {
        return error(res, 'Anda tidak memiliki akses ke materi ini', STATUS_CODES.FORBIDDEN);
      }
    }

    const deletedLesson = await lessonsService.deleteLesson(id);
    if (!deletedLesson) return error(res, 'Lesson not found', STATUS_CODES.NOT_FOUND);
    return success(res, deletedLesson, 'Lesson deleted successfully');
  } catch (err) {
    console.error('Delete lesson error:', err);
    return error(res, 'Failed to delete lesson', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── IMPORT QUIZ FROM EXCEL ───────────────────────────────────────────────────
const importQuizFromExcel = async (req, res) => {
  try {
    const { id: lessonId } = req.params;

    if (!req.file) {
      return error(res, 'File Excel wajib diunggah', STATUS_CODES.BAD_REQUEST);
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      return error(res, 'File Excel kosong atau format tidak sesuai', STATUS_CODES.BAD_REQUEST);
    }

    // Map Excel columns → quiz fields
    // Expected columns: pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, poin, urutan
    const quizzes = rows.map((row, idx) => ({
      pertanyaan: row['pertanyaan'] || row['Pertanyaan'],
      pilihan_a: row['pilihan_a'] || row['Pilihan A'],
      pilihan_b: row['pilihan_b'] || row['Pilihan B'],
      pilihan_c: row['pilihan_c'] || row['Pilihan C'],
      pilihan_d: row['pilihan_d'] || row['Pilihan D'],
      jawaban_benar: String(row['jawaban_benar'] || row['Jawaban Benar'] || 'a'),
      poin: parseInt(row['poin'] || row['Poin']) || 10,
      urutan: idx + 1,
    }));

    // Validate required fields
    const invalid = quizzes.filter(
      (q) => !q.pertanyaan || !q.pilihan_a || !q.pilihan_b || !q.pilihan_c || !q.pilihan_d
    );
    if (invalid.length) {
      return error(
        res,
        `${invalid.length} baris tidak lengkap. Pastikan kolom pertanyaan, pilihan_a–d, jawaban_benar terisi.`,
        STATUS_CODES.BAD_REQUEST
      );
    }

    const created = await lessonsService.bulkCreateQuizzes(lessonId, quizzes);
    return success(res, created, `${created.length} soal berhasil diimpor`, STATUS_CODES.CREATED);
  } catch (err) {
    console.error('Import quiz error:', err);
    return error(res, 'Gagal mengimpor kuis: ' + err.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── JUMLAH SISWA PER CLASS SUBJECT ──────────────────────────────────────────
/**
 * GET /api/lessons/student-counts
 * Mengembalikan jumlah siswa aktif per class_subject.
 * Guru hanya melihat class_subject miliknya.
 */
const getStudentCounts = async (req, res) => {
  try {
    const teacherId = req.user.role === 'guru' ? req.user.id : null;
    const counts = await lessonsService.getStudentCountPerClassSubject(teacherId);
    return success(res, counts, 'Student counts retrieved successfully');
  } catch (err) {
    console.error('Get student counts error:', err);
    return error(res, 'Failed to get student counts', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── SUDAH KERJAKAN PER CLASS SUBJECT ────────────────────────────────────────
/**
 * GET /api/lessons/sudah-kerjakan
 * Mengembalikan jumlah siswa yang sudah mengerjakan minimal 1 kuis
 * per class_subject. Guru hanya melihat miliknya.
 */
const getSudahKerjakan = async (req, res) => {
  try {
    const teacherId = req.user.role === 'guru' ? req.user.id : null;
    const counts = await lessonsService.getSudahKerjakanPerClassSubject(teacherId);
    return success(res, counts, 'Sudah kerjakan counts retrieved successfully');
  } catch (err) {
    console.error('Get sudah kerjakan error:', err);
    return error(res, 'Failed to get sudah kerjakan counts', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── REKAP NILAI SEMUA MATERI ─────────────────────────────────────────────────
/**
 * GET /api/lessons/rekap-nilai
 * Guru: hanya materi miliknya. Admin: semua materi.
 * Query params opsional: lesson_id (filter satu materi), format=excel (unduh xlsx)
 */
const getRekapNilai = async (req, res) => {
  try {
    const teacherId = req.user.role === 'guru' ? req.user.id : null;
    const { lesson_id, format } = req.query;

    const rows = await lessonsService.getAllLessonsScores({
      teacherId,
      lessonId: lesson_id || null,
    });

    // ── JSON response ────────────────────────────────────────────────────────
    if (format !== 'excel') {
      return success(res, rows, 'Rekap nilai berhasil diambil');
    }

    // ── Excel export ─────────────────────────────────────────────────────────
    const sheetRows = rows.map((r, i) => ({
      'No':              i + 1,
      'Mata Pelajaran':  r.nama_mapel,
      'Judul Materi':    r.judul_bab,
      'Kelas':           `${r.nama_kelas} (${r.tingkat})`,
      'Nama Siswa':      r.nama_siswa,
      'NISN':            r.nisn || '-',
      'Total Soal':      parseInt(r.total_soal),
      'Soal Dijawab':    parseInt(r.soal_dijawab),
      'Soal Benar':      parseInt(r.soal_benar),
      'Nilai (0-100)':   r.nilai !== null ? parseInt(r.nilai) : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(sheetRows);
    ws['!cols'] = [
      { wch: 5 }, { wch: 22 }, { wch: 35 }, { wch: 20 },
      { wch: 30 }, { wch: 15 }, { wch: 11 }, { wch: 13 }, { wch: 12 }, { wch: 14 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Nilai');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const timestamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename="Rekap_Nilai_${timestamp}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (err) {
    console.error('Rekap nilai error:', err);
    return error(res, 'Gagal mengambil rekap nilai: ' + err.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── DOWNLOAD NILAI SISWA PER MATERI ─────────────────────────────────────────
const downloadStudentScores = async (req, res) => {
  try {
    const { id: lessonId } = req.params;

    // Guru hanya boleh unduh nilai dari materi miliknya
    if (req.user.role === 'guru') {
      const existing = await lessonsService.getLessonById(lessonId);
      if (!existing) return error(res, 'Materi tidak ditemukan', STATUS_CODES.NOT_FOUND);
      const cs = await lessonsService.getClassSubjectById(existing.class_subject_id);
      if (!cs || String(cs.teacher_id) !== String(req.user.id)) {
        return error(res, 'Anda tidak memiliki akses ke materi ini', STATUS_CODES.FORBIDDEN);
      }
    }

    const scores = await lessonsService.getStudentScoresByLesson(lessonId);

    if (!scores.length) {
      return error(res, 'Belum ada data nilai untuk materi ini', STATUS_CODES.NOT_FOUND);
    }

    const { nama_mapel, judul_bab, nama_kelas, tingkat } = scores[0];

    // Build worksheet rows
    const rows = scores.map((s, i) => ({
      'No': i + 1,
      'Nama Siswa': s.nama_siswa,
      'NISN': s.nisn || '-',
      'Kelas': `${s.nama_kelas} (${s.tingkat})`,
      'Soal Dijawab': parseInt(s.soal_dijawab),
      'Soal Benar': parseInt(s.soal_benar),
      'Total Soal': parseInt(s.total_soal),
      'Nilai (0-100)': parseInt(s.nilai),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 30 }, // Nama
      { wch: 15 }, // NISN
      { wch: 20 }, // Kelas
      { wch: 14 }, // Soal Dijawab
      { wch: 12 }, // Soal Benar
      { wch: 11 }, // Total Soal
      { wch: 14 }, // Nilai
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai Kuis');

    const safeTitle = judul_bab.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const filename = `Nilai_${safeTitle}_${nama_kelas}.xlsx`;

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  } catch (err) {
    console.error('Download scores error:', err);
    return error(res, 'Gagal mengunduh nilai: ' + err.message, STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

// ─── DOWNLOAD QUIZ TEMPLATE ───────────────────────────────────────────────────
const downloadQuizTemplate = async (req, res) => {  try {
    const templateData = [
      {
        pertanyaan: 'Contoh soal nomor 1?',
        pilihan_a: 'Jawaban A',
        pilihan_b: 'Jawaban B',
        pilihan_c: 'Jawaban C',
        pilihan_d: 'Jawaban D',
        jawaban_benar: 'a',
        poin: 10,
      },
      {
        pertanyaan: 'Contoh soal nomor 2?',
        pilihan_a: 'Jawaban A',
        pilihan_b: 'Jawaban B',
        pilihan_c: 'Jawaban C',
        pilihan_d: 'Jawaban D',
        jawaban_benar: 'b',
        poin: 10,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Kuis');

    // Column widths
    ws['!cols'] = [
      { wch: 40 }, // pertanyaan
      { wch: 20 }, // pilihan_a
      { wch: 20 }, // pilihan_b
      { wch: 20 }, // pilihan_c
      { wch: 20 }, // pilihan_d
      { wch: 15 }, // jawaban_benar
      { wch: 8 },  // poin
    ];

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="template_kuis.xlsx"');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
  } catch (err) {
    console.error('Download template error:', err);
    return error(res, 'Gagal membuat template', STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllLessons,
  getLessonById,
  getClassSubjects,
  getStudentCounts,
  getSudahKerjakan,
  createLesson,
  updateLesson,
  deleteLesson,
  importQuizFromExcel,
  downloadQuizTemplate,
  downloadStudentScores,
  getRekapNilai,
};
