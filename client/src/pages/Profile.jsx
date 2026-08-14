import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

const ROLE_LABEL = { admin: 'Administrator', guru: 'Guru', siswa: 'Siswa' };
const ROLE_COLOR = {
  admin: 'bg-purple-100 text-purple-700',
  guru: 'bg-blue-100 text-blue-700',
  siswa: 'bg-green-100 text-green-700',
};

export const Profile = () => {
  const { user, login } = useAuth();

  // ── Profile form state ─────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null); // { type: 'success'|'error', text }

  // ── Password form state ────────────────────────────────────────────────────
  const [pwData, setPwData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPw, setShowPw] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);

    const nama = profileData.nama.trim();
    const email = profileData.email.trim();

    if (!nama) {
      setProfileMsg({ type: 'error', text: 'Nama tidak boleh kosong.' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProfileMsg({ type: 'error', text: 'Format email tidak valid.' });
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await authService.updateProfile({ nama, email });
      // Sync localStorage so Navbar & context tetap fresh
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const merged = { ...stored, nama: updated.nama, email: updated.email };
      localStorage.setItem('user', JSON.stringify(merged));
      // Force context refresh — re-use existing token
      await authService.getCurrentUser().then((u) => {
        localStorage.setItem('user', JSON.stringify({ ...merged, ...u }));
      });
      setProfileMsg({ type: 'success', text: 'Profil berhasil diperbarui.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Gagal memperbarui profil.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (!pwData.oldPassword || !pwData.newPassword || !pwData.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Semua kolom password wajib diisi.' });
      return;
    }
    if (pwData.newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password baru minimal 6 karakter.' });
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    setPwLoading(true);
    try {
      await authService.changePassword({
        oldPassword: pwData.oldPassword,
        newPassword: pwData.newPassword,
      });
      setPwMsg({ type: 'success', text: 'Password berhasil diubah.' });
      setPwData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Gagal mengubah password.' });
    } finally {
      setPwLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const msgBox = (msg) =>
    msg ? (
      <div
        className={`p-3 rounded-lg text-sm ${
          msg.type === 'success'
            ? 'bg-green-50 border border-green-300 text-green-700'
            : 'bg-red-50 border border-red-300 text-red-700'
        }`}
      >
        {msg.type === 'success' ? '✅ ' : '⚠️ '}
        {msg.text}
      </div>
    ) : null;

  const PwToggle = ({ field }) => (
    <button
      type="button"
      onClick={() => setShowPw((p) => ({ ...p, [field]: !p[field] }))}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs select-none"
      tabIndex={-1}
    >
      {showPw[field] ? '🙈' : '👁️'}
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">👤 Profil Saya</h1>

      {/* ── Info Card ── */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.nama?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xl font-bold text-gray-800">{user?.nama}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span
              className={`mt-1 inline-block text-xs font-medium px-2 py-1 rounded-full ${
                ROLE_COLOR[user?.role] || 'bg-gray-100 text-gray-600'
              }`}
            >
              {ROLE_LABEL[user?.role] || user?.role}
            </span>
          </div>
        </div>
      </Card>

      {/* ── Edit Profil ── */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">✏️ Edit Profil</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={profileData.nama}
              onChange={(e) => setProfileData({ ...profileData, nama: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@contoh.com"
            />
          </div>
          {msgBox(profileMsg)}
          <Button type="submit" disabled={profileLoading}>
            {profileLoading ? '⏳ Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </form>
      </Card>

      {/* ── Ganti Password ── */}
      <Card>
        <h2 className="text-xl font-bold text-gray-800 mb-5">🔒 Ganti Password</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Password Lama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Lama</label>
            <div className="relative">
              <input
                type={showPw.old ? 'text' : 'password'}
                value={pwData.oldPassword}
                onChange={(e) => setPwData({ ...pwData, oldPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan password lama"
              />
              <PwToggle field="old" />
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <div className="relative">
              <input
                type={showPw.new ? 'text' : 'password'}
                value={pwData.newPassword}
                onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimal 6 karakter"
              />
              <PwToggle field="new" />
            </div>
            {pwData.newPassword && pwData.newPassword.length < 6 && (
              <p className="text-xs text-orange-500 mt-1">Minimal 6 karakter.</p>
            )}
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showPw.confirm ? 'text' : 'password'}
                value={pwData.confirmPassword}
                onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ulangi password baru"
              />
              <PwToggle field="confirm" />
            </div>
            {pwData.confirmPassword && pwData.newPassword !== pwData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Password tidak cocok.</p>
            )}
          </div>

          {msgBox(pwMsg)}
          <Button type="submit" disabled={pwLoading}>
            {pwLoading ? '⏳ Mengubah...' : 'Ubah Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
