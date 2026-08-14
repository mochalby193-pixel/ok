-- Migration: Tambah kolom pdf_url ke tabel lessons
-- Jalankan jika tabel lessons tidak punya kolom pdf_url

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);

-- Verifikasi hasilnya
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;
