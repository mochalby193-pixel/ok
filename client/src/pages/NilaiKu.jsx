import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { Loader } from '../components/Loader';

const getSkorStyle = (skor) => {
  if (skor === null || skor === undefined) return { badge: 'bg-gray-100 text-gray-500 border-gray-200', bar: 'bg-gray-300' };
  if (skor >= 80) return { badge: 'bg-green-50 text-green-700 border-green-200', bar: 'bg-green-500' };
  if (skor >= 60) return { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', bar: 'bg-yellow-400' };
  return { badge: 'bg-red-50 text-red-600 border-red-200', bar: 'bg-red-400' };
};

const getSkorLabel = (skor) => {
  if (skor >= 90) return 'Sangat Baik';
  if (skor >= 80) return 'Baik';
  if (skor >= 70) return 'Cukup';
  if (skor >= 60) return 'Perlu Usaha';
  return 'Kurang';
};

export const NilaiKu = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');
  const [filterMapel, setFilterMapel] = useState('');

  useEffect(() => {
    studentService.getNilaiKu()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error)   return <div className="text-center text-red-500 p-8">{error}</div>;

  // Daftar mapel unik untuk filter
  const mapelList = [...new Set(data.map((d) => d.nama_mapel))].sort();

  // Filter data
  const filtered = data.filter((row) => {
    const matchSearch =
      row.judul_bab.toLowerCase().includes(search.toLowerCase()) ||
      row.nama_mapel.toLowerCase().includes(search.toLowerCase()) ||
      (row.nama_guru || '').toLowerCase().includes(search.toLowerCase());
    const matchMapel = filterMapel ? row.nama_mapel === filterMapel : true;
    return matchSearch && matchMapel;
  });

  // Statistik ringkas
  const avgSkor = filtered.length
    ? Math.round(filtered.reduce((s, r) => s + Number(r.skor), 0) / filtered.length)
    : null;
  const tertinggi = filtered.length
    ? Math.max(...filtered.map((r) => Number(r.skor)))
    : null;
  const terendah = filtered.length
    ? Math.min(...filtered.map((r) => Number(r.skor)))
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Nilai Ku</h1>
          <p className="text-gray-600 text-lg">Rekap nilai kuis dari semua materi yang sudah kamu kerjakan</p>
        </div>

        {/* Stat cards */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{filtered.length}</p>
              <p className="text-xs text-gray-500 mt-1">Materi Selesai</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className={`text-3xl font-bold ${avgSkor >= 80 ? 'text-green-600' : avgSkor >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                {avgSkor}
              </p>
              <p className="text-xs text-gray-500 mt-1">Rata-rata Skor</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{tertinggi}</p>
              <p className="text-xs text-gray-500 mt-1">Skor Tertinggi</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-3xl font-bold text-red-500">{terendah}</p>
              <p className="text-xs text-gray-500 mt-1">Skor Terendah</p>
            </div>
          </div>
        )}

        {/* Filter & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="🔍 Cari materi, mapel, atau guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="">Semua Mata Pelajaran</option>
            {mapelList.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Empty state */}
        {data.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl font-semibold text-gray-700 mb-2">Belum ada nilai</p>
            <p className="text-gray-500 mb-6">Kerjakan kuis pada materi pelajaran untuk melihat nilaimu di sini.</p>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
            >
              Mulai Belajar →
            </button>
          </div>
        )}

        {data.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Tidak ada hasil yang cocok dengan filter.</p>
          </div>
        )}

        {/* Tabel */}
        {filtered.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <th className="px-4 py-3 text-center font-semibold w-10">No.</th>
                    <th className="px-4 py-3 text-left font-semibold">Kelas</th>
                    <th className="px-4 py-3 text-left font-semibold">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-left font-semibold">Materi</th>
                    <th className="px-4 py-3 text-center font-semibold">Skor</th>
                    <th className="px-4 py-3 text-left font-semibold">Nama Guru</th>
                    <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, idx) => {
                    const skor = Number(row.skor);
                    const style = getSkorStyle(skor);
                    return (
                      <tr
                        key={row.lesson_id}
                        className={`border-b border-gray-50 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        } hover:bg-blue-50/40`}
                      >
                        {/* No */}
                        <td className="px-4 py-3 text-center text-gray-400 font-medium">
                          {idx + 1}
                        </td>

                        {/* Kelas */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                            🏫 {row.nama_kelas}
                          </span>
                        </td>

                        {/* Mapel */}
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {row.nama_mapel}
                        </td>

                        {/* Materi */}
                        <td className="px-4 py-3 text-gray-700">
                          <span className="font-semibold">{row.judul_bab}</span>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {row.soal_dijawab}/{row.total_soal} soal dijawab
                          </p>
                        </td>

                        {/* Skor */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-lg border ${style.badge}`}
                            >
                              {skor}
                              <span className="text-xs font-normal opacity-70">/100</span>
                            </span>
                            {/* Progress bar */}
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${style.bar}`}
                                style={{ width: `${skor}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400">{getSkorLabel(skor)}</span>
                          </div>
                        </td>

                        {/* Guru */}
                        <td className="px-4 py-3 text-gray-600">
                          {row.nama_guru ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {row.nama_guru.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm">{row.nama_guru}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => navigate(`/student/lesson/${row.lesson_id}`)}
                            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            🔄 Ulangi
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer tabel */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-right">
              Menampilkan {filtered.length} dari {data.length} materi
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
