import { useState, useEffect, useCallback } from 'react';
import { superadminService } from '../services/superadminService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';

const ROLE_BADGE = {
  pengawas: 'bg-purple-100 text-purple-700',
  admin:    'bg-red-100 text-red-700',
  guru:     'bg-blue-100 text-blue-700',
  siswa:    'bg-green-100 text-green-700',
};

export const SuperAdminUsers = () => {
  const [users, setUsers]       = useState([]);
  const [schools, setSchools]   = useState([]);
  const [loading, setLoading]   = useState(true);

  // Filter
  const [filterRole, setFilterRole]     = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');

  // Edit modal
  const [editUser, setEditUser]     = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState('');

  // Confirm modal
  const [confirm, setConfirm] = useState({ open: false, user: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [u, s] = await Promise.all([
        superadminService.getAllUsers({ role: filterRole, search, school_id: filterSchool }),
        superadminService.getSchools(),
      ]);
      setUsers(u);
      setSchools(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterRole, filterSchool, search]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ nama: u.nama, email: u.email, role: u.role, is_active: u.is_active, password: '' });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditError('');
    try {
      const payload = { ...editForm };
      if (!payload.password) delete payload.password;
      await superadminService.updateUser(editUser.id, payload);
      setEditUser(null);
      load();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await superadminService.deleteUser(confirm.user.id);
      setConfirm({ open: false, user: null });
      load();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👥 Manajemen Pengguna</h1>
        <p className="text-gray-500 mt-1">Semua user dari semua sekolah</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="">Semua Role</option>
            {['pengawas','admin','guru','siswa'].map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
            <option value="">Semua Sekolah</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
          </select>
          <form className="flex gap-2 sm:col-span-2" onSubmit={e => { e.preventDefault(); setSearch(searchInput); }}>
            <input type="text" placeholder="Cari nama / email..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <Button type="submit" variant="outline">Cari</Button>
            {(filterRole||filterSchool||search) && (
              <Button type="button" variant="outline" onClick={() => { setFilterRole(''); setFilterSchool(''); setSearch(''); setSearchInput(''); }}>
                Reset
              </Button>
            )}
          </form>
        </div>
        <p className="text-xs text-gray-400 mt-2">{users.length} pengguna ditemukan</p>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nama','Email','Role','Sekolah','Status','Aksi'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Tidak ada pengguna</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{u.nama}</div>
                    {u.is_superadmin && <span className="text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded">superadmin</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE[u.role]||'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.nama_sekolah || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {!u.is_superadmin && (
                        <>
                          <button onClick={() => openEdit(u)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors">
                            ✏️ Edit
                          </button>
                          {u.is_active && (
                            <button onClick={() => setConfirm({ open: true, user: u })}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
                              🚫 Nonaktifkan
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">✏️ Edit Pengguna — {editUser.nama}</h3>
            {editError && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{editError}</div>
            )}
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nama</label>
                <input type="text" value={editForm.nama} onChange={e => setEditForm({...editForm, nama: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password Baru (kosongkan jika tidak diubah)</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})}
                  placeholder="Min. 6 karakter"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.value === 'true'})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={editSaving}>{editSaving ? 'Menyimpan...' : 'Simpan'}</Button>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Batal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirm.open}
        title="Nonaktifkan Akun?"
        message={`Akun "${confirm.user?.nama}" akan dinonaktifkan.`}
        confirmLabel="Ya, Nonaktifkan"
        cancelLabel="Batal"
        onConfirm={handleDeactivate}
        onCancel={() => setConfirm({ open: false, user: null })}
      />
    </div>
  );
};
