# 🎓 LMS - Learning Management System

Aplikasi Learning Management System (LMS) dengan arsitektur **feature-based**, dibangun menggunakan **Node.js + Express + PostgreSQL** (Backend) dan **React + Vite + Tailwind CSS** (Frontend).

## ⚡ QUICK START (5 menit!)

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Setup environment
copy .env.example .env
# Edit .env dengan kredensial PostgreSQL Anda

# 3. Setup database (OTOMATIS!)
node setup-database.js

# 4. Jalankan aplikasi
npm start                    # Backend di http://localhost:3000
cd client && npm run dev     # Frontend di http://localhost:5173
```

**Login Credentials:**
- Admin: `admin@lms.com` / `admin123`
- Guru: `budi@lms.com` / `guru123`
- Siswa: `andi@lms.com` / `siswa123`

> ✅ **Password hash sudah VALID dan TESTED!** Langsung bisa login setelah setup.

---

## 📋 Features

### 👨‍💼 Admin/Guru
- ✅ Dashboard dengan statistik lengkap
- ✅ Manajemen Kelas (CRUD)
- ✅ Manajemen Mata Pelajaran (CRUD)
- ✅ Manajemen Materi Pelajaran (CRUD)
- ✅ Manajemen Kuis (CRUD)
- ✅ Assign mata pelajaran ke kelas
- ✅ Monitoring progress siswa

### 👨‍🎓 Siswa
- ✅ Dashboard belajar yang colorful & child-friendly
- ✅ Akses materi pelajaran berdasarkan kelas
- ✅ Progress tracking per materi
- ✅ Kuis interaktif dengan feedback instant
- ✅ Media pembelajaran (gambar, video)

## 🏗️ Tech Stack

### Backend
- **Node.js** v18+
- **Express** v4
- **PostgreSQL** v14+
- **JWT** untuk authentication
- **bcrypt** untuk password hashing
- **pg** untuk database connection

### Frontend
- **React** v18
- **Vite** v5
- **React Router** v6
- **Axios** untuk API calls
- **Tailwind CSS** v3

## 📁 Project Structure

```
appscript/
├── config/                  # Database, JWT config
├── shared/                  # Middleware, utils, constants
├── features/                # Feature-based modules
│   ├── auth/
│   ├── classes/
│   ├── subjects/
│   ├── lessons/
│   ├── quizzes/
│   ├── students/
│   └── admin/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── schema.sql               # Database schema
├── server.js                # Backend entry point
└── package.json             # Backend dependencies
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- PostgreSQL v14+
- npm atau yarn

### Method 1: Setup Otomatis (RECOMMENDED) ⚡

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..

# 2. Configure environment
copy .env.example .env
# Edit .env dengan kredensial PostgreSQL Anda:
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=lms_db

# 3. Setup database OTOMATIS (buat database + import schema)
node setup-database.js

# 4. Jalankan aplikasi
npm start                    # Backend → http://localhost:3000
cd client && npm run dev     # Frontend → http://localhost:5173
```

**✅ DONE!** Buka browser ke `http://localhost:5173` dan login.

---

### Method 2: Setup Manual

#### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

#### 2. Setup Database

```bash
# Buat database
psql -U postgres -c "CREATE DATABASE lms_db;"

# Import schema
psql -U postgres -d lms_db -f schema.sql

# Verifikasi
psql -U postgres -d lms_db -c "SELECT id, nama, email, role FROM users;"
```

> ⚠️ **PENTING**: File `schema.sql` sudah berisi **bcrypt hashes yang VALID**.
> Password akan langsung berfungsi setelah import!

#### 3. Configure Environment

**Backend (.env):**
```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_db

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

PORT=3000
NODE_ENV=development
```

**Frontend (client/.env):**
```env
VITE_API_URL=http://localhost:3000/api
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
npm start
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

**Terminal 2 - Frontend:**
```bash
# From appscript/client/ directory
npm run dev
# Client runs on http://localhost:5173
```

## 🔑 Demo Accounts

### Admin
- Email: `admin@lms.com`
- Password: `admin123`

### Guru
- Email: `budi@lms.com`
- Password: `guru123`

### Siswa
- Email: `andi@lms.com`
- Password: `siswa123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user (admin only)
- `GET /api/auth/me` - Get current user

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Subjects
- `GET /api/subjects` - Get all subjects
- `POST /api/subjects` - Create subject
- `POST /api/subjects/assign` - Assign subject to class

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get lesson by ID
- `POST /api/lessons` - Create lesson
- `PUT /api/lessons/:id` - Update lesson

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `POST /api/quizzes` - Create quiz

### Students
- `GET /api/students/dashboard` - Get student dashboard
- `POST /api/students/progress` - Save progress
- `POST /api/students/quiz-answer` - Submit quiz answer

### Admin
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/students` - Get all students

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Parameterized SQL queries (SQL Injection prevention)
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ CORS protection

## 🎨 UI/UX Features

### Student Interface
- 🎨 Colorful & cheerful design
- 📱 Responsive layout
- 🎯 Card-based navigation
- 📊 Visual progress tracking
- 🎮 Interactive quizzes with instant feedback

### Admin Interface
- 📊 Professional dashboard
- 📋 Table-based management
- ⚡ Quick actions
- 📈 Statistics overview

## 🛠️ Development

### Backend Development
```bash
npm run dev  # Nodemon auto-restart
```

### Frontend Development
```bash
cd client
npm run dev  # Vite hot reload
```

### Build for Production
```bash
# Build frontend
cd client
npm run build

# Build output in client/dist/
```

## 📝 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=lms_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (client/.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL service
sudo service postgresql status

# Restart PostgreSQL
sudo service postgresql restart
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or change PORT in .env
```

## 📚 Documentation

- [Schema Database](./schema.sql)
- [Prompt Dokumentasi](./perintah.md)

## 👥 Team

- **Backend Developer**: Feature-based architecture
- **Frontend Developer**: React + Tailwind CSS
- **Database Designer**: PostgreSQL schema

## 📄 License

MIT License

## 🙏 Acknowledgments

- Express.js for backend framework
- React for frontend library
- Tailwind CSS for styling
- PostgreSQL for database

---

**Built with ❤️ for Education**
