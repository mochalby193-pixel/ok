import { useState, useEffect } from 'react';
import { superadminService } from '../services/superadminService';
import { pengawasService } from '../services/pengawasService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';

const STATUS_BADGE = {
  pending:  'bg-orange-100 text-orange-600',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export const PengawasRequests = () => {
  const [requests, setRequests] = useState([]);
  const [schools, setSchools]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ school_id: '', nama: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [reqs, schs] = await Promise.all([
        superadminService.getMyRequests(),
        pengawasService.getAllSchools(),
      ]);
      setRequests(reqs);
      setSchools(schs);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await superadminService.createRequest(form);
      setForm({ school_id: '', nama: '', email: '', password: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📨 Request Akun Admin</h1>
          <p className="text-gray-500 mt-1">Ajukan permintaan pembuatan akun admin sekolah</p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setFormError(''); }}>
          {showForm ? 'Tutup' : '＋ Ajukan Request'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-700 mb-4">📝 Form Permintaan Akun Admin</h2>
          {formError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sekolah *</label>
              <select required value={form.school_id} onChange={e => setForm({...form, school_id: e.target.value})}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">-- Pilih Sekolah --</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Admin *</label>
              <input type="text" required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})}
                placeholder="Nama lengkap"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="admin@sekolah.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Sementara *</label>
              <input type="password" required minLength={6} value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder="Min. 6 karakter"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <p className="text-xs text-gray-400 mt-1">Admin bisa ganti password setelah login pertama.</p>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Request'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400">Belum ada request yang diajukan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[r.status]}`}>
                      {r.status === 'pending' ? '⏳ Menunggu' : r.status === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                      {r.nama_sekolah}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">{r.nama}</p>
                  <p className="text-sm text-gray-500">{r.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(r.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                  </p>
                  {r.note && (
                    <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded">
                      Catatan penolakan: {r.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
