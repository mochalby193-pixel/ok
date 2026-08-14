# Prompt Perintah AI: Senior Full-Stack Developer LMS

> "Bertindaklah sebagai **Senior Full-Stack Developer** dan **UI/UX Expert khusus EdTech Anak**. Saya sedang membangun aplikasi **LMS (Learning Management System)**. Kontrol manajemen kelas, mata pelajaran (mapel), materi, dan kuis dikendalikan penuh oleh peran **Admin/Guru**, sedangkan **Siswa** mengakses konten secara visual berdasarkan kelas mereka.
> 
> Proyek ini menggunakan database **PostgreSQL** dengan struktur `schema.sql` berikut:
> 1. `users` (id, nama, email, password, role [admin, guru, siswa])
> 2. `classes` (id, nama_kelas, tingkat [1-6])
> 3. `students` (id, user_id, class_id)
> 4. `subjects` (id, nama_mapel, deskripsi)
> 5. `class_subjects` (id, class_id, subject_id, teacher_id)
> 6. `lessons` (id, class_subject_id, judul_bab, konten_teks, media_url, urutan)
> 7. `quizzes` (id, lesson_id, pertanyaan, pilihan_a/b/c/d, jawaban_benar)
> 8. `student_progress` (id, student_id, lesson_id, is_completed)
> 9. `quiz_scores` (id, student_id, quiz_id, jawaban_siswa, is_correct)
> 
> ---
> 
> ## ARSITEKTUR PROYEK: Feature-Based Structure
> 
> Gunakan struktur folder **berdasarkan fungsi/fitur**, bukan pemisahan backend-frontend tradisional. Setiap fitur memiliki komponen lengkap: routes, controller, service, dan validator.
> 
> ### Struktur Folder Lengkap:
> 
> ```
> appscript/
> ├── .env                          # Environment variables (DB, JWT)
> ├── perintah.md                   # Dokumentasi proyek
> ├── schema.sql                    # Database schema PostgreSQL
> ├── package.json                  # Dependencies backend (root)
> ├── server.js                     # Entry point utama aplikasi
> │
> ├── config/                       # Konfigurasi global
> │   ├── database.js               # PostgreSQL Pool connection
> │   ├── jwt.js                    # JWT secret & config
> │   └── env.js                    # Environment variables loader
> │
> ├── shared/                       # Utility & helpers bersama
> │   ├── middleware/
> │   │   ├── auth.js               # JWT authentication middleware
> │   │   └── validation.js         # Input validation middleware
> │   ├── utils/
> │   │   ├── response.js           # Standard API response format
> │   │   └── sqlSanitizer.js       # SQL injection prevention
> │   └── constants.js              # Constants (roles, status codes)
> │
> ├── features/                     # FITUR-FITUR APLIKASI BACKEND
> │   │
> │   ├── auth/                     # Fitur Authentication
> │   │   ├── auth.routes.js        # Route: POST /api/auth/login, /register
> │   │   ├── auth.controller.js    # Logic login & JWT generation
> │   │   ├── auth.service.js       # Query DB untuk user authentication
> │   │   └── auth.validator.js     # Validasi input login/register
> │   │
> │   ├── classes/                  # Fitur Manajemen Kelas
> │   │   ├── classes.routes.js     # Route: GET/POST/PUT/DELETE /api/classes
> │   │   ├── classes.controller.js # Logic CRUD kelas
> │   │   ├── classes.service.js    # Query DB untuk tabel classes
> │   │   └── classes.validator.js  # Validasi data kelas
> │   │
> │   ├── subjects/                 # Fitur Manajemen Mata Pelajaran
> │   │   ├── subjects.routes.js    # Route: GET/POST/PUT/DELETE /api/subjects
> │   │   ├── subjects.controller.js
> │   │   ├── subjects.service.js
> │   │   └── subjects.validator.js
> │   │
> │   ├── lessons/                  # Fitur Manajemen Materi Pelajaran
> │   │   ├── lessons.routes.js     # Route: GET/POST/PUT/DELETE /api/lessons
> │   │   ├── lessons.controller.js # Logic CRUD materi & bab
> │   │   ├── lessons.service.js    # Query DB untuk tabel lessons
> │   │   └── lessons.validator.js  # Validasi konten materi
> │   │
> │   ├── quizzes/                  # Fitur Manajemen Kuis
> │   │   ├── quizzes.routes.js     # Route: GET/POST/PUT/DELETE /api/quizzes
> │   │   ├── quizzes.controller.js # Logic CRUD soal kuis
> │   │   ├── quizzes.service.js    # Query DB untuk tabel quizzes
> │   │   └── quizzes.validator.js  # Validasi soal pilihan ganda
> │   │
> │   ├── students/                 # Fitur Dashboard & Progress Siswa
> │   │   ├── students.routes.js    # Route: GET /api/students/dashboard
> │   │   │                         #        POST /api/students/progress
> │   │   ├── students.controller.js # Logic ambil materi sesuai kelas
> │   │   ├── students.service.js   # Query lessons by class_id & progress
> │   │   └── students.validator.js # Validasi submit progress
> │   │
> │   └── admin/                    # Fitur Dashboard Admin/Guru
> │       ├── admin.routes.js       # Route: GET /api/admin/stats
> │       ├── admin.controller.js   # Logic statistik & report
> │       └── admin.service.js      # Query aggregasi data
> │
> └── client/                       # Frontend React + Vite
>     ├── package.json              # Dependencies React
>     ├── vite.config.js            # Vite configuration
>     ├── tailwind.config.js        # Tailwind CSS configuration
>     ├── postcss.config.js         # PostCSS configuration
>     ├── index.html                # HTML entry point
>     │
>     ├── public/                   # Static assets
>     │   └── images/               # Icons, illustrations, media
>     │
>     └── src/
>         ├── main.jsx              # React entry point
>         ├── App.jsx               # Root component dengan React Router
>         │
>         ├── components/           # Reusable components
>         │   ├── Navbar.jsx        # Navigation bar
>         │   ├── Card.jsx          # Card component untuk konten
>         │   ├── Button.jsx        # Button component
>         │   ├── Loader.jsx        # Loading spinner
>         │   ├── ProtectedRoute.jsx # Route guard berdasarkan role
>         │   └── QuizCard.jsx      # Card khusus untuk kuis
>         │
>         ├── pages/                # Halaman utama aplikasi
>         │   ├── Login.jsx         # Halaman login
>         │   ├── StudentDashboard.jsx   # Dashboard siswa (colorful UI)
>         │   ├── LessonDetail.jsx       # Detail materi & kuis interaktif
>         │   ├── AdminDashboard.jsx     # Dashboard admin (overview)
>         │   ├── ManageClasses.jsx      # CRUD Kelas
>         │   ├── ManageSubjects.jsx     # CRUD Mata Pelajaran
>         │   ├── ManageLessons.jsx      # CRUD Materi
>         │   └── ManageQuizzes.jsx      # CRUD Kuis
>         │
>         ├── services/             # API services dengan Axios
>         │   ├── api.js            # Axios instance dengan interceptor
>         │   ├── authService.js    # Login, register, logout
>         │   ├── classService.js   # API calls untuk classes
>         │   ├── subjectService.js # API calls untuk subjects
>         │   ├── lessonService.js  # API calls untuk lessons
>         │   ├── quizService.js    # API calls untuk quizzes
>         │   └── studentService.js # API calls untuk student progress
>         │
>         ├── context/              # React Context API
>         │   └── AuthContext.jsx   # Auth state (user, role, token)
>         │
>         ├── hooks/                # Custom React hooks
>         │   ├── useAuth.js        # Hook untuk akses auth context
>         │   └── useFetch.js       # Hook untuk data fetching dengan loading state
>         │
>         ├── utils/                # Helper functions
>         │   └── constants.js      # Constants (roles, API base URL)
>         │
>         └── styles/
>             └── index.css         # Global styles + Tailwind directives
> ```
> 
> ---
> 
> ## TUGAS IMPLEMENTASI LENGKAP
> 
> ### 1. SERVER & KONFIGURASI BACKEND
> 
> **server.js** - Entry point aplikasi:
> - Setup Express server dengan CORS untuk React development
> - Mount semua routes dari `features/*/routes.js` dengan prefix `/api`
> - Error handling global middleware
> - Serve static files (optional untuk production build)
> 
> **config/database.js**:
> - Setup `pg.Pool` dengan konfigurasi dari `.env`
> - Export fungsi `query(text, params)` untuk raw SQL queries dengan parameterized statements
> 
> **config/jwt.js**:
> - Export fungsi `generateToken(payload)` untuk create JWT
> - Export fungsi `verifyToken(token)` untuk validate JWT
> 
> **shared/middleware/auth.js**:
> - Middleware untuk validasi JWT token dari header `Authorization: Bearer <token>`
> - Extract user data (id, role, student_id, class_id) dari token
> - Attach ke `req.user`
> 
> **shared/utils/sqlSanitizer.js**:
> - Fungsi untuk sanitize input sebelum query
> - Mencegah SQL Injection pada raw queries
> 
> **shared/utils/response.js**:
> - Fungsi standar untuk API response format:
>   - `success(res, data, message, statusCode)`
>   - `error(res, message, statusCode)`
> 
> ---
> 
> ### 2. IMPLEMENTASI SETIAP FITUR BACKEND
> 
> Setiap folder di `features/` harus mengikuti pola ini:
> 
> **[fitur].routes.js**:
> - Definisi endpoint API menggunakan Express Router
> - Terapkan middleware auth untuk proteksi route
> - Validasi role access (admin/guru/siswa)
> 
> **[fitur].controller.js**:
> - Handle request & response
> - Validasi input menggunakan validator
> - Panggil service untuk business logic
> - Return response menggunakan `shared/utils/response.js`
> 
> **[fitur].service.js**:
> - Eksekusi raw SQL queries menggunakan parameterized statements
> - Business logic & data transformation
> - Return data atau throw error
> 
> **[fitur].validator.js**:
> - Validasi input data (required fields, data types, format)
> - Return array of errors jika validasi gagal
> 
> ---
> 
> ### 3. API ENDPOINTS YANG HARUS DIBUAT
> 
> #### Auth (`features/auth/`)
> - `POST /api/auth/login` - Login & generate JWT token
> - `POST /api/auth/register` - Register user baru (admin only)
> - `GET /api/auth/me` - Get current user info dari token
> 
> #### Classes (`features/classes/`)
> - `GET /api/classes` - List semua kelas
> - `POST /api/classes` - Buat kelas baru (admin/guru only)
> - `PUT /api/classes/:id` - Update kelas (admin/guru only)
> - `DELETE /api/classes/:id` - Hapus kelas (admin only)
> 
> #### Subjects (`features/subjects/`)
> - `GET /api/subjects` - List semua mata pelajaran
> - `POST /api/subjects` - Buat mapel baru (admin/guru only)
> - `PUT /api/subjects/:id` - Update mapel
> - `DELETE /api/subjects/:id` - Hapus mapel
> - `POST /api/subjects/assign` - Assign mapel ke kelas (class_subjects)
> 
> #### Lessons (`features/lessons/`)
> - `GET /api/lessons?class_subject_id=X` - List materi berdasarkan mapel
> - `GET /api/lessons/:id` - Detail satu materi
> - `POST /api/lessons` - Upload materi baru (admin/guru only)
> - `PUT /api/lessons/:id` - Update materi
> - `DELETE /api/lessons/:id` - Hapus materi
> 
> #### Quizzes (`features/quizzes/`)
> - `GET /api/quizzes?lesson_id=X` - List soal kuis per bab
> - `POST /api/quizzes` - Buat soal kuis (admin/guru only)
> - `PUT /api/quizzes/:id` - Update soal
> - `DELETE /api/quizzes/:id` - Hapus soal
> - `POST /api/quizzes/:id/submit` - Submit jawaban kuis (siswa)
> 
> #### Students (`features/students/`)
> - `GET /api/students/dashboard` - Ambil materi sesuai kelas siswa (JWT-based)
> - `GET /api/students/progress/:lesson_id` - Cek progress satu lesson
> - `POST /api/students/progress` - Simpan progres belajar (is_completed)
> - `GET /api/students/quiz-scores` - History nilai kuis siswa
> 
> #### Admin (`features/admin/`)
> - `GET /api/admin/stats` - Statistik dashboard (jumlah siswa, kelas, progress)
> - `GET /api/admin/students` - List semua siswa dengan class info
> 
> ---
> 
> ### 4. FRONTEND REACT + VITE + TAILWIND
> 
> #### Setup & Konfigurasi
> 
> **package.json** (client/package.json):
> - Dependencies: `react`, `react-dom`, `react-router-dom`, `axios`, `tailwindcss`, `postcss`, `autoprefixer`
> - Dev dependencies: `vite`, `@vitejs/plugin-react`
> 
> **vite.config.js**:
> - Configure Vite dengan React plugin
> - Setup proxy ke backend API (port 5000)
> 
> **tailwind.config.js**:
> - Configure Tailwind dengan path ke src files
> - Custom colors untuk child-friendly theme (bright colors)
> 
> **src/main.jsx**:
> - Render App component
> - Wrap dengan AuthProvider dan BrowserRouter
> 
> #### Implementasi Components
> 
> **src/App.jsx**:
> - Setup React Router dengan routes:
>   - `/login` - Login page
>   - `/student/dashboard` - Student dashboard (protected, role: siswa)
>   - `/student/lesson/:id` - Lesson detail (protected, role: siswa)
>   - `/admin/dashboard` - Admin dashboard (protected, role: admin/guru)
>   - `/admin/classes` - Manage classes (protected, role: admin/guru)
>   - `/admin/subjects` - Manage subjects (protected, role: admin/guru)
>   - `/admin/lessons` - Manage lessons (protected, role: admin/guru)
>   - `/admin/quizzes` - Manage quizzes (protected, role: admin/guru)
> 
> **src/components/ProtectedRoute.jsx**:
> - Check if user is authenticated
> - Check if user has required role
> - Redirect to login if not authenticated
> 
> **src/components/Navbar.jsx**:
> - Navigation bar dengan user info
> - Logout button
> - Different menu items based on role
> 
> **src/components/Card.jsx**:
> - Reusable card component dengan props:
>   - `title`, `description`, `image`, `onClick`, `progress`
> - Styling colorful untuk student view
> 
> **src/components/QuizCard.jsx**:
> - Component untuk render soal kuis pilihan ganda
> - Props: `question`, `options`, `onAnswer`, `isAnswered`, `isCorrect`
> 
> #### Implementasi Pages
> 
> **src/pages/Login.jsx**:
> - Form login dengan email & password
> - Submit ke `authService.login()`
> - Simpan token di localStorage via AuthContext
> - Redirect ke dashboard sesuai role
> - Design simple tapi menarik
> 
> **src/pages/StudentDashboard.jsx** (UI KHUSUS ANAK-ANAK):
> - **Design Requirements**:
>   - Warna cerah dan ceria (primary: blue, secondary: yellow/orange)
>   - Typography besar dan jelas
>   - Icons & illustrations untuk setiap mata pelajaran
>   - Card-based layout dengan hover effects
>   - Progress bar visual untuk setiap lesson
> - **Functionality**:
>   - Fetch lessons by student class dari `studentService.getDashboard()`
>   - Group lessons by subject
>   - Show completion status (completed/in-progress)
>   - Click card → navigate to `/student/lesson/:id`
> 
> **src/pages/LessonDetail.jsx**:
> - **Design Requirements**:
>   - Clean layout dengan fokus pada konten
>   - Support text content + media embed (image/video)
>   - Interactive quiz section dengan feedback visual
>   - Button "Tandai Selesai" yang prominent
> - **Functionality**:
>   - Fetch lesson detail by ID
>   - Render konten_teks dan media_url
>   - Fetch quizzes untuk lesson ini
>   - Submit quiz answer dengan instant feedback (benar/salah)
>   - Submit progress completion
>   - Navigate back to dashboard
> 
> **src/pages/AdminDashboard.jsx**:
> - Overview statistics (cards):
>   - Total siswa, Total kelas, Total materi, Rata-rata progress
> - Quick links ke halaman management
> - Recent activities list
> 
> **src/pages/ManageClasses.jsx**:
> - Table view semua kelas (nama_kelas, tingkat, jumlah siswa)
> - Button "Tambah Kelas" → open modal/form
> - Action buttons per row: Edit, Delete
> - Form fields: nama_kelas (text), tingkat (dropdown 1-6)
> 
> **src/pages/ManageSubjects.jsx**:
> - Table view semua mata pelajaran
> - CRUD operations dengan form modal
> - Form fields: nama_mapel, deskripsi
> - Assign subject to class functionality
> 
> **src/pages/ManageLessons.jsx**:
> - Table view dengan filter by subject
> - CRUD operations
> - Form fields: judul_bab, konten_teks (textarea), media_url, urutan, class_subject_id
> - Rich text editor untuk konten (optional: use simple textarea)
> 
> **src/pages/ManageQuizzes.jsx**:
> - Table view dengan filter by lesson
> - CRUD operations
> - Form fields: pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar (radio)
> - Preview quiz functionality
> 
> #### Services Layer
> 
> **src/services/api.js**:
> ```javascript
> import axios from 'axios';
> 
> const api = axios.create({
>   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
> });
> 
> // Request interceptor: inject token
> api.interceptors.request.use((config) => {
>   const token = localStorage.getItem('token');
>   if (token) {
>     config.headers.Authorization = `Bearer ${token}`;
>   }
>   return config;
> });
> 
> // Response interceptor: handle errors
> api.interceptors.response.use(
>   (response) => response,
>   (error) => {
>     if (error.response?.status === 401) {
>       localStorage.removeItem('token');
>       window.location.href = '/login';
>     }
>     return Promise.reject(error);
>   }
> );
> 
> export default api;
> ```
> 
> **src/services/authService.js**:
> - `login(email, password)` → POST /api/auth/login
> - `register(userData)` → POST /api/auth/register
> - `getCurrentUser()` → GET /api/auth/me
> - `logout()` → clear localStorage
> 
> **src/services/studentService.js**:
> - `getDashboard()` → GET /api/students/dashboard
> - `getLessonDetail(id)` → GET /api/lessons/:id
> - `submitProgress(lessonId)` → POST /api/students/progress
> - `submitQuizAnswer(quizId, answer)` → POST /api/quizzes/:id/submit
> 
> **src/services/classService.js, subjectService.js, lessonService.js, quizService.js**:
> - Standard CRUD operations (getAll, getById, create, update, delete)
> 
> #### Context & Hooks
> 
> **src/context/AuthContext.jsx**:
> ```javascript
> import { createContext, useState, useEffect } from 'react';
> import { authService } from '../services/authService';
> 
> export const AuthContext = createContext();
> 
> export const AuthProvider = ({ children }) => {
>   const [user, setUser] = useState(null);
>   const [loading, setLoading] = useState(true);
> 
>   useEffect(() => {
>     // Check if user is logged in on mount
>     const token = localStorage.getItem('token');
>     if (token) {
>       authService.getCurrentUser()
>         .then(userData => setUser(userData))
>         .catch(() => localStorage.removeItem('token'))
>         .finally(() => setLoading(false));
>     } else {
>       setLoading(false);
>     }
>   }, []);
> 
>   const login = async (email, password) => {
>     const { token, user } = await authService.login(email, password);
>     localStorage.setItem('token', token);
>     setUser(user);
>   };
> 
>   const logout = () => {
>     authService.logout();
>     setUser(null);
>   };
> 
>   return (
>     <AuthContext.Provider value={{ user, login, logout, loading }}>
>       {children}
>     </AuthContext.Provider>
>   );
> };
> ```
> 
> **src/hooks/useAuth.js**:
> ```javascript
> import { useContext } from 'react';
> import { AuthContext } from '../context/AuthContext';
> 
> export const useAuth = () => {
>   const context = useContext(AuthContext);
>   if (!context) {
>     throw new Error('useAuth must be used within AuthProvider');
>   }
>   return context;
> };
> ```
> 
> **src/hooks/useFetch.js**:
> - Custom hook untuk data fetching dengan loading & error state
> 
> ---
> 
> ## OUTPUT YANG DIHARAPKAN
> 
> Buatlah **SEMUA FILE** lengkap dengan implementasi kode siap pakai:
> 
> ### Backend Files:
> 
> 1. **Root Configuration**:
>    - `package.json` (dependencies: express, pg, jsonwebtoken, dotenv, bcrypt, cors)
>    - `.env.example` (DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT)
>    - `server.js` (entry point dengan CORS config)
> 
> 2. **Config folder** (`config/`):
>    - `database.js`, `jwt.js`, `env.js`
> 
> 3. **Shared folder** (`shared/`):
>    - `middleware/auth.js`, `middleware/validation.js`
>    - `utils/response.js`, `utils/sqlSanitizer.js`
>    - `constants.js` (ROLES object, dll)
> 
> 4. **Features folder** (`features/`) - **SEMUA fitur lengkap**:
>    - `auth/` (routes, controller, service, validator)
>    - `classes/` (routes, controller, service, validator)
>    - `subjects/` (routes, controller, service, validator)
>    - `lessons/` (routes, controller, service, validator)
>    - `quizzes/` (routes, controller, service, validator)
>    - `students/` (routes, controller, service, validator)
>    - `admin/` (routes, controller, service, validator)
> 
> ### Frontend Files (React):
> 
> 1. **Root Configuration** (`client/`):
>    - `package.json` (all React dependencies)
>    - `vite.config.js`
>    - `tailwind.config.js`
>    - `postcss.config.js`
>    - `index.html`
>    - `.env.example` (VITE_API_URL)
> 
> 2. **Source folder** (`client/src/`):
>    - `main.jsx` (entry point)
>    - `App.jsx` (routing setup)
>    - `styles/index.css` (Tailwind imports)
> 
> 3. **Components** (`client/src/components/`):
>    - `Navbar.jsx`, `Card.jsx`, `Button.jsx`, `Loader.jsx`
>    - `ProtectedRoute.jsx`, `QuizCard.jsx`
> 
> 4. **Pages** (`client/src/pages/`):
>    - `Login.jsx`
>    - `StudentDashboard.jsx` (child-friendly design)
>    - `LessonDetail.jsx`
>    - `AdminDashboard.jsx`
>    - `ManageClasses.jsx`, `ManageSubjects.jsx`, `ManageLessons.jsx`, `ManageQuizzes.jsx`
> 
> 5. **Services** (`client/src/services/`):
>    - `api.js` (Axios instance dengan interceptors)
>    - `authService.js`, `classService.js`, `subjectService.js`
>    - `lessonService.js`, `quizService.js`, `studentService.js`
> 
> 6. **Context & Hooks** (`client/src/context/`, `client/src/hooks/`):
>    - `AuthContext.jsx`
>    - `useAuth.js`, `useFetch.js`
> 
> 7. **Utils** (`client/src/utils/`):
>    - `constants.js` (ROLES, API_URL, dll)
> 
> ---
> 
> ## CRITICAL REQUIREMENTS
> 
> 1. **Security**:
>    - Gunakan **parameterized SQL queries** untuk semua database operations
>    - Hash password dengan `bcrypt` sebelum save ke database
>    - Validate & sanitize semua input
>    - JWT token dengan expiration time
> 
> 2. **Code Quality**:
>    - Clean code dengan naming convention yang jelas
>    - Consistent error handling
>    - Proper separation of concerns (routes → controller → service)
>    - Comments pada logic yang kompleks
> 
> 3. **UI/UX**:
>    - Student dashboard harus **sangat visual, colorful, dan child-friendly**
>    - Admin dashboard harus **profesional, table-based, dan efficient**
>    - Responsive design (mobile-friendly)
>    - Loading states untuk semua async operations
>    - Error messages yang user-friendly
> 
> 4. **Functionality**:
>    - Semua CRUD operations harus **fully functional**
>    - Role-based access control harus **strictly enforced**
>    - Quiz scoring harus **accurate**
>    - Progress tracking harus **persistent**
> 
> Berikan kode yang **production-ready**, **fully functional**, dan **siap deploy**!"
