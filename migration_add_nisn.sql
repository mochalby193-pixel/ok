-- ============================================================
-- MIGRATION: Tambah kolom NISN ke tabel students
-- Jalankan ini jika database sudah ada (tidak perlu reset)
-- ============================================================

-- Tambah kolom nisn (jika belum ada)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS nisn VARCHAR(10) UNIQUE;

-- Tambah index untuk performa query login
CREATE INDEX IF NOT EXISTS idx_students_nisn ON students(nisn);

-- Update data sample (opsional, sesuaikan dengan data nyata)
-- Andi Wijaya (user_id=4) -> NISN: 1234567890
-- Rina Putri  (user_id=5) -> NISN: 0987654321
UPDATE students SET nisn = '1234567890' WHERE user_id = 4 AND nisn IS NULL;
UPDATE students SET nisn = '0987654321' WHERE user_id = 5 AND nisn IS NULL;
