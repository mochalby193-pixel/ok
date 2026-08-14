import { useState, useEffect, useMemo } from 'react';
import { lessonService } from '../services/lessonService';
import { studentService } from '../services/studentService';
import { Loader } from '../components/Loader';

export const ProgressSiswa = () => {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Filter state
  const [filterClass, setFilterClass]     = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStatus, setFilterStatus]   = useState(''); // '' | 'selesai' | 'belum'

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterClass)   params.append('class_id', filterClass);
        if (filterSubject) params.append('subject_id', filterSubject);
        const data = await studentService.getProgressList(params.toString());
        setRows(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filterClass, filterSubject]);

  // Derive unique kelas & mapel for filter dropdowns
  const classes  = useMemo(() => [...new Map(rows.map((r) => [r.class_id,  { id: r.class_id,  nama: r.nama_kelas  }])).values()], [rows]);
  const subjects = useMemo(() => [...new Map(rows.map((r) => [r.subject_id, { id: r.subject_id, nama: r.nama_mapel }])).values()], [rows]);

  // Group rows: { siswa+kelas+mapel → { info, lessons[] } }
  const grouped = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      const key = `${r.nama_siswa}__${r.class_id}__${r.subject_id}`;
      if (!map.has(key)) {
        map.set(key, {
          nama_siswa: r.nama_siswa,
          nama_kelas: r.nama_kelas,
          nama_mapel: r.nama_mapel,
          class_id:   r.class_id,
          subject_id: r.subject_id,
          lessons: [],
        });
      }
      map.get(key).lessons.push({
        lesson_id:    r.lesson_id,
        judul_bab:    r.judul_bab,
        urutan:       r.urutan,
        is_completed: r.is_completed,
        completed_at: r.completed_at,
      });
    });
    return [...map.values()];
  }, [rows]);

  // Hitung progress per siswa per mapel
  const withProgress = useMemo(() =>
    grouped.map((g) => {
      const total   = g.lessons.length;
      const selesai = g.lessons.filter((l) => l.is_completed).length;
      const pct     = total > 0 ? Math.round((selesai / total) * 100) : 0;
      return { ...g, total, selesai, pct };
    }),
  [grouped]);

  // Filter status
  const filtered = useMemo(() => {
    if (filterStatus === 'selesai') return withProgress.filter((g) => g.pct === 100);
    if (filterStatus === 'belum')   return withProgress.filter((g) => g.pct < 100);
    return withProgress;
  }, [withProgress, filterStatus]);

  // Ringkasan
  const summary = useMemo(() => ({
    totalSiswa:  new Set(filtered.map((g) => `${g.nama_siswa}__${g.class_id}`)).size,
    selesai100:  filtered.filter((g) => g.pct === 100).length,
    belumSelesai: filtered.filter((g) => g.pct < 100).length,
  }), [filtered]);

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📋 Progress Siswa</h1>
        <p className="text-gray-500 mt-1">Pantau progress belajar siswa per materi dan mata pelajaran</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => { setFilterClass(e.target.value); setFilterSubject(''); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Mata Pelajaran</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Semua Mapel</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Semua Status</option>
              <option value="selesai">✅ Selesai 100%</option>
              <option value="belum">⏳ Belum Selesai</option>
            </select>
          </div>
        </div>
        {(filterClass || filterSubject || filterStatus) && (
          <button
            onClick={() => { setFilterClass(''); setFilterSubject(''); setFilterStatus(''); }}
            className="mt-3 text-xs text-blue-500 hover:underline"
          >
            × Reset filter
          </button>
        )}
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-700">{summary.totalSiswa}</div>
          <div className="text-xs text-gray-400 mt-0.5">Total Siswa</div>
        </div>
        <div className="bg-white rounded-xl border border-green-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.selesai100}</div>
          <div className="text-xs text-gray-400 mt-0.5">Selesai 100%</div>
        </div>
        <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{summary.belumSelesai}</div>
          <div className="text-xs text-gray-400 mt-0.5">Belum Selesai</div>
        </div>
      </div>

      {/* Tabel */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400">Tidak ada data progress ditemukan.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">No</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">Nama Siswa</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">Kelas</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">Mata Pelajaran</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-semibold text-xs uppercase">Materi Selesai</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase min-w-[160px]">Progress</th>
                  <th className="px-4 py-3 text-center text-gray-500 font-semibold text-xs uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((g, idx) => (
                  <tr key={`${g.nama_siswa}__${g.class_id}__${g.subject_id}`}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{g.nama_siswa}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                        {g.nama_kelas}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{g.nama_mapel}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      <span className="font-semibold">{g.selesai}</span>
                      <span className="text-gray-400"> / {g.total}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              g.pct === 100 ? 'bg-green-500' : g.pct >= 50 ? 'bg-blue-400' : 'bg-orange-400'
                            }`}
                            style={{ width: `${g.pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-9 text-right">{g.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {g.pct === 100 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                          ✅ Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
                          ⏳ Belum
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
            Menampilkan {filtered.length} entri
          </div>
        </div>
      )}
    </div>
  );
};
