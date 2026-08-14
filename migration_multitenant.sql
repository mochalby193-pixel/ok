-- ============================================================
-- MIGRATION: Single-tenant → Multi-tenant
-- Jalankan ini di Supabase SQL Editor (BUKAN schema.sql penuh)
-- ============================================================

-- 1. Buat tabel schools
CREATE TABLE IF NOT EXISTS schools (
    id         SERIAL PRIMARY KEY,
    nama       VARCHAR(150) NOT NULL,
    kode       VARCHAR(20) UNIQUE,
    alamat     TEXT,
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schools_kode ON schools(kode);

-- Trigger untuk schools
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_schools_updated_at ON schools;
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Insert sekolah pertama (data existing)
INSERT INTO schools (id, nama, kode, alamat)
VALUES (1, 'SDN Suco 1', 'SUCO01', 'Jember, Jawa Timur')
ON CONFLICT (id) DO NOTHING;

SELECT setval('schools_id_seq', (SELECT MAX(id) FROM schools));

-- 3. Tambah kolom school_id ke users (jika belum ada)
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL;

-- 4. Update role CHECK constraint untuk users (tambah 'pengawas')
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('pengawas', 'admin', 'guru', 'siswa'));

-- 5. Set semua user lama ke school_id = 1
UPDATE users SET school_id = 1 WHERE school_id IS NULL;

-- 6. Tambah kolom school_id ke classes (jika belum ada)
ALTER TABLE classes
    ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE;

-- 7. Set semua kelas lama ke school_id = 1
UPDATE classes SET school_id = 1 WHERE school_id IS NULL;

-- 8. Tambah kolom school_id ke subjects (jika belum ada)
ALTER TABLE subjects
    ADD COLUMN IF NOT EXISTS school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE;

-- 9. Set semua mapel lama ke school_id = 1
UPDATE subjects SET school_id = 1 WHERE school_id IS NULL;

-- 10. Ubah UNIQUE constraint subjects agar per sekolah
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_nama_mapel_key;
ALTER TABLE subjects ADD CONSTRAINT subjects_school_nama_unique
    UNIQUE (school_id, nama_mapel);

-- 11. Buat index baru
CREATE INDEX IF NOT EXISTS idx_users_school_id    ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id  ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);

-- 12. Insert pengawas (password: admin123)
INSERT INTO users (school_id, nama, email, password, role)
VALUES (NULL, 'Pengawas', 'pengawas@lms.com',
        '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW',
        'pengawas')
ON CONFLICT (email) DO NOTHING;

-- 13. Insert superadmin (password: ADMIN123)
INSERT INTO users (school_id, nama, email, password, role)
VALUES (1, 'Super Admin', 'superadmin@lms.com',
        '$2b$10$kP8/ItWB.HOt8xNNoijJJeVXkqyuJxwEeP1g5qHQJWvRoR3Bqz1Aa',
        'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Selesai. Cek hasilnya:
-- SELECT id, nama, email, role, school_id FROM users ORDER BY id;
-- SELECT * FROM schools;
-- ============================================================
