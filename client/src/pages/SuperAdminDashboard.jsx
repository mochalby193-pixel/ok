import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { superadminService } from '../services/superadminService';
import { Loader } from '../components/Loader';

export const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      superadminService.getRequests(),
      superadminService.getAllUsers(),
    ]).then(([reqs, users]) => {
      setRequests(reqs.filter(r => r.status === 'pending'));
      setUserCount(users.length);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">
            🛡️ Halo, {user?.nama?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-lg">Super Admin — Kelola seluruh pengguna sistem</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="text-5xl font-bold text-slate-700 mb-1">{userCount}</div>
            <div className="text-gray-500 text-sm">Total Pengguna</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 text-center">
            <div className="text-5xl font-bold text-orange-500 mb-1">{requests.length}</div>
            <div className="text-gray-500 text-sm">Request Pending</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 text-center">
            <div className="text-5xl font-bold text-blue-500 mb-1">1</div>
            <div className="text-gray-500 text-sm">Akun Super Admin</div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link to="/superadmin/users"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:border-slate-300 transition-colors">
            <span className="text-4xl">👥</span>
            <div>
              <p className="font-bold text-gray-800">Manajemen Pengguna</p>
              <p className="text-sm text-gray-500">Edit, ganti password, nonaktifkan user</p>
            </div>
          </Link>
          <Link to="/superadmin/requests"
            className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 hover:border-orange-300 transition-colors ${requests.length > 0 ? 'border-orange-200 bg-orange-50' : 'border-gray-100'}`}>
            <span className="text-4xl">📋</span>
            <div>
              <p className="font-bold text-gray-800">Request Akun Baru</p>
              <p className="text-sm text-gray-500">
                {requests.length > 0
                  ? <span className="text-orange-600 font-semibold">{requests.length} permintaan menunggu persetujuan</span>
                  : 'Tidak ada permintaan pending'}
              </p>
            </div>
          </Link>
        </div>

        {/* Preview request pending */}
        {requests.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-700">⏳ Request Terbaru</h2>
              <Link to="/superadmin/requests" className="text-sm text-orange-600 hover:underline">
                Lihat semua →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {requests.slice(0, 3).map(r => (
                <div key={r.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.nama}</p>
                    <p className="text-xs text-gray-500">{r.email} · {r.nama_sekolah}</p>
                  </div>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
