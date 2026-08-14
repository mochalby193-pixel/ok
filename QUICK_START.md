# ⚡ QUICK START GUIDE - LMS Application

Panduan cepat untuk menjalankan aplikasi LMS dalam 5 menit!

---

## 🎯 Prerequisites

Pastikan sudah terinstall:
- ✅ Node.js v18+ ([Download](https://nodejs.org/))
- ✅ PostgreSQL v14+ ([Download](https://www.postgresql.org/download/))
- ✅ Git ([Download](https://git-scm.com/))

---

## 🚀 Installation (5 Steps)

### Step 1: Clone & Install Backend

```bash
# Masuk ke folder project
cd d:\2.PROJEK\KIRO\appscript

# Install dependencies backend
npm install
```

### Step 2: Setup Database

```bash
# Buka PostgreSQL (Windows)
# Method 1: Via psql command
psql -U postgres

# Method 2: Via pgAdmin GUI
# Buka pgAdmin → Create Database
```

**Di psql, jalankan:**
```sql
-- Create database
CREATE DATABASE lms_db;

-- Exit psql
\q
```

**Import schema:**
```bash
# Windows (CMD)
psql -U postgres -d lms_db -f schema.sql

# Jika ada error password, tambahkan:
set PGPASSWORD=your_postgres_password
psql -U postgres -d lms_db -f schema.sql
```

### Step 3: Configure Environment

```bash
# Copy .env.example ke .env
copy .env.example .env

# Edit .env (gunakan Notepad)
notepad .env
```

**Update nilai berikut:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=lms_db
JWT_SECRET=my-super-secret-jwt-key-2024
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Step 4: Install Frontend

```bash
# Masuk ke folder client
cd client

# Install dependencies frontend
npm install

# Copy .env.example
copy .env.example .env
```

### Step 5: Run Application

**Terminal 1 - Backend:**
```bash
# Dari folder appscript/
npm run dev

# Tunggu sampai muncul:
# ✅ Connected to PostgreSQL database
# 🚀 Server running on: http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
# Dari folder appscript/client/
npm run dev

# Tungil sampai muncul:
# ➜  Local:   http://localhost:5173/
```

---

## 🎉 Success! Aplikasi Siap Digunakan

Buka browser dan akses: **http://localhost:5173**

---

## 🔑 Login Demo Accounts

### Admin
- Email: `admin@lms.com`
- Password: `admin123`
- Akses: Dashboard Admin, CRUD semua data

### Guru
- Email: `budi@lms.com`
- Password: `guru123`
- Akses: Dashboard Admin, CRUD kelas & materi

### Siswa
- Email: `andi@lms.com`
- Password: `siswa123`
- Akses: Dashboard Siswa, Belajar & Kuis

---

## 🔍 Testing API

### Test Backend API
Buka browser: **http://localhost:5000**

Harusnya muncul:
```json
{
  "success": true,
  "message": "LMS API Server is running",
  "version": "1.0.0"
}
```

### Test Login API
```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@lms.com","password":"admin123"}'

# Windows (CMD) - gunakan curl
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@lms.com\",\"password\":\"admin123\"}"
```

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot find module"
```bash
# Solution: Install dependencies lagi
npm install

# Atau hapus node_modules dan install ulang
rmdir /s node_modules
npm install
```

### ❌ Error: "Database connection error"
**Cek PostgreSQL running:**
```bash
# Windows: Buka Services (Win + R → services.msc)
# Cari "postgresql-x64-14" → pastikan Status = Running

# Atau via command:
pg_ctl status
```

**Cek credentials di .env:**
- DB_HOST, DB_USER, DB_PASSWORD harus benar
- Database `lms_db` sudah dibuat
- Schema sudah di-import

### ❌ Error: "Port 5000 already in use"
```bash
# Windows: Kill process di port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Atau ganti PORT di .env
PORT=5001
```

### ❌ Error: "CORS policy blocked"
Pastikan:
- Backend running di port 5000
- Frontend running di port 5173
- `CLIENT_URL` di backend .env = `http://localhost:5173`

### ❌ Error: Frontend tidak muncul
```bash
# Cek apakah Vite running
# Terminal harus menunjukkan:
# ➜  Local:   http://localhost:5173/

# Jika tidak, jalankan:
npm run dev
```

---

## 📂 File Structure Overview

```
appscript/
├── server.js           → Backend entry point
├── .env                → Environment config (EDIT INI!)
├── schema.sql          → Database schema
├── package.json        → Backend dependencies
├── config/             → Database & JWT config
├── features/           → API features (7 modules)
│   ├── auth/
│   ├── classes/
│   ├── subjects/
│   ├── lessons/
│   ├── quizzes/
│   ├── students/
│   └── admin/
└── client/             → Frontend React
    ├── src/
    │   ├── pages/      → Login, Dashboard, dll
    │   ├── components/ → Reusable components
    │   └── services/   → API calls
    └── package.json    → Frontend dependencies
```

---

## 🎓 Next Steps

1. **Login sebagai Admin** → Buat kelas baru
2. **Tambah Mata Pelajaran** → Matematika, IPA, dll
3. **Upload Materi** → Tambah konten pelajaran
4. **Buat Kuis** → Tambah soal pilihan ganda
5. **Login sebagai Siswa** → Test belajar & kuis

---

## 📚 Documentation

- [README.md](./README.md) - Full documentation
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API endpoints
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Deploy to production
- [PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md) - Implementation summary

---

## 🆘 Need Help?

### Common Issues:
1. **PostgreSQL not installed?**
   - Download: https://www.postgresql.org/download/windows/
   - Default port: 5432
   - Default user: postgres

2. **Node.js version too old?**
   ```bash
   node --version  # Should be v18+
   ```

3. **npm install gagal?**
   ```bash
   # Clear cache
   npm cache clean --force
   npm install
   ```

### Still stuck?
1. Check error messages carefully
2. Read error logs
3. Google the error message
4. Check documentation files

---

## ✅ Checklist Completion

- [ ] PostgreSQL installed & running
- [ ] Database `lms_db` created
- [ ] Schema imported successfully
- [ ] Backend `.env` configured
- [ ] Backend `npm install` success
- [ ] Backend running (port 5000)
- [ ] Frontend `npm install` success
- [ ] Frontend running (port 5173)
- [ ] Can access http://localhost:5173
- [ ] Can login with demo account
- [ ] Test create class (admin)
- [ ] Test student dashboard (siswa)

**Semua checklist ✓?** → **Selamat! Aplikasi LMS siap digunakan! 🎉**

---

**Estimated Setup Time:** 5-10 minutes  
**Difficulty:** ⭐⭐☆☆☆ (Easy)

Good luck! 🚀
