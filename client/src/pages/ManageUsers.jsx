import { useState, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { classService } from '../services/classService';
import { userManagementService } from '../services/userManagementService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConfirmModal } from '../components/ConfirmModal';

const ROLES = ['admin', 'guru', 'siswa'];
const ROLE_BADGE = {
  admin: 'bg-red-100 text-red-700',
  guru: 'bg-blue-100 text-blue-700',
  siswa: 'bg-green-100 text-green-700',
};

const emptyForm = {
  nama: '',
  email: '',
  password: '',
  role: 'siswa',
  nis: '',
  nisn: '',
  class_id: '',
};

export const ManageUsers = () => {
  // ── Data ──────────────────────────────────────────────────────────
  const [roleFilter, setRoleFilter]   = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: users, loading, error, refetch } = useFetch(
    () => userManagementService.getAll({ role: roleFilter, search, class_id: classFilter }),
    [roleFilter, classFilter, search]
  );
  const { data: classes } = useFetch(() => classService.getAll(), []);

  // ── Form state ────────────────────────────────────────────────────
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  // ── Delete/Deactivate modal ───────────────────────────────────────
  const [confirmModal, setConfirmModal] = useState({ open: false, user: null, action: null });

  // ── Import state ──────────────────────────────────────────────────
  const [showImport, setShowImport]     = useState(false);
  const [importFile, setImportFile]     = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  // ── Helpers ───────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      nama: user.nama,
      email: user.email,
      password: '',
      role: user.role,
      nis: user.nis || '',
      nisn: user.nisn || '',
      class_id: user.class_id || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // don't overwrite if empty on edit
      if (formData.role !== 'siswa') { payload.nis = null; payload.nisn = null; payload.class_id = null; }

      if (editingId) {
        await userManagementService.update(editingId, payload);
      } else {
        await userManagementService.create(payload);
      }
      resetForm();
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openConfirm = (user, action) => {
    setConfirmModal({ open: true, user, action });
  };

  const handleConfirmAction = async () => {
    const { user, action } = confirmModal;
    setConfirmModal({ open: false, user: null, action: null });
    try {
      if (action === 'deactivate') {
        await userManagementService.delete(user.id);
      } else if (action === 'activate') {
        await userManagementService.update(user.id, { is_active: true });
      }
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleImport = async () => {
    if (!importFile) return alert('Pilih file terlebih dahulu');
    setImportLoading(true);
    setImportResult(null);
    try {
      const result = await userManagementService.uploadExcel(importFile);
      setImportResult(result);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // ── Render ────────────────────────────────────────────────────────
  if (loading) return <Loader />;
  if (error)   return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-800">👥 Manajemen Pengguna</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { setShowImport(!showImport); setImportResult(null); }}>
            {showImport ? 'Tutup Import' : '📥 Import Excel'}
          </Button>
          <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? 'Tutup Form' : '+ Tambah Pengguna'}
          </Button>
        </div>
      </div>

      {/* ── Import Panel ── */}
      {showImport && (
        <Card className="mb-8 border-2 border-dashed border-blue-300">
          <h2 className="text-xl font-bold mb-4 text-blue-700">📥 Import Pengguna via Excel</h2>

          <div className="flex flex-wrap gap-3 items-center mb-4">
            <Button
              variant="outline"
              onClick={userManagementService.downloadTemplate}
            >
              ⬇️ Unduh Template Excel
            </Button>
            <span className="text-sm text-gray-500">
              Unduh template, isi data, lalu upload di sini.
            </span>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files[0] || null)}
              className="input-field max-w-xs"
            />
            <Button onClick={handleImport} disabled={importLoading || !importFile}>
              {importLoading ? 'Memproses...' : '🚀 Upload & Import'}
            </Button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="mt-4 space-y-3">
              <div className="flex gap-4 text-sm font-medium">
                <span className="text-gray-600">Total: {importResult.total}</span>
                <span className="text-green-600">✅ Berhasil: {importResult.imported}</span>
                <span className="text-red-600">❌ Gagal: {importResult.failed}</span>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-3 max-h-40 overflow-y-auto">
                  <p className="text-red-700 font-medium text-sm mb-2">Detail kegagalan:</p>
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-red-600 text-xs">
                      • {e.email}: {e.reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── Form ── */}
      {showForm && (
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Lengkap *</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="label">
                  Password {editingId ? '(kosongkan jika tidak diubah)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  minLength={editingId ? 0 : 6}
                  required={!editingId}
                  placeholder={editingId ? 'Biarkan kosong untuk tidak mengubah' : 'Min. 6 karakter'}
                />
              </div>
              <div>
                <label className="label">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                  required
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Siswa-only fields */}
              {formData.role === 'siswa' && (
                <>
                  <div>
                    <label className="label">NISN (untuk login) *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value.replace(/\D/g, '') })}
                      className="input-field"
                      placeholder="10 digit NISN"
                    />
                    <p className="text-xs text-gray-400 mt-1">Siswa menggunakan NISN untuk login</p>
                  </div>
                  <div>
                    <label className="label">NIS (Nomor Induk Siswa Sekolah)</label>
                    <input
                      type="text"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="input-field"
                      placeholder="Opsional"
                    />
                  </div>
                  <div>
                    <label className="label">Kelas</label>
                    <select
                      value={formData.class_id}
                      onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {classes && classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nama_kelas} (Tingkat {c.tingkat})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Filter & Search ── */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="label text-xs">Filter Role</label>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); if (e.target.value !== 'siswa') setClassFilter(''); }}
              className="input-field text-sm py-1"
            >
              <option value="">Semua Role</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Filter Kelas — hanya tampil jika role = siswa atau semua */}
          {(roleFilter === '' || roleFilter === 'siswa') && (
            <div>
              <label className="label text-xs">Filter Kelas</label>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="input-field text-sm py-1"
              >
                <option value="">Semua Kelas</option>
                {classes && classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kelas} (Tingkat {c.tingkat})
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleSearch} className="flex gap-2 items-end">
            <div>
              <label className="label text-xs">Cari Nama / Email</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field text-sm py-1"
                placeholder="Ketik nama atau email..."
              />
            </div>
            <Button type="submit" variant="outline" className="py-1 text-sm">
              Cari
            </Button>
            {(search || roleFilter || classFilter) && (
              <Button
                type="button"
                variant="outline"
                className="py-1 text-sm"
                onClick={() => { setSearch(''); setSearchInput(''); setRoleFilter(''); setClassFilter(''); }}
              >
                Reset
              </Button>
            )}
          </form>
          <span className="text-sm text-gray-500 ml-auto">
            {users?.length || 0} pengguna ditemukan
          </span>
        </div>
      </Card>

      {/* ── User Table ── */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-3 px-3 font-semibold">Nama</th>
                <th className="py-3 px-3 font-semibold">Email</th>
                <th className="py-3 px-3 font-semibold">Role</th>
                <th className="py-3 px-3 font-semibold">Kelas / NIS / NISN</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!users || users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-800">{user.nama}</td>
                    <td className="py-3 px-3 text-gray-600">{user.email}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[user.role] || 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {user.nama_kelas ? (
                        <div className="space-y-0.5">
                          <div>{user.nama_kelas}</div>
                          {user.nisn && <div className="text-xs text-blue-600">NISN: {user.nisn}</div>}
                          {user.nis  && <div className="text-xs text-gray-400">NIS: {user.nis}</div>}
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1 items-center">
                        {/* Edit */}
                        <button
                          onClick={() => handleEdit(user)}
                          title="Edit pengguna"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 text-xs font-medium transition-colors"
                        >
                          ✏️ Edit
                        </button>

                        {/* Nonaktifkan */}
                        {user.is_active && (
                          <button
                            onClick={() => openConfirm(user, 'deactivate')}
                            title="Nonaktifkan akun"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-xs font-medium transition-colors"
                          >
                            🚫 Nonaktifkan
                          </button>
                        )}

                        {/* Aktifkan kembali */}
                        {!user.is_active && (
                          <button
                            onClick={() => openConfirm(user, 'activate')}
                            title="Aktifkan akun kembali"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 text-xs font-medium transition-colors"
                          >
                            ✅ Aktifkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.action === 'deactivate' ? 'Nonaktifkan Akun?' : 'Aktifkan Akun?'}
        message={
          confirmModal.action === 'deactivate'
            ? `Akun "${confirmModal.user?.nama}" akan dinonaktifkan. Pengguna tidak bisa login lagi.`
            : `Aktifkan kembali akun "${confirmModal.user?.nama}"? Pengguna bisa login lagi.`
        }
        confirmLabel={confirmModal.action === 'deactivate' ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}
        cancelLabel="Batal"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ open: false, user: null, action: null })}
      />
    </div>
  );
};
