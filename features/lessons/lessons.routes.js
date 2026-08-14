const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const lessonsController = require('./lessons.controller');
const { validate } = require('../../shared/middleware/validation');
const { authenticate, adminOrGuruOnly } = require('../../shared/middleware/auth');
const { validateLesson } = require('./lessons.validator');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadPdf = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Hanya file PDF yang diizinkan'), false);
    }
  },
});

const uploadExcel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xls/.xlsx) yang diizinkan'), false);
    }
  },
});

// Class subjects dropdown
router.get('/class-subjects', authenticate, lessonsController.getClassSubjects);

// Jumlah siswa per class_subject
router.get('/student-counts', authenticate, adminOrGuruOnly, lessonsController.getStudentCounts);

// Jumlah siswa yang sudah mengerjakan per class_subject
router.get('/sudah-kerjakan', authenticate, adminOrGuruOnly, lessonsController.getSudahKerjakan);

// Quiz template download
router.get('/quiz-template', authenticate, adminOrGuruOnly, lessonsController.downloadQuizTemplate);

// Rekap nilai semua materi (JSON atau Excel)
router.get('/rekap-nilai', authenticate, adminOrGuruOnly, lessonsController.getRekapNilai);

// Download nilai siswa per materi
router.get('/:id/scores', authenticate, adminOrGuruOnly, lessonsController.downloadStudentScores);

// Lesson CRUD
router.get('/', authenticate, lessonsController.getAllLessons);
router.get('/:id', authenticate, lessonsController.getLessonById);router.post(
  '/',
  authenticate,
  adminOrGuruOnly,
  uploadPdf.single('pdf_file'),
  lessonsController.createLesson
);
router.put(
  '/:id',
  authenticate,
  adminOrGuruOnly,
  uploadPdf.single('pdf_file'),
  lessonsController.updateLesson
);
router.delete('/:id', authenticate, adminOrGuruOnly, lessonsController.deleteLesson);

// Import quiz from Excel
router.post(
  '/:id/import-quiz',
  authenticate,
  adminOrGuruOnly,
  uploadExcel.single('excel_file'),
  lessonsController.importQuizFromExcel
);

module.exports = router;
