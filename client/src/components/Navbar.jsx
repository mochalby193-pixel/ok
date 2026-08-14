import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const ROLE_LABEL = { pengawas: 'Pengawas', admin: 'Admin', guru: 'Guru', siswa: 'Siswa' };

const getMenuItems = (role) => {
  if (role === ROLES.PENGAWAS) return [
    { to: '/pengawas/dashboard', label: 'Dashboard' },
  ];
  if (role === ROLES.ADMIN) return [
    { to: '/admin/dashboard',   label: 'Dashboard' },
    { to: '/admin/classes',     label: 'Kelas' },
    { to: '/admin/subjects',    label: 'Mata Pelajaran' },
    { to: '/admin/assignments', label: 'Penugasan' },
    { to: '/admin/users',       label: 'Pengguna' },
  ];
  if (role === ROLES.GURU) return [
    { to: '/guru/dashboard',        label: 'Dashboard' },
    { to: '/guru/lessons',          label: 'Materi' },
    { to: '/guru/quizzes',          label: 'Kuis' },
    { to: '/guru/progress-siswa',   label: 'Progress Siswa' },
    { to: '/guru/rekap-nilai',      label: 'Rekap Nilai' },
  ];
  if (role === ROLES.SISWA) return [
    { to: '/student/dashboard', label: 'Dashboard' },
    { to: '/student/nilaiku',   label: '🏆 Nilaiku' },
  ];
  return [];
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const mobileRef   = useRef(null);

  // Tutup dropdown & mobile menu saat klik di luar
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Tutup mobile menu saat pindah halaman
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  const linkClass = (to) =>
    `block text-sm font-medium transition-colors ${
      location.pathname === to
        ? 'text-primary font-semibold'
        : 'text-gray-700 hover:text-primary'
    }`;

  return (
    <nav className="bg-white shadow-md relative z-40" ref={mobileRef}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-suco.png" alt="LMS Logo" className="h-10 w-auto" />
            <div className="leading-tight">
              <span className="block text-sm font-bold text-primary leading-none">LMS SDN SUCO 04</span>
              <span className="block text-xs text-gray-500 leading-none mt-0.5">Learning Management System</span>
            </div>
          </Link>

          {/* ── Desktop menu ── */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              {menuItems.map((item) => (
                <Link key={item.to} to={item.to} className={linkClass(item.to)}>
                  {item.label}
                </Link>
              ))}

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 focus:outline-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.nama?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-gray-800 leading-none">{user.nama}</p>
                    <p className="text-xs text-gray-400">{ROLE_LABEL[user.role]}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.nama}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      👤 Profil Saya
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Hamburger button (mobile only) ── */}
          {user && (
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-gray-100 transition focus:outline-none"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span
                className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
                  mobileOpen ? 'rotate-45 translate-y-1.5' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-700 my-1 transition-all duration-300 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-0.5 bg-gray-700 transition-all duration-300 ${
                  mobileOpen ? '-rotate-45 -translate-y-1.5' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {/* Nav links */}
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${linkClass(item.to)} py-2 px-3 rounded-lg hover:bg-gray-50 block`}
              >
                {item.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100 my-2" />

            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {user.nama?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{user.nama}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>

            <Link
              to="/profile"
              className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              👤 Profil Saya
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
