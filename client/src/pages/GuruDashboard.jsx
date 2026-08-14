import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { lessonService } from '../services/lessonService';
import { quizService } from '../services/quizService';
import { Loader } from '../components/Loader';

// ── Warna nilai ────────────────────────────────────────────────────────────
const nilaiColor = (nilai) => {
  if (nilai === null || nilai === undefined) return 'bg-gray-100 text-gray-400';
  if (nilai >= 80) return 'bg-green-100 text-green-700';
  if (nilai >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-600';
};

const nilaiIcon = (nilai) => {
  if (nilai === null || nilai === undefined) return '—';
  if (nilai >= 80) return '🟢';
  if (nilai >= 60) return '🟡';
  return '🔴';
};

// ── Progress bar ───────────────────────────────────────────────────────────
const ProgressBar = ({ value, max, color = 'bg-primary' }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>
    </div>
  );
};

export const GuruDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats]               = useState({ lessons: 0, quizzes: 0 });
  const [classSubjects, setClassSubjects] = useState([]);
  const [studentCounts, setStudentCounts] = useState({});     // { [class_subject_id]: jumlah_siswa }
  const [sudahKerjakan, setSudahKerjakan] = useState({});     // { [class_subject_id]: sudah_kerjakan }
  const [rekapRows, setRekapRows]         = useState([]);
  const [recentLessons, setRecentLessons] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  // filter progres siswa
  const [filterCS, setFilterCS]   = useState('');   // class_subject id
  const [filterNama, setFilterNama] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [lessons, quizzes, cs, rekap, counts, kerjakan] = await Promise.all([
          lessonService.getAll(),
          quizService.getAll(),
          lessonService.getClassSubjects(),
          lessonService.getRekapNilai(),
          lessonService.getStudentCounts(),
          lessonService.getSudahKerjakan(),
        ]);
        setStats({ lessons: lessons.length, quizzes: quizzes.length });
        setClassSubjects(cs);
        // Buat map { class_subject_id → jumlah_siswa }
        const countMap = {};
        counts.forEach((c) => { countMap[c.class_subject_id] = parseInt(c.jumlah_siswa); });
        setStudentCounts(countMap);
        // Buat map { class_subject_id → sudah_kerjakan }
        const kerjakanMap = {};
        kerjakan.forEach((k) => { kerjakanMap[k.class_subject_id] = parseInt(k.sudah_kerjakan); });
        setSudahKerjakan(kerjakanMap);
        setRekapRows(rekap);
        setRecentLessons(lessons.slice(0, 3));
      } catch (err) {
        setError(err.message || 'Gagal memuat data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Ringkasan per class_subject ─────────────────────────────────────────
  const csSummary = useMemo(() => {
    return classSubjects.map((cs) => {
      const totalSiswa  = studentCounts[cs.id] ?? 0;
      const sdhKerjakan = sudahKerjakan[cs.id] ?? 0;

      // Rata-rata & lulus dari rekapRows (tetap pakai rekap untuk nilai)
      const rows      = rekapRows.filter(
        (r) => r.nama_mapel === cs.nama_mapel && r.nama_kelas === cs.nama_kelas
      );
      const withNilai = rows.filter((r) => r.nilai !== null);
      const avg       = withNilai.length
        ? Math.round(withNilai.reduce((s, r) => s + Number(r.nilai), 0) / withNilai.length)
        : null;
      const lulus     = withNilai.filter((r) => Number(r.nilai) >= 60).length;

      return { ...cs, totalSiswa, sudahKerjakan: sdhKerjakan, avg, lulus };
    });
  }, [classSubjects, rekapRows, studentCounts, sudahKerjakan]);

  // ── Filter baris rekap ──────────────────────────────────────────────────
  const filteredRekap = useMemo(() => {
    let data = rekapRows;
    if (filterCS) {
      const cs = classSubjects.find((c) => String(c.id) === filterCS);
      if (cs) data = data.filter((r) => r.nama_mapel === cs.nama_mapel && r.nama_kelas === cs.nama_kelas);
    }
    if (filterNama) {
      const q = filterNama.toLowerCase();
      data = data.filter((r) =>
        r.nama_siswa.toLowerCase().includes(q) || (r.nisn || '').includes(filterNama)
      );
    }
    return data;
  }, [rekapRows, filterCS, filterNama, classSubjects]);

  // ── Statistik ringkasan rekap yang terfilter ────────────────────────────
  const rekapSummary = useMemo(() => {
    const withNilai = filteredRekap.filter((r) => r.nilai !== null);
    const avg = withNilai.length
      ? Math.round(withNilai.reduce((s, r) => s + Number(r.nilai), 0) / withNilai.length)
      : null;
    return {
      total: filteredRekap.length,
      avg,
      lulus: withNilai.filter((r) => Number(r.nilai) >= 60).length,
      blmKerjakan: filteredRekap.filter((r) => r.nilai === null).length,
    };
  }, [filteredRekap]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* ── Sapaan ── */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">
            👨‍🏫 Halo, {user?.nama?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 text-lg">
            Selamat datang di ruang kerja guru. Siap berbagi ilmu hari ini?
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ── Statistik ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
          <div className="card bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <div className="text-5xl font-bold mb-1">{stats.lessons}</div>
            <div className="text-base opacity-90">📖 Total Materi</div>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-5xl font-bold mb-1">{stats.quizzes}</div>
            <div className="text-base opacity-90">📝 Total Kuis</div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="text-5xl font-bold mb-1">{classSubjects.length}</div>
            <div className="text-base opacity-90">🏫 Kelas Aktif</div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="text-5xl font-bold mb-1">
              {[...new Set(classSubjects.map((c) => c.subject_id))].length}
            </div>
            <div className="text-base opacity-90">📚 Mata Pelajaran</div>
          </div>
        </div>

        {/* ── Tabel Mapel & Kelas Aktif ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-700">📋 Mapel & Kelas Aktif</h2>
            <Link to="/guru/lessons" className="text-sm text-primary hover:underline font-medium">
              Kelola Materi →
            </Link>
          </div>

          {csSummary.length === 0 ? (
            <div className="card text-center py-10 border border-gray-100">
              <div className="text-5xl mb-3">📂</div>
              <p className="text-gray-500">Belum ada kelas & mapel yang ditugaskan.</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">Mata Pelajaran</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">Kelas</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-semibold">Siswa</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-semibold">Sudah Kerjakan</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold min-w-[140px]">Progres</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-semibold">Rata-rata</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-semibold">Lulus ≥60</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {csSummary.map((cs) => (
                      <tr key={cs.id} className="hover:bg-amber-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-800">{cs.nama_mapel}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                            {cs.nama_kelas}
                          </span>
                          {cs.tingkat && (
                            <span className="ml-1 text-xs text-gray-400">{cs.tingkat}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 font-medium">
                          {cs.totalSiswa}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">
                          <span className="font-semibold">{cs.sudahKerjakan}</span>
                          <span className="text-gray-400"> / {cs.totalSiswa}</span>
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar
                            value={cs.sudahKerjakan}
                            max={cs.totalSiswa}
                            color={
                              cs.totalSiswa > 0 && cs.sudahKerjakan / cs.totalSiswa >= 0.8
                                ? 'bg-green-500'
                                : cs.sudahKerjakan / cs.totalSiswa >= 0.5
                                ? 'bg-amber-400'
                                : 'bg-red-400'
                            }
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {cs.avg !== null ? (
                            <span className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-lg ${nilaiColor(cs.avg)}`}>
                              {nilaiIcon(cs.avg)} {cs.avg}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Belum ada</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {cs.totalSiswa > 0 ? (
                            <span className="text-sm font-semibold text-green-600">{cs.lulus}</span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── Progres Siswa ── */}
        <section className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-700">📊 Progres Siswa</h2>
            <Link to="/guru/rekap-nilai" className="text-sm text-primary hover:underline font-medium">
              Lihat Rekap Lengkap →
            </Link>
          </div>

          {/* Filter */}
          <div className="card border border-gray-100 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Mapel / Kelas</label>
                <select
                  value={filterCS}
                  onChange={(e) => setFilterCS(e.target.value)}
                  className="input-field"
                >
                  <option value="">Semua</option>
                  {classSubjects.map((cs) => (
                    <option key={cs.id} value={String(cs.id)}>
                      {cs.nama_mapel} — {cs.nama_kelas}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Nama / NISN Siswa</label>
                <input
                  type="text"
                  placeholder="Cari nama atau NISN..."
                  value={filterNama}
                  onChange={(e) => setFilterNama(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
            {(filterCS || filterNama) && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-gray-500">{filteredRekap.length} data ditemukan</span>
                <button
                  onClick={() => { setFilterCS(''); setFilterNama(''); }}
                  className="text-sm text-primary hover:underline"
                >
                  × Reset
                </button>
              </div>
            )}
          </div>

          {/* Ringkasan cepat */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="card bg-white text-center border border-gray-100 py-3">
              <div className="text-2xl font-bold text-primary">{rekapSummary.total}</div>
              <div className="text-xs text-gray-500 mt-0.5">Total Data</div>
            </div>
            <div className="card bg-white text-center border border-gray-100 py-3">
              <div className="text-2xl font-bold text-blue-500">
                {rekapSummary.avg !== null ? rekapSummary.avg : '—'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Rata-rata Nilai</div>
            </div>
            <div className="card bg-white text-center border border-gray-100 py-3">
              <div className="text-2xl font-bold text-green-600">{rekapSummary.lulus}</div>
              <div className="text-xs text-gray-500 mt-0.5">Lulus ≥60</div>
            </div>
            <div className="card bg-white text-center border border-gray-100 py-3">
              <div className="text-2xl font-bold text-gray-400">{rekapSummary.blmKerjakan}</div>
              <div className="text-xs text-gray-500 mt-0.5">Belum Kerjakan</div>
            </div>
          </div>

          {/* Tabel progres */}
          {filteredRekap.length === 0 ? (
            <div className="card text-center py-10 border border-gray-100">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500">Belum ada data progres siswa.</p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold w-8">No</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">Siswa</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">NISN</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">Mata Pelajaran</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">Materi</th>
                      <th className="px-4 py-3 text-left text-gray-600 font-semibold">Kelas</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-semibold">Soal</th>
                      <th className="px-4 py-3 text-center text-gray-600 font-semibold">Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRekap.map((row, idx) => (
                      <tr
                        key={`${row.lesson_id}-${row.nisn}-${idx}`}
                        className="hover:bg-amber-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-400 text-center">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{row.nama_siswa}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.nisn || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{row.nama_mapel}</td>
                        <td className="px-4 py-3 text-gray-700 max-w-xs">
                          <span className="line-clamp-1">{row.judul_bab}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                            {row.nama_kelas}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-500 text-xs">
                          {row.nilai !== null
                            ? `${parseInt(row.soal_benar)}/${parseInt(row.total_soal)}`
                            : <span className="text-gray-300">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.nilai !== null ? (
                            <span className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-lg ${nilaiColor(Number(row.nilai))}`}>
                              {nilaiIcon(Number(row.nilai))} {parseInt(row.nilai)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Belum</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex flex-wrap gap-4">
                <span>🟢 ≥80 Sangat Baik</span>
                <span>🟡 60–79 Cukup</span>
                <span>🔴 &lt;60 Perlu Perbaikan</span>
              </div>
            </div>
          )}
        </section>

        {/* ── Aksi Cepat & Materi Terbaru ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Aksi Cepat */}
          <div>
            <h2 className="text-xl font-bold text-gray-700 mb-4">⚡ Aksi Cepat</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link to="/guru/lessons" className="card border border-transparent hover:border-amber-300 flex items-center gap-4 transition-colors">
                <span className="text-3xl">📖</span>
                <div>
                  <p className="font-semibold text-gray-800">Kelola Materi</p>
                  <p className="text-sm text-gray-500">Upload PDF, tambah video, atur konten.</p>
                </div>
              </Link>
              <Link to="/guru/quizzes" className="card border border-transparent hover:border-blue-300 flex items-center gap-4 transition-colors">
                <span className="text-3xl">📝</span>
                <div>
                  <p className="font-semibold text-gray-800">Kelola Kuis</p>
                  <p className="text-sm text-gray-500">Buat soal, import Excel, pantau nilai.</p>
                </div>
              </Link>
              <Link to="/guru/rekap-nilai" className="card border border-transparent hover:border-green-300 flex items-center gap-4 transition-colors bg-green-50">
                <span className="text-3xl">📊</span>
                <div>
                  <p className="font-semibold text-gray-800">Rekap Nilai Lengkap</p>
                  <p className="text-sm text-gray-500">Filter, unduh Excel rekap semua materi.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Materi Terbaru */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-700">📋 Materi Terbaru</h2>
              <Link to="/guru/lessons" className="text-sm text-primary hover:underline font-medium">
                Lihat semua →
              </Link>
            </div>

            {recentLessons.length === 0 ? (
              <div className="card text-center py-10 border border-gray-100">
                <div className="text-5xl mb-3">📂</div>
                <p className="text-gray-500">Belum ada materi.</p>
                <Link to="/guru/lessons" className="btn btn-secondary mt-4 inline-block text-sm px-5 py-2">
                  Tambah Materi Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="card flex items-start gap-4 border border-gray-100 hover:border-amber-200 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                      📖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{lesson.judul_bab}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {lesson.nama_mapel && (
                          <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                            {lesson.nama_mapel}
                          </span>
                        )}
                        {lesson.nama_kelas && (
                          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                            {lesson.nama_kelas}
                          </span>
                        )}
                        {lesson.pdf_url && (
                          <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full">
                            📄 PDF
                          </span>
                        )}
                        {lesson.media_url && (
                          <span className="text-xs bg-purple-50 text-purple-500 border border-purple-200 px-2 py-0.5 rounded-full">
                            🎬 Media
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
