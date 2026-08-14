const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const config = require('./config/env');
const { error } = require('./shared/utils/response');
const { STATUS_CODES } = require('./shared/constants');

// Import routes
const authRoutes = require('./features/auth/auth.routes');
const classesRoutes = require('./features/classes/classes.routes');
const subjectsRoutes = require('./features/subjects/subjects.routes');
const lessonsRoutes = require('./features/lessons/lessons.routes');
const quizzesRoutes = require('./features/quizzes/quizzes.routes');
const studentsRoutes = require('./features/students/students.routes');
const adminRoutes = require('./features/admin/admin.routes');
const adminUsersRoutes = require('./features/admin/users.routes');
const pengawasRoutes = require('./features/pengawas/pengawas.routes');

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploaded PDFs, etc.)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', (req, res, next) => {
  // Allow PDF to be rendered inline (embedded) from the same origin
  if (req.path.toLowerCase().endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
  next();
}, express.static(uploadsDir));

// Serve React client build (production)
const clientDist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'LMS API Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/pengawas', pengawasRoutes);

// 404 Handler — hanya untuk route /api yang tidak ditemukan
app.use('/api', (req, res) => {
  return error(res, 'Route not found', STATUS_CODES.NOT_FOUND);
});

// SPA fallback — semua route non-API diarahkan ke React index.html
app.get('*', (req, res) => {
  const indexFile = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Client build not found. Run: npm run build');
  }
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  return error(
    res,
    err.message || 'Internal server error',
    err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR
  );
});

// ============================================================
// START SERVER
// ============================================================

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║                                                  ║');
  console.log('║         🎓 LMS API SERVER STARTED 🎓            ║');
  console.log('║                                                  ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📚 Environment: ${config.server.env}`);
  console.log(`🌍 CORS enabled for: ${config.cors.origin}`);
  console.log('');
  console.log('📡 API Endpoints:');
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - POST   /api/auth/register`);
  console.log(`   - GET    /api/auth/me`);
  console.log(`   - GET    /api/classes`);
  console.log(`   - GET    /api/subjects`);
  console.log(`   - GET    /api/lessons`);
  console.log(`   - GET    /api/quizzes`);
  console.log(`   - GET    /api/students/dashboard`);
  console.log(`   - GET    /api/admin/stats`);
  console.log('');
  console.log('✅ Ready to accept requests!');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
