# 📡 API DOCUMENTATION - LMS Application

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 📋 ENDPOINTS

### 1. Authentication (`/api/auth`)

#### POST `/api/auth/login`
Login user and get JWT token.

**Request:**
```json
{
  "email": "admin@lms.com",
  "password": "admin123"
}
```

**Response:**
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

#### POST `/api/auth/register` 🔒 Admin Only
Register new user.

**Request:**
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "siswa",
  "class_id": 1,
  "nis": "2024123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 10,
    "nama": "John Doe",
    "email": "john@example.com",
    "role": "siswa"
  }
}
```

#### GET `/api/auth/me` 🔒 Protected
Get current user info.

**Response:**
```json
{
  "success": true,
  "message": "User info retrieved",
  "data": {
    "id": 1,
    "nama": "Admin Utama",
    "email": "admin@lms.com",
    "role": "admin",
    "student_id": null,
    "class_id": null,
    "is_active": true
  }
}
```

---

### 2. Classes (`/api/classes`)

#### GET `/api/classes` 🔒 Protected
Get all classes with student count.

**Response:**
```json
{
  "success": true,
  "message": "Classes retrieved successfully",
  "data": [
    {
      "id": 1,
      "nama_kelas": "Kelas 1A",
      "tingkat": 1,
      "deskripsi": "Kelas Satu A",
      "is_active": true,
      "jumlah_siswa": 25
    }
  ]
}
```

#### POST `/api/classes` 🔒 Admin/Guru Only
Create new class.

**Request:**
```json
{
  "nama_kelas": "Kelas 2B",
  "tingkat": 2,
  "deskripsi": "Kelas Dua B"
}
```

#### PUT `/api/classes/:id` 🔒 Admin/Guru Only
Update class.

#### DELETE `/api/classes/:id` 🔒 Admin Only
Delete class (soft delete).

---

### 3. Subjects (`/api/subjects`)

#### GET `/api/subjects` 🔒 Protected
Get all subjects.

**Response:**
```json
{
  "success": true,
  "message": "Subjects retrieved successfully",
  "data": [
    {
      "id": 1,
      "nama_mapel": "Matematika",
      "deskripsi": "Mata pelajaran Matematika",
      "icon_url": "https://example.com/math-icon.png",
      "is_active": true
    }
  ]
}
```

#### POST `/api/subjects` 🔒 Admin/Guru Only
Create new subject.

**Request:**
```json
{
  "nama_mapel": "IPA",
  "deskripsi": "Ilmu Pengetahuan Alam",
  "icon_url": "https://example.com/science-icon.png"
}
```

#### POST `/api/subjects/assign` 🔒 Admin/Guru Only
Assign subject to class.

**Request:**
```json
{
  "class_id": 1,
  "subject_id": 1,
  "teacher_id": 2
}
```

---

### 4. Lessons (`/api/lessons`)

#### GET `/api/lessons?class_subject_id=X` 🔒 Protected
Get lessons, optionally filtered by class_subject_id.

**Response:**
```json
{
  "success": true,
  "message": "Lessons retrieved successfully",
  "data": [
    {
      "id": 1,
      "class_subject_id": 1,
      "judul_bab": "Penjumlahan Dasar",
      "konten_teks": "Materi tentang penjumlahan...",
      "media_url": "https://example.com/video1.mp4",
      "urutan": 1,
      "is_published": true,
      "nama_mapel": "Matematika",
      "nama_kelas": "Kelas 1A"
    }
  ]
}
```

#### GET `/api/lessons/:id` 🔒 Protected
Get lesson by ID.

#### POST `/api/lessons` 🔒 Admin/Guru Only
Create new lesson.

**Request:**
```json
{
  "class_subject_id": 1,
  "judul_bab": "Pengurangan Dasar",
  "konten_teks": "Materi tentang pengurangan bilangan...",
  "media_url": "https://example.com/video2.mp4",
  "urutan": 2,
  "is_published": true
}
```

---

### 5. Quizzes (`/api/quizzes`)

#### GET `/api/quizzes?lesson_id=X` 🔒 Protected
Get quizzes, optionally filtered by lesson_id.

**Response:**
```json
{
  "success": true,
  "message": "Quizzes retrieved successfully",
  "data": [
    {
      "id": 1,
      "lesson_id": 1,
      "pertanyaan": "Berapa 2 + 2?",
      "pilihan_a": "3",
      "pilihan_b": "4",
      "pilihan_c": "5",
      "pilihan_d": "6",
      "jawaban_benar": "b",
      "poin": 10,
      "urutan": 1
    }
  ]
}
```

#### POST `/api/quizzes` 🔒 Admin/Guru Only
Create new quiz.

**Request:**
```json
{
  "lesson_id": 1,
  "pertanyaan": "Berapa 3 + 3?",
  "pilihan_a": "5",
  "pilihan_b": "6",
  "pilihan_c": "7",
  "pilihan_d": "8",
  "jawaban_benar": "b",
  "poin": 10,
  "urutan": 2
}
```

---

### 6. Students (`/api/students`)

#### GET `/api/students/dashboard` 🔒 Siswa Only
Get student dashboard (lessons grouped by subject).

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": [
    {
      "subject_name": "Matematika",
      "subject_icon": "https://example.com/math-icon.png",
      "lessons": [
        {
          "lesson_id": 1,
          "judul_bab": "Penjumlahan Dasar",
          "urutan": 1,
          "quiz_count": 5,
          "is_completed": false,
          "completed_at": null
        }
      ]
    }
  ]
}
```

#### POST `/api/students/progress` 🔒 Siswa Only
Save lesson progress.

**Request:**
```json
{
  "lesson_id": 1,
  "is_completed": true
}
```

#### POST `/api/students/quiz-answer` 🔒 Siswa Only
Submit quiz answer.

**Request:**
```json
{
  "quiz_id": 1,
  "jawaban_siswa": "b"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz answer submitted",
  "data": {
    "id": 1,
    "student_id": 1,
    "quiz_id": 1,
    "jawaban_siswa": "b",
    "is_correct": true,
    "poin_didapat": 10,
    "correct_answer": "b"
  }
}
```

#### GET `/api/students/quiz-scores` 🔒 Siswa Only
Get all quiz scores for student.

---

### 7. Admin (`/api/admin`)

#### GET `/api/admin/stats` 🔒 Admin/Guru Only
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total_students": 50,
    "total_classes": 6,
    "total_lessons": 120,
    "average_progress": 67.5
  }
}
```

#### GET `/api/admin/students` 🔒 Admin/Guru Only
Get all students with progress.

**Response:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "student_id": 1,
      "nis": "2024001",
      "user_id": 4,
      "nama": "Andi Wijaya",
      "email": "andi@lms.com",
      "class_id": 1,
      "nama_kelas": "Kelas 1A",
      "tingkat": 1,
      "total_lessons": 10,
      "completed_lessons": 7
    }
  ]
}
```

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error 1", "Validation error 2"]
}
```

---

## 🔑 HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.com","password":"admin123"}'
```

### Get Classes (with token)
```bash
TOKEN="your_jwt_token_here"

curl -X GET http://localhost:5000/api/classes \
  -H "Authorization: Bearer $TOKEN"
```

### Create Class
```bash
curl -X POST http://localhost:5000/api/classes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nama_kelas":"Kelas 3A","tingkat":3,"deskripsi":"Kelas Tiga A"}'
```

---

## 🔗 Postman Collection

Import this JSON into Postman for easy testing:

[Download Postman Collection](./LMS_API.postman_collection.json) *(file belum dibuat)*

---

**Happy Testing! 🚀**
