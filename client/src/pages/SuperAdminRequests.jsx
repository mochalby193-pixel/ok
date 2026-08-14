import { useState, useEffect, useCallback } from 'react';
import { superadminService } from '../services/superadminService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';

const STATUS_BADGE = {
  pending:  'bg-orange-100 text-orange-600',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

export const SuperAdminRequests = () => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterStatus, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectNote, setRejectNote]   = useState('');
  const [processing, setProcessing]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await superadminService.getRequests();
      setRequests(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = requests.filter(r => filterStatus === 'all' ? true : r.status === filterStatus);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve request ini dan buat akun admin?')) return;
    setProcessing(id);
    try {
      await superadminService.approveRequest(id);
      load();
    } catch (e) { alert(e.message); }
    finally { setProcessing(null); }
  };

  const handleReject = async () => {
    setProcessing(rejectModal.id);
    try {
      await superadminService.rejectRequest(rejectModal.id, rejectNote);
      setRejectModal({ open: false, id: null });
      setRejectNote('');
      load();
    } catch (e) { alert(e.message); }
    finally { setProcessing(null); }
  };

  if (loading) return <Loader />;

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📋 Request Akun Admin</h1>
        <p className="text-gray-500 mt-1">Permintaan pembuatan akun dari pengawas</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { val: 'pending',  label: `Pending (${pendingCount})` },
          { val: 'approved', label: 'Disetujui' },
          { val: 'rejected', label: 'Ditolak' },
          { val: 'all',      label: 'Semua' },
        ].map(tab => (
          <button key={tab.val}
            onClick={() => setFilter(tab.val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterStatus === tab.val
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-slate-400'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400">Tidak ada request</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[r.status]}`}>
                      {r.status === 'pending' ? '⏳ Pending' : r.status === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                      {r.nama_sekolah}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-800">{r.nama}</p>
                  <p className="text-sm text-gray-500">{r.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Diajukan oleh: {r.nama_pengawas || '—'} ·{' '}
                    {new Date(r.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
                  </p>
                  {r.note && (
                    <p className="text-xs text-red-500 mt-1 bg-red-50 px-2 py-1 rounded">
                      Catatan: {r.note}
                    </p>
                  )}
                </div>

                {r.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleApprove(r.id)}
                      disabled={processing === r.id}
                      className="text-sm py-1.5 px-4"
                    >
                      {processing === r.id ? '...' : '✅ Approve'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setRejectModal({ open: true, id: r.id }); setRejectNote(''); }}
                      disabled={processing === r.id}
                      className="text-sm py-1.5 px-4 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      ❌ Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">❌ Tolak Request</h3>
            <p className="text-sm text-gray-500 mb-4">Berikan alasan penolakan (opsional):</p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              rows={3}
              placeholder="Contoh: Email sudah terdaftar, data tidak lengkap..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex gap-3">
              <Button onClick={handleReject} disabled={!!processing}
                className="bg-red-600 hover:bg-red-700">
                {processing ? 'Memproses...' : 'Tolak Request'}
              </Button>
              <Button variant="outline" onClick={() => setRejectModal({ open: false, id: null })}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
