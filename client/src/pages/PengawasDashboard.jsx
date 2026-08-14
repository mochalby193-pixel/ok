import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { pengawasService } from '../services/pengawasService';
import { Loader } from '../components/Loader';

export const PengawasDashboard = () => {
  const { user } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    pengawasService.getAllSchools()
      .then(setSchools)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">
            🏛️ Halo, {user?.nama?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-lg">Dashboard Pengawas — Pantau seluruh sekolah</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-6 text-center">
            <div className="text-5xl font-bold text-indigo-600 mb-1">{schools.length}</div>
            <div className="text-gray-500">Total Sekolah</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center">
            <div className="text-5xl font-bold text-green-600 mb-1">
              {schools.filter(s => s.is_active).length}
            </div>
            <div className="text-gray-500">Sekolah Aktif</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 text-center">
            <div className="text-5xl font-bold text-blue-500 mb-1">
              {schools.reduce((t, s) => t + parseInt(s.jumlah_siswa || 0), 0)}
            </div>
            <div className="text-gray-500">Total Siswa</div>
          </div>
        </div>

        {/* Aksi Cepat */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            to="/pengawas/schools/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
          >
            ＋ Tambah Sekolah
          </Link>
        </div>

        {/* Daftar Sekolah */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-700">📋 Daftar Sekolah</h2>
          </div>
          {schools.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏫</div>
              <p>Belum ada sekolah. Tambah sekolah pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">Sekolah</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">Kode</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-semibold text-xs uppercase">Guru</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-semibold text-xs uppercase">Siswa</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-semibold text-xs uppercase">Kelas</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-semibold text-xs uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-semibold text-xs uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schools.map((school) => (
                    <tr key={school.id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{school.nama}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{school.kode || '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{school.jumlah_guru}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{school.jumlah_siswa}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{school.jumlah_kelas}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${school.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {school.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <Link
                            to={`/pengawas/schools/${school.id}`}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors"
                          >
                            Detail
                          </Link>
                          <Link
                            to={`/pengawas/schools/${school.id}/scores`}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-medium transition-colors"
                          >
                            Nilai
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
