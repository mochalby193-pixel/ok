-- ============================================================
-- SCHEMA DATABASE LMS (Learning Management System)
-- Multi-Tenant (Multi-School) Version
-- ============================================================

-- Drop tables in correct order (reverse of creation due to foreign keys)
DROP TABLE IF EXISTS quiz_scores CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS class_subjects CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- ============================================================
-- 0. SCHOOLS TABLE
-- ============================================================
CREATE TABLE schools (
    id         SERIAL PRIMARY KEY,
    nama       VARCHAR(150) NOT NULL,
    kode       VARCHAR(20) UNIQUE,   -- NPSN atau kode sekolah
    alamat     TEXT,
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schools_kode ON schools(kode);

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    school_id     INTEGER REFERENCES schools(id) ON DELETE SET NULL,
    nama          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('superadmin','pengawas','admin','guru','siswa')),
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school_id ON users(school_id);

-- ============================================================
-- 2. CLASSES TABLE
-- ============================================================
CREATE TABLE classes (
    id          SERIAL PRIMARY KEY,
    school_id   INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    nama_kelas  VARCHAR(100) NOT NULL,
    tingkat     INTEGER      NOT NULL CHECK (tingkat BETWEEN 1 AND 6),
    deskripsi   TEXT,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_tingkat ON classes(tingkat);
CREATE INDEX idx_classes_school_id ON classes(school_id);

-- ============================================================
-- 3. STUDENTS TABLE
-- ============================================================
CREATE TABLE students (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id    INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    nis         VARCHAR(50) UNIQUE,
    nisn        VARCHAR(10) UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_nisn ON students(nisn);

-- ============================================================
-- 4. SUBJECTS TABLE
-- ============================================================
CREATE TABLE subjects (
    id          SERIAL PRIMARY KEY,
    school_id   INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    nama_mapel  VARCHAR(100) NOT NULL,
    deskripsi   TEXT,
    icon_url    VARCHAR(255),
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, nama_mapel)
);

CREATE INDEX idx_subjects_school_id ON subjects(school_id);

-- ============================================================
-- 5. CLASS_SUBJECTS TABLE
-- ============================================================
CREATE TABLE class_subjects (
    id          SERIAL PRIMARY KEY,
    class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id)
);

CREATE INDEX idx_class_subjects_class_id ON class_subjects(class_id);
CREATE INDEX idx_class_subjects_subject_id ON class_subjects(subject_id);
CREATE INDEX idx_class_subjects_teacher_id ON class_subjects(teacher_id);

-- ============================================================
-- 6. LESSONS TABLE
-- ============================================================
CREATE TABLE lessons (
    id               SERIAL PRIMARY KEY,
    class_subject_id INTEGER NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
    judul_bab        VARCHAR(200) NOT NULL,
    konten_teks      TEXT,
    media_url        VARCHAR(500),
    pdf_url          VARCHAR(500),
    urutan           INTEGER DEFAULT 0,
    is_published     BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_class_subject_id ON lessons(class_subject_id);
CREATE INDEX idx_lessons_urutan ON lessons(urutan);

-- ============================================================
-- 7. QUIZZES TABLE
-- ============================================================
CREATE TABLE quizzes (
    id              SERIAL PRIMARY KEY,
    lesson_id       INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    pertanyaan      TEXT NOT NULL,
    pilihan_a       TEXT NOT NULL,
    pilihan_b       TEXT NOT NULL,
    pilihan_c       TEXT NOT NULL,
    pilihan_d       TEXT NOT NULL,
    jawaban_benar   CHAR(1) NOT NULL CHECK (jawaban_benar IN ('a','b','c','d')),
    poin            INTEGER DEFAULT 10,
    urutan          INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);

-- ============================================================
-- 8. STUDENT_PROGRESS TABLE
-- ============================================================
CREATE TABLE student_progress (
    id            SERIAL PRIMARY KEY,
    student_id    INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lesson_id     INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed  BOOLEAN DEFAULT FALSE,
    completed_at  TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, lesson_id)
);

CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_lesson_id ON student_progress(lesson_id);
CREATE INDEX idx_student_progress_completed ON student_progress(is_completed);

-- ============================================================
-- 9. QUIZ_SCORES TABLE
-- ============================================================
CREATE TABLE quiz_scores (
    id            SERIAL PRIMARY KEY,
    student_id    INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quiz_id       INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    jawaban_siswa CHAR(1) NOT NULL CHECK (jawaban_siswa IN ('a','b','c','d')),
    is_correct    BOOLEAN NOT NULL,
    poin_didapat  INTEGER DEFAULT 0,
    scored_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, quiz_id)
);

CREATE INDEX idx_quiz_scores_student_id ON quiz_scores(student_id);
CREATE INDEX idx_quiz_scores_quiz_id ON quiz_scores(quiz_id);

-- ============================================================
-- 10. USER_REQUESTS TABLE
-- Permintaan pembuatan akun dari pengawas, disetujui superadmin
-- ============================================================
CREATE TABLE user_requests (
    id           SERIAL PRIMARY KEY,
    school_id    INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    nama         VARCHAR(100) NOT NULL,
    email        VARCHAR(150) NOT NULL,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(20) NOT NULL DEFAULT 'admin',
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'approved', 'rejected')),
    requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    note         TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_requests_status    ON user_requests(status);
CREATE INDEX idx_user_requests_school_id ON user_requests(school_id);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_subjects_updated_at BEFORE UPDATE ON class_subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_requests_updated_at BEFORE UPDATE ON user_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Sekolah pertama (data existing)
INSERT INTO schools (id, nama, kode, alamat) VALUES
(1, 'SDN Suco 1', 'SUCO01', 'Jember, Jawa Timur');

-- Reset sequence
SELECT setval('schools_id_seq', 1);

-- Pengawas (school_id = NULL, tidak terikat sekolah)
-- pengawas@lms.com / admin123
INSERT INTO users (school_id, nama, email, password, role) VALUES
(NULL, 'Pengawas', 'pengawas@lms.com', '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW', 'pengawas');

-- Super Admin (school_id = 1)
-- superadmin@lms.com / ADMIN123
INSERT INTO users (school_id, nama, email, password, role) VALUES
(1, 'Super Admin', 'superadmin@lms.com', '$2b$10$/vZidNtY8llqgB0ETF/BNO5TNJRhBm4o4a0i0dg05h6aKRSxGCtL.', 'superadmin');

-- Admin sekolah pertama (school_id = 1)
-- admin@lms.com / admin123
INSERT INTO users (school_id, nama, email, password, role) VALUES
(1, 'Admin Utama', 'admin@lms.com', '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW', 'admin'),
(1, 'admin', 'admin2@lms.com', '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW', 'admin');

-- Guru (school_id = 1)
-- guru123
INSERT INTO users (school_id, nama, email, password, role) VALUES
(1, 'Budi Santoso', 'budi@lms.com', '$2b$10$CWdiNKynZbzWukCzjSzE4.ddM3TpC6Gm0vOmq1h45Mfwm3otA5BCm', 'guru'),
(1, 'Siti Nurhaliza', 'siti@lms.com', '$2b$10$CWdiNKynZbzWukCzjSzE4.ddM3TpC6Gm0vOmq1h45Mfwm3otA5BCm', 'guru');

-- Siswa (school_id = 1)
-- siswa123
INSERT INTO users (school_id, nama, email, password, role) VALUES
(1, 'Andi Wijaya', 'andi@lms.com', '$2b$10$OCMQCc0h9cMPQfCZrwcSAuHKgbVcLRsFOnLFnBpmhSGfcS2/Fidu.', 'siswa'),
(1, 'Rina Putri', 'rina@lms.com', '$2b$10$OCMQCc0h9cMPQfCZrwcSAuHKgbVcLRsFOnLFnBpmhSGfcS2/Fidu.', 'siswa');

-- Classes (school_id = 1)
INSERT INTO classes (school_id, nama_kelas, tingkat, deskripsi) VALUES
(1, 'Kelas 1A', 1, 'Kelas Satu A'),
(1, 'Kelas 1B', 1, 'Kelas Satu B'),
(1, 'Kelas 2A', 2, 'Kelas Dua A');

-- Students
INSERT INTO students (user_id, class_id, nis, nisn) VALUES
(7, 1, '2024001', '1234567890'),
(8, 1, '2024002', '0987654321');

-- Subjects (school_id = 1)
INSERT INTO subjects (school_id, nama_mapel, deskripsi) VALUES
(1, 'Matematika', 'Mata pelajaran Matematika'),
(1, 'Bahasa Indonesia', 'Mata pelajaran Bahasa Indonesia'),
(1, 'IPA', 'Ilmu Pengetahuan Alam');

-- Class subjects
INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES
(1, 1, 5),
(1, 2, 6),
(1, 3, 5);

-- ============================================================
-- Login credentials:
--   Pengawas : pengawas@lms.com / admin123
--   SuperAdmin: superadmin@lms.com / ADMIN123
--   Admin    : admin@lms.com / admin123
--   Guru     : budi@lms.com / guru123
--   Siswa    : andi@lms.com / siswa123 (atau NISN: 1234567890)
-- ============================================================
