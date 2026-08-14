import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pengawasService } from '../services/pengawasService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';

export const PengawasSchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [school, setSchool] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState('');

  // Form sekolah
  const [editMode, setEditMode] = useState(isNew);
  const [form, setForm] = useState({ nama: '', kode: '', alamat: '' });
  const [saving, setSaving] = useState(false);

  // Form admin baru
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ nama: '', email: '', password: '' });
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      try {
        const [s, a, st] = await Promise.all([
          pengawasService.getSchoolById(id),
          pengawasService.getSchoolAdmins(id),
          pengawasService.getSchoolStats(id),
        ]);
        setSchool(s);
        setAdmins(a);
        setStats(st);
        setForm({ nama: s.nama, kode: s.kode || '', alamat: s.alamat || '' });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  const handleSaveSchool = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        const created = await pengawasService.createSchool(form);
        navigate(`/pengawas/schools/${created.id}`, { replace: true });
      } else {
        const updated = await pengawasService.updateSchool(id, form);
        setSchool(updated);
        setEditMode(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminSaving(true);
    try {
      const newAdmin = await pengawasService.createSchoolAdmin(id, adminForm);
      setAdmins([newAdmin, ...admins]);
      setAdminForm({ nama: '', email: '', password: '' });
      setShowAdminForm(false);
    } catch (e) {
      setAdminError(e.message);
    } finally {
      setAdminSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">

      <button
        onClick={() => navigate('/pengawas/dashboard')}
        className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
      >
        ← Kembali ke Dashboard
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Form / Info Sekolah */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? '🏫 Tambah Sekolah Baru' : `🏫 ${school?.nama}`}
          </h1>
          {!isNew && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm text-indigo-600 hover:underline"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSaveSchool} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah *</label>
              <input
                type="text" required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="SDN 1 Contoh"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode / NPSN</label>
              <input
                type="text"
                value={form.kode}
                onChange={(e) => setForm({ ...form, kode: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                rows={2} placeholder="Jl. Contoh No. 1, Kota"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : isNew ? 'Buat Sekolah' : 'Simpan Perubahan'}
              </Button>
              {!isNew && (
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Batal
                </Button>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-700">Kode:</span> {school?.kode || '—'}</p>
            <p><span className="font-medium text-gray-700">Alamat:</span> {school?.alamat || '—'}</p>
            <p>
              <span className="font-medium text-gray-700">Status:</span>{' '}
              <span className={`font-semibold ${school?.is_active ? 'text-green-600' : 'text-red-500'}`}>
                {school?.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Statistik */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Guru', value: stats.jumlah_guru, color: 'text-blue-600' },
            { label: 'Siswa', value: stats.jumlah_siswa, color: 'text-green-600' },
            { label: 'Kelas', value: stats.jumlah_kelas, color: 'text-purple-600' },
            { label: 'Mapel', value: stats.jumlah_mapel, color: 'text-orange-500' },
            { label: 'Materi', value: stats.jumlah_materi, color: 'text-indigo-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Sekolah */}
      {!isNew && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">👤 Admin Sekolah</h2>
            <button
              onClick={() => setShowAdminForm(!showAdminForm)}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              {showAdminForm ? '× Tutup' : '＋ Tambah Admin'}
            </button>
          </div>

          {showAdminForm && (
            <form onSubmit={handleAddAdmin} className="mb-6 p-4 bg-indigo-50 rounded-xl space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Admin Baru</h3>
              {adminError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  {adminError}
                </div>
              )}
              <input
                type="text" required placeholder="Nama lengkap"
                value={adminForm.nama}
                onChange={(e) => setAdminForm({ ...adminForm, nama: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="email" required placeholder="Email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="password" required placeholder="Password (min. 6 karakter)" minLength={6}
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <Button type="submit" disabled={adminSaving}>
                {adminSaving ? 'Menyimpan...' : 'Buat Akun Admin'}
              </Button>
            </form>
          )}

          {admins.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">Belum ada admin untuk sekolah ini.</p>
          ) : (
            <div className="space-y-2">
              {admins.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{a.nama}</p>
                    <p className="text-xs text-gray-500">{a.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {a.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tombol lihat nilai */}
      {!isNew && (
        <Button onClick={() => navigate(`/pengawas/schools/${id}/scores`)}>
          📊 Lihat Nilai Siswa
        </Button>
      )}
    </div>
  );
};
