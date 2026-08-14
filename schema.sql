-- ============================================================
-- SCHEMA DATABASE LMS (Learning Management System)
-- PostgreSQL Schema with Security & Performance Optimizations
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

-- ============================================================
-- 1. USERS TABLE
-- Stores all users: admin, guru (teachers), and siswa (students)
-- ============================================================
CREATE TABLE users (
    id         SERIAL PRIMARY KEY,
    nama       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL, -- bcrypt hashed password
    role       VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'guru', 'siswa')),
    is_active  BOOLEAN      DEFAULT TRUE, -- for soft delete / account deactivation
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster login queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 2. CLASSES TABLE
-- Stores class information (e.g., "Kelas 1A", "Kelas 2B")
-- ============================================================
CREATE TABLE classes (
    id          SERIAL PRIMARY KEY,
    nama_kelas  VARCHAR(100) NOT NULL,
    tingkat     INTEGER      NOT NULL CHECK (tingkat BETWEEN 1 AND 6),
    deskripsi   TEXT,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Index for filtering by tingkat
CREATE INDEX idx_classes_tingkat ON classes(tingkat);

-- ============================================================
-- 3. STUDENTS TABLE
-- Links users with role='siswa' to their class
-- ============================================================
CREATE TABLE students (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id    INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    nis         VARCHAR(50) UNIQUE, -- Nomor Induk Siswa (optional)
    nisn        VARCHAR(10) UNIQUE, -- Nomor Induk Siswa Nasional (10 digit, for login)
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id) -- One user can only be one student
);

-- Index for faster student lookups
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_students_nisn ON students(nisn);

-- ============================================================
-- 4. SUBJECTS TABLE
-- Stores mata pelajaran (e.g., Matematika, Bahasa Indonesia)
-- ============================================================
CREATE TABLE subjects (
    id          SERIAL PRIMARY KEY,
    nama_mapel  VARCHAR(100) NOT NULL UNIQUE,
    deskripsi   TEXT,
    icon_url    VARCHAR(255), -- URL for subject icon/image
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. CLASS_SUBJECTS TABLE
-- Assigns subjects to classes with a teacher
-- (Many-to-Many relationship between classes and subjects)
-- ============================================================
CREATE TABLE class_subjects (
    id          SERIAL PRIMARY KEY,
    class_id    INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id  INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id) -- Prevent duplicate assignment
);

-- Index for faster queries
CREATE INDEX idx_class_subjects_class_id ON class_subjects(class_id);
CREATE INDEX idx_class_subjects_subject_id ON class_subjects(subject_id);
CREATE INDEX idx_class_subjects_teacher_id ON class_subjects(teacher_id);

-- ============================================================
-- 6. LESSONS TABLE
-- Stores materi/bab for each class_subject
-- ============================================================
CREATE TABLE lessons (
    id               SERIAL PRIMARY KEY,
    class_subject_id INTEGER NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
    judul_bab        VARCHAR(200) NOT NULL,
    konten_teks      TEXT,
    media_url        VARCHAR(500), -- YouTube URL
    pdf_url          VARCHAR(500), -- Uploaded PDF file path
    urutan           INTEGER DEFAULT 0, -- Ordering of lessons
    is_published     BOOLEAN DEFAULT FALSE, -- Draft/published status
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for ordering and filtering
CREATE INDEX idx_lessons_class_subject_id ON lessons(class_subject_id);
CREATE INDEX idx_lessons_urutan ON lessons(urutan);

-- ============================================================
-- 7. QUIZZES TABLE
-- Stores multiple-choice questions for each lesson
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
    poin            INTEGER DEFAULT 10, -- Points for correct answer
    urutan          INTEGER DEFAULT 0,  -- Ordering of quiz questions
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster quiz retrieval
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);

-- ============================================================
-- 8. STUDENT_PROGRESS TABLE
-- Tracks lesson completion status for each student
-- ============================================================
CREATE TABLE student_progress (
    id            SERIAL PRIMARY KEY,
    student_id    INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lesson_id     INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed  BOOLEAN DEFAULT FALSE,
    completed_at  TIMESTAMP,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, lesson_id) -- One progress record per student per lesson
);

-- Index for performance
CREATE INDEX idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX idx_student_progress_lesson_id ON student_progress(lesson_id);
CREATE INDEX idx_student_progress_completed ON student_progress(is_completed);

-- ============================================================
-- 9. QUIZ_SCORES TABLE
-- Stores student answers and scores for quizzes
-- ============================================================
CREATE TABLE quiz_scores (
    id            SERIAL PRIMARY KEY,
    student_id    INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    quiz_id       INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    jawaban_siswa CHAR(1) NOT NULL CHECK (jawaban_siswa IN ('a','b','c','d')),
    is_correct    BOOLEAN NOT NULL,
    poin_didapat  INTEGER DEFAULT 0, -- Points earned
    scored_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, quiz_id) -- Allow only one answer per student per quiz
);

-- Index for performance
CREATE INDEX idx_quiz_scores_student_id ON quiz_scores(student_id);
CREATE INDEX idx_quiz_scores_quiz_id ON quiz_scores(quiz_id);

-- ============================================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
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

-- ============================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================

-- NOTE: All passwords are hashed with bcrypt (10 rounds)
-- These are REAL working hashes generated with bcrypt
-- Login credentials:
--   Admin: admin@lms.com / admin123
--   Admin: admin2@lms.com / admin123
--   Guru:  budi@lms.com / guru123  
--   Siswa: andi@lms.com / siswa123

-- Insert admin user (password: admin123)
INSERT INTO users (nama, email, password, role) VALUES
('Admin Utama', 'admin@lms.com', '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW', 'admin'),
('admin', 'admin2@lms.com', '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW', 'admin');

-- Insert sample guru (password: guru123)
INSERT INTO users (nama, email, password, role) VALUES
('Budi Santoso', 'budi@lms.com', '$2b$10$CWdiNKynZbzWukCzjSzE4.ddM3TpC6Gm0vOmq1h45Mfwm3otA5BCm', 'guru'),
('Siti Nurhaliza', 'siti@lms.com', '$2b$10$CWdiNKynZbzWukCzjSzE4.ddM3TpC6Gm0vOmq1h45Mfwm3otA5BCm', 'guru');

-- Insert sample siswa (password: siswa123)
INSERT INTO users (nama, email, password, role) VALUES
('Andi Wijaya', 'andi@lms.com', '$2b$10$OCMQCc0h9cMPQfCZrwcSAuHKgbVcLRsFOnLFnBpmhSGfcS2/Fidu.', 'siswa'),
('Rina Putri', 'rina@lms.com', '$2b$10$OCMQCc0h9cMPQfCZrwcSAuHKgbVcLRsFOnLFnBpmhSGfcS2/Fidu.', 'siswa');

-- Insert sample classes
INSERT INTO classes (nama_kelas, tingkat, deskripsi) VALUES
('Kelas 1A', 1, 'Kelas Satu A'),
('Kelas 1B', 1, 'Kelas Satu B'),
('Kelas 2A', 2, 'Kelas Dua A');

-- Link siswa to classes
INSERT INTO students (user_id, class_id, nis, nisn) VALUES
(4, 1, '2024001', '1234567890'), -- Andi di Kelas 1A
(5, 1, '2024002', '0987654321'); -- Rina di Kelas 1A

-- Insert sample subjects
INSERT INTO subjects (nama_mapel, deskripsi) VALUES
('Matematika', 'Mata pelajaran Matematika'),
('Bahasa Indonesia', 'Mata pelajaran Bahasa Indonesia'),
('IPA', 'Ilmu Pengetahuan Alam');

-- Assign subjects to classes
INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES
(1, 1, 2), -- Matematika di Kelas 1A diajar Budi
(1, 2, 3), -- Bahasa Indonesia di Kelas 1A diajar Siti
(1, 3, 2); -- IPA di Kelas 1A diajar Budi

-- ============================================================
-- NOTES:
-- 1. All passwords in sample data are placeholder hashes
--    Replace with actual bcrypt hashes in production
-- 2. Indexes are created for frequently queried columns
-- 3. Triggers auto-update the updated_at timestamp
-- 4. UNIQUE constraints prevent duplicate data
-- 5. CASCADE deletes maintain referential integrity
-- ============================================================
