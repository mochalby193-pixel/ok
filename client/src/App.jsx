import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ROLES } from './utils/constants';
import { useAuth } from './hooks/useAuth';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { LessonDetail } from './pages/LessonDetail';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManageClasses } from './pages/ManageClasses';
import { ManageSubjects } from './pages/ManageSubjects';
import { ManageLessons } from './pages/ManageLessons';
import { ManageQuizzes } from './pages/ManageQuizzes';
import { ManageUsers } from './pages/ManageUsers';
import { Profile } from './pages/Profile';
import { ManageAssignments } from './pages/ManageAssignments';
import { GuruDashboard } from './pages/GuruDashboard';
import { RekapNilai } from './pages/RekapNilai';
import { NilaiKu } from './pages/NilaiKu';
import { ProgressSiswa } from './pages/ProgressSiswa';
import { PengawasDashboard } from './pages/PengawasDashboard';
import { PengawasSchoolDetail } from './pages/PengawasSchoolDetail';
import { PengawasSchoolScores } from './pages/PengawasSchoolScores';

import { SessionWarning } from './components/SessionWarning';

// ─── Layout wrapper: Navbar + halaman + Footer ────────────────────────────────
const AppLayout = ({ allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <div className="min-h-screen flex flex-col">
      <SessionWarning />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  </ProtectedRoute>
);

// Redirect ke dashboard sesuai role jika sudah login, tampilkan landing page jika belum
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <LandingPage />;
  if (user.role === ROLES.SISWA)    return <Navigate to="/student/dashboard" replace />;
  if (user.role === ROLES.GURU)     return <Navigate to="/guru/dashboard" replace />;
  if (user.role === ROLES.PENGAWAS) return <Navigate to="/pengawas/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    if (user.role === ROLES.SISWA)    return <Navigate to="/student/dashboard" replace />;
    if (user.role === ROLES.GURU)     return <Navigate to="/guru/dashboard" replace />;
    if (user.role === ROLES.PENGAWAS) return <Navigate to="/pengawas/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes (tanpa Footer) ── */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<RootRedirect />} />

          {/* ── Pengawas Routes ── */}
          <Route element={<AppLayout allowedRoles={[ROLES.PENGAWAS]} />}>
            <Route path="/pengawas/dashboard" element={<PengawasDashboard />} />
            <Route path="/pengawas/schools/:id" element={<PengawasSchoolDetail />} />
            <Route path="/pengawas/schools/:id/scores" element={<PengawasSchoolScores />} />
          </Route>

          {/* ── Student Routes ── */}
          <Route element={<AppLayout allowedRoles={[ROLES.SISWA]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/lesson/:id" element={<LessonDetail />} />
            <Route path="/student/nilaiku" element={<NilaiKu />} />
          </Route>

          {/* ── Guru Routes ── */}
          <Route element={<AppLayout allowedRoles={[ROLES.GURU]} />}>
            <Route path="/guru/dashboard" element={<GuruDashboard />} />
            <Route path="/guru/lessons" element={<ManageLessons />} />
            <Route path="/guru/quizzes" element={<ManageQuizzes />} />
            <Route path="/guru/progress-siswa" element={<ProgressSiswa />} />
          </Route>

          {/* ── Guru + Admin shared Routes ── */}
          <Route element={<AppLayout allowedRoles={[ROLES.GURU, ROLES.ADMIN]} />}>
            <Route path="/guru/rekap-nilai" element={<RekapNilai />} />
          </Route>

          {/* ── Admin Routes ── */}
          <Route element={<AppLayout allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/classes" element={<ManageClasses />} />
            <Route path="/admin/subjects" element={<ManageSubjects />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/assignments" element={<ManageAssignments />} />
          </Route>

          {/* ── Profile (semua role) ── */}
          <Route element={<AppLayout allowedRoles={[ROLES.PENGAWAS, ROLES.ADMIN, ROLES.GURU, ROLES.SISWA]} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* ── 401 Unauthorized ── */}
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
              <div className="text-6xl">🚫</div>
              <h1 className="text-2xl font-bold text-gray-800">Akses Ditolak</h1>
              <p className="text-gray-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
              <a href="/" className="btn btn-primary px-6 py-2">Kembali ke Beranda</a>
            </div>
          } />

          {/* ── 404 ── */}
          <Route path="*" element={<div className="text-center p-8">404 - Page Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
