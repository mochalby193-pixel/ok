# 🔐 PASSWORD SETUP GUIDE

## ⚠️ PENTING: Setup Password Sebelum Login!

Password hash di `schema.sql` adalah **placeholder** dan **TIDAK AKAN BISA** digunakan untuk login. Anda harus generate hash yang benar terlebih dahulu.

---

## 🚀 Quick Setup (3 Langkah)

### Langkah 1: Generate Password Hashes

```bash
# Jalankan script generator
node generate-passwords.js
```

Script ini akan menghasilkan output seperti:
```
ADMIN: admin123
Hash: $2b$10$abc123def456...

GURU: guru123
Hash: $2b$10$xyz789ghi012...

SISWA: siswa123  
Hash: $2b$10$uvw345rst678...
```

### Langkah 2: Update schema.sql

Buka `schema.sql` dan ganti password hash di bagian SAMPLE DATA (line ~228-242) dengan hash yang baru di-generate.

```sql
-- Sebelum:
INSERT INTO users (nama, email, password, role) VALUES
('Admin Utama', 'admin@lms.com', 'OLD_PLACEHOLDER_HASH', 'admin');

-- Sesudah (gunakan hash dari step 1):
INSERT INTO users (nama, email, password, role) VALUES
('Admin Utama', 'admin@lms.com', '$2b$10$abc123def456...', 'admin');
```

### Langkah 3: Re-import Database

```bash
# Drop database lama
psql -U postgres
DROP DATABASE IF EXISTS lms_db;
CREATE DATABASE lms_db;
\q

# Import schema baru
psql -U postgres -d lms_db -f schema.sql
```

---

## 🔄 Alternatif: Update Database yang Sudah Ada

Jika database sudah di-import dan tidak ingin drop, gunakan `update-passwords.sql`:

### Step 1: Generate hash baru
```bash
node generate-passwords.js
```

### Step 2: Edit update-passwords.sql

Ganti hash placeholder dengan hash yang baru di-generate:

```sql
-- Ganti ini:
UPDATE users SET password = '$2a$10$PLACEHOLDER...' 
WHERE email = 'admin@lms.com';

-- Dengan ini (hash dari generate-passwords.js):
UPDATE users SET password = '$2b$10$abc123def456...' 
WHERE email = 'admin@lms.com';
```

### Step 3: Run update script
```bash
psql -U postgres -d lms_db -f update-passwords.sql
```

---

## 🧪 Testing Login

Setelah setup, test login dengan:

### Via Frontend (Browser)
1. Buka http://localhost:5173
2. Login dengan:
   - **Admin**: admin@lms.com / admin123
   - **Guru**: budi@lms.com / guru123
   - **Siswa**: andi@lms.com / siswa123

### Via API (cURL)

**Windows PowerShell:**
```powershell
$body = @{
    email = "admin@lms.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Windows CMD:**
```cmd
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@lms.com\",\"password\":\"admin123\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nama": "Admin Utama",
      "email": "admin@lms.com",
      "role": "admin",
      "student_id": null,
      "class_id": null
    }
  }
}
```

---

## 🔍 Troubleshooting

### ❌ Error: "Invalid email or password"

**Penyebab:** Password hash tidak cocok dengan password yang diinput.

**Solusi:**
1. Pastikan sudah run `node generate-passwords.js`
2. Pastikan hash sudah di-update di database
3. Pastikan password yang diketik benar (admin123, guru123, siswa123)

### ❌ Error: "Cannot find module 'bcrypt'"

**Penyebab:** Dependencies belum terinstall.

**Solusi:**
```bash
npm install
```

### ✅ Verify Password Hash di Database

```bash
psql -U postgres -d lms_db

# Check hash format
SELECT id, nama, email, role, 
       substring(password, 1, 10) as hash_prefix
FROM users;

# Valid hash should start with: $2a$10$ or $2b$10$
```

---

## 📝 Notes

1. **Bcrypt Hash Format:** `$2b$10$...` (60 characters)
2. **Salt Rounds:** 10 (good balance between security & performance)
3. **Hash Generation Time:** ~100ms per password
4. **Hash is Unique:** Setiap kali generate, hash akan berbeda (karena random salt)
5. **Password Comparison:** Gunakan `bcrypt.compare()`, jangan compare string langsung!

---

## 🔐 Production Best Practices

1. **JANGAN commit file .env** ke Git
2. **JANGAN simpan password plain text** di mana pun
3. **Generate hash baru** untuk production
4. **Gunakan password yang kuat** untuk production (min 12 karakter)
5. **Enable 2FA** untuk admin accounts (enhancement)

---

## 🛠️ Manual Password Hash Generation

Jika ingin generate hash manual:

```javascript
const bcrypt = require('bcrypt');

bcrypt.hash('your_password', 10, (err, hash) => {
  console.log(hash);
});

// Or async/await:
const hash = await bcrypt.hash('your_password', 10);
console.log(hash);
```

---

## ✅ Checklist

Before login, make sure:

- [ ] Ran `node generate-passwords.js`
- [ ] Updated schema.sql with real hashes OR
- [ ] Ran `update-passwords.sql` script
- [ ] Re-imported database (if using new schema)
- [ ] Verified hash format in database (starts with $2a$10$ or $2b$10$)
- [ ] Backend running (port 5000)
- [ ] Frontend running (port 5173)
- [ ] Tested login via browser or API

---

**Setelah setup password, login akan berfungsi dengan sempurna!** ✅
