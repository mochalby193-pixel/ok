import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

export const Login = () => {
  // 'siswa' = login pakai NISN, 'staff' = login pakai email
  const [mode, setMode]               = useState('siswa');
  const [nisn, setNisn]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [logoutMsg, setLogoutMsg]     = useState('');

  const { login }  = useAuth();
  const navigate   = useNavigate();

  // Tampilkan pesan jika ada alasan logout otomatis
  useEffect(() => {
    const reason = sessionStorage.getItem('logout_reason');
    if (reason) {
      setLogoutMsg(reason);
      sessionStorage.removeItem('logout_reason');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credentials =
        mode === 'siswa'
          ? { nisn: nisn.trim(), password }
          : { email: email.trim(), password };

      // login() akan set user di context → PublicRoute otomatis redirect sesuai role
      await login(credentials);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setNisn('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-stretch bg-gray-50">

      {/* ── Kiri: Panel Branding (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-dark px-12 py-16 text-white relative overflow-hidden">

        {/* Dekorasi lingkaran background */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white bg-opacity-5 rounded-full" />
        <div className="absolute -bottom-32 -right-16 w-96 h-96 bg-white bg-opacity-5 rounded-full" />
        <div className="absolute top-1/2 -right-12 w-48 h-48 bg-white bg-opacity-5 rounded-full" />

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo utama */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <img
              src="/logo-jember.png"
              alt="Logo Jember"
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
            <div className="w-px h-16 bg-white bg-opacity-30" />
            <img
              src="/logo-suco.png"
              alt="Logo Aplikasi"
              className="w-20 h-20 object-contain drop-shadow-lg"
            />
          </div>

          <h1 className="text-4xl font-extrabold mb-3 leading-tight">
            Learning<br />Management<br />System
          </h1>
          <p className="text-blue-100 text-base leading-relaxed">
            Platform pembelajaran digital untuk siswa dan guru. Akses materi, kuis, dan pantau progres belajarmu.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-3 text-left">
            {[
              { icon: '📚', text: 'Materi PDF & Video interaktif' },
              { icon: '📝', text: 'Kuis latihan dengan penilaian otomatis' },
              { icon: '📊', text: 'Pantau progres & nilai secara real-time' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-white bg-opacity-10 rounded-xl px-4 py-3">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm font-medium text-blue-50">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Kanan: Form Login ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16">

        {/* Logo mobile (hanya tampil di < lg) */}
        <div className="flex lg:hidden items-center justify-center gap-4 mb-8">
          <img src="/logo-jember.png" alt="Logo Jember" className="w-12 h-12 object-contain" />
          <img src="/logo-suco.png" alt="Logo Aplikasi" className="w-12 h-12 object-contain" />
        </div>

        <div className="w-full max-w-md">
          {/* Tombol Kembali */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors duration-200 mb-6 group"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Beranda
          </button>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-800">Selamat Datang 👋</h2>
            <p className="text-gray-500 mt-1">Masuk ke akun kamu untuk melanjutkan</p>
          </div>

          {/* Toggle Mode */}
          <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-100">
            <button
              type="button"
              onClick={() => switchMode('siswa')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'siswa'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🎒 Siswa (NISN)
            </button>
            <button
              type="button"
              onClick={() => switchMode('staff')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'staff'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👩‍🏫 Guru / Admin
            </button>
          </div>

          {/* Pesan auto logout */}
          {logoutMsg && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-5 text-sm">
              <span>ℹ️</span>
              <span>{logoutMsg}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {mode === 'siswa' ? (
              /* NISN field */
              <div>
                <label className="label">NISN</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))}
                  className="input-field"
                  placeholder="10 digit NISN"
                  required
                  autoComplete="username"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">Masukkan 10 digit Nomor Induk Siswa Nasional</p>
              </div>
            ) : (
              /* Email field */
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="email@contoh.com"
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm select-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full py-3 text-base mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Memproses...
                </span>
              ) : 'Masuk'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} LMS · Dinas Pendidikan
          </p>
        </div>
      </div>

    </div>
  );
};
