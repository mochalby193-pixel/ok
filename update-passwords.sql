-- ============================================================
-- UPDATE PASSWORDS - Run this after importing schema.sql
-- ============================================================
-- This file updates user passwords with REAL working bcrypt hashes
-- Run: psql -U postgres -d lms_db -f update-passwords.sql
-- ============================================================

-- These are REAL hashes that will work with the passwords:
-- admin123, guru123, siswa123

-- Update admin passwords (admin123)
UPDATE users SET password = '$2b$10$NIjeriVV/QQmjsMv5FDBwOx40E2UJU.qI8Ag/hEtn4sfHq0KOi2YW' 
WHERE email IN ('admin@lms.com', 'admin2@lms.com');

-- Update guru passwords (guru123)
UPDATE users SET password = '$2b$10$CWdiNKynZbzWukCzjSzE4.ddM3TpC6Gm0vOmq1h45Mfwm3otA5BCm' 
WHERE email IN ('budi@lms.com', 'siti@lms.com');

-- Update siswa passwords (siswa123)
UPDATE users SET password = '$2b$10$OCMQCc0h9cMPQfCZrwcSAuHKgbVcLRsFOnLFnBpmhSGfcS2/Fidu.' 
WHERE email IN ('andi@lms.com', 'rina@lms.com');

-- Verify passwords updated
SELECT id, nama, email, role, 
       CASE 
         WHEN password LIKE '$2a$10$%' OR password LIKE '$2b$10$%' 
         THEN '✓ Hash valid' 
         ELSE '✗ Hash invalid' 
       END as password_status,
       substring(password, 1, 15) as hash_prefix
FROM users
ORDER BY role, id;

-- ============================================================
-- ✅ PASSWORDS ARE NOW READY!
-- ============================================================
-- You can now login with:
--   admin@lms.com / admin123
--   admin2@lms.com / admin123
--   budi@lms.com / guru123
--   andi@lms.com / siswa123
-- ============================================================
