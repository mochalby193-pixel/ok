# 🗄️ DATABASE SETUP GUIDE

## Error yang Anda Alami
```
error: kolom "email" tidak ada
```

**PENYEBAB**: Tabel `users` belum dibuat di database. Schema SQL belum diimport.

---

## ✅ SOLUSI: Import Database Schema

### Method 1: Menggunakan psql Command Line (RECOMMENDED)

#### Step 1: Buat Database
```bash
# Buka cmd/PowerShell, login ke PostgreSQL
psql -U postgres

# Di dalam psql console, buat database:
CREATE DATABASE lms_db;

# Keluar dari psql
\q
```

#### Step 2: Import Schema
```bash
# Import schema.sql ke database lms_db
psql -U postgres -d lms_db -f schema.sql
```

**Output yang benar:**
```
DROP TABLE
DROP TABLE
...
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
INSERT 0 1
INSERT 0 2
...
```

#### Step 3: Verifikasi
```bash
# Login ke database
psql -U postgres -d lms_db

# Cek tabel users
\d users

# Cek data users
SELECT id, nama, email, role FROM users;
```

**Hasil yang diharapkan:**
```
 id |     nama      |      email       |  role  
----+---------------+------------------+--------
  1 | Admin Utama   | admin@lms.com    | admin
  2 | Budi Santoso  | budi@lms.com     | guru
  3 | Siti Nurhaliza| siti@lms.com     | guru
  4 | Andi Wijaya   | andi@lms.com     | siswa
  5 | Rina Putri    | rina@lms.com     | siswa
```

---

### Method 2: Menggunakan pgAdmin (GUI)

1. Buka **pgAdmin**
2. Klik kanan pada **Databases** → **Create** → **Database**
3. Nama: `lms_db` → **Save**
4. Klik kanan `lms_db` → **Query Tool**
5. Buka file `schema.sql` → Copy semua isi
6. Paste di Query Tool → Klik **Execute** (tombol Play ▶️)
7. Periksa hasil di **Output panel**

---

### Method 3: Menggunakan DBeaver / DataGrip

1. Buat koneksi PostgreSQL baru
2. Buat database: `lms_db`
3. Klik kanan database → **Execute SQL Script**
4. Pilih file `schema.sql` → **Execute**

---

## 🔐 PASSWORDS SUDAH FIXED!

File `schema.sql` sekarang berisi **bcrypt hashes yang VALID**:

```javascript
admin@lms.com  / admin123
budi@lms.com   / guru123
andi@lms.com   / siswa123
```

Hash passwords ini sudah **DIUJI dan BEKERJA 100%** dengan bcrypt.compare().

---

## 🔍 TROUBLESHOOTING

### Error: "database lms_db does not exist"
**Solusi**: Buat database dulu
```bash
psql -U postgres -c "CREATE DATABASE lms_db;"
```

### Error: "psql command not found"
**Solusi**: Tambahkan PostgreSQL ke PATH
```bash
# Windows (contoh path):
setx PATH "%PATH%;C:\Program Files\PostgreSQL\16\bin"
```
Atau gunakan pgAdmin (Method 2).

### Error: "password authentication failed"
**Solusi**: 
1. Cek password PostgreSQL Anda
2. Atau edit `.env` sesuai kredensial PostgreSQL Anda:
```env
DB_USER=postgres
DB_PASSWORD=password_anda
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db
```

### Error: "role postgres does not exist"
**Solusi**: Ganti `postgres` dengan username PostgreSQL Anda
```bash
psql -U your_username -d lms_db -f schema.sql
```

---

## 📋 CHECKLIST

Sebelum menjalankan aplikasi, pastikan:

- [ ] Database `lms_db` sudah dibuat
- [ ] File `schema.sql` sudah diimport (tanpa error)
- [ ] Tabel `users` berisi 5 data user
- [ ] File `.env` sudah dikonfigurasi dengan benar
- [ ] PostgreSQL service berjalan

---

## ▶️ CARA CEPAT (Copy-Paste)

```bash
# 1. Buat database
psql -U postgres -c "CREATE DATABASE lms_db;"

# 2. Import schema
psql -U postgres -d lms_db -f schema.sql

# 3. Verifikasi
psql -U postgres -d lms_db -c "SELECT id, nama, email, role FROM users;"

# 4. Jalankan server
npm start
```

---

## ✅ SETELAH SETUP BERHASIL

Anda bisa login dengan:

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | admin@lms.com    | admin123   |
| Guru  | budi@lms.com     | guru123    |
| Siswa | andi@lms.com     | siswa123   |

**Password hash sudah VALID dan TESTED!** ✅
