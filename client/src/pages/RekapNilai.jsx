import { useEffect, useState, useMemo } from 'react';
import { lessonService } from '../services/lessonService';
import { Loader } from '../components/Loader';

// ── Warna nilai ───────────────────────────────────────────────────────────────
const nilaiStyle = (nilai) => {
  if (nilai === null || nilai === undefined)
    return 'bg-gray-100 text-gray-400 border-gray-200';
  if (nilai >= 80) return 'bg-green-50 text-green-700 border-green-200';
  if (nilai >= 60) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  return 'bg-red-50 text-red-600 border-red-200';
};

// ── Ikon kategori nilai ───────────────────────────────────────────────────────
const nilaiIcon = (nilai) => {
  if (nilai === null || nilai === undefined) return '—';
  if (nilai >= 80) return '🟢';
  if (nilai >= 60) return '🟡';
  return '🔴';
};

export const RekapNilai = () => {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [downloading, setDownloading] = useState(false);

  // Filter state
  const [filterMapel,  setFilterMapel]  = useState('');
  const [filterKelas,  setFilterKelas]  = useState('');
  const [filterMateri, setFilterMateri] = useState('');
  const [filterNama,   setFilterNama]   = useState('');
  const [sortKey,      setSortKey]      = useState('nama_siswa');
  const [sortDir,      setSortDir]      = useState('asc');

  useEffect(() => {
    lessonService.getRekapNilai()
      .then(setRows)
      .catch((err) => setError(err.message || 'Gagal memuat data rekap nilai.'))
      .finally(() => setLoading(false));
  }, []);

  // ── Opsi dropdown unik ────────────────────────────────────────────────────
  const mapelOptions  = useMemo(() => [...new Set(rows.map((r) => r.nama_mapel))].sort(),  [rows]);
  const kelasOptions  = useMemo(() => [...new Set(rows.map((r) => `${r.nama_kelas} (${r.tingkat})`))].sort(), [rows]);
  const materiOptions = useMemo(
    () =>
      [...new Set(
        rows
          .filter((r) => !filterMapel || r.nama_mapel === filterMapel)
          .map((r) => r.judul_bab),
      )].sort(),
    [rows, filterMapel],
  );

  // ── Filter + sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows;
    if (filterMapel)  data = data.filter((r) => r.nama_mapel === filterMapel);
    if (filterKelas)  data = data.filter((r) => `${r.nama_kelas} (${r.tingkat})` === filterKelas);
    if (filterMateri) data = data.filter((r) => r.judul_bab === filterMateri);
    if (filterNama)   data = data.filter((r) =>
      r.nama_siswa.toLowerCase().includes(filterNama.toLowerCase()) ||
      (r.nisn || '').includes(filterNama),
    );

    return [...data].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'nilai') {
        va = va === null ? -1 : Number(va);
        vb = vb === null ? -1 : Number(vb);
      } else {
        va = String(va ?? '').toLowerCase();
        vb = String(vb ?? '').toLowerCase();
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, filterMapel, filterKelas, filterMateri, filterNama, sortKey, sortDir]);

  // ── Statistik ringkasan ───────────────────────────────────────────────────
  const summary = useMemo(() => {
    const withNilai = filtered.filter((r) => r.nilai !== null);
    const total     = filtered.length;
    if (!withNilai.length) return { total, avg: null, lulus: 0, belum: 0, blmKerjakan: 0 };
    const avg      = Math.round(withNilai.reduce((s, r) => s + Number(r.nilai), 0) / withNilai.length);
    const lulus    = withNilai.filter((r) => Number(r.nilai) >= 60).length;
    const blmKerjakan = filtered.filter((r) => r.nilai === null).length;
    return { total, avg, lulus, belum: withNilai.length - lulus, blmKerjakan };
  }, [filtered]);

  // ── Sort toggle ───────────────────────────────────────────────────────────
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-primary ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // ── Unduh Excel ───────────────────────────────────────────────────────────
  const handleDownload = () => {
    setDownloading(true);
    try {
      const lessonId = filterMateri
        ? rows.find((r) => r.judul_bab === filterMateri)?.lesson_id || null
        : null;
      const timestamp = new Date().toISOString().slice(0, 10);
      lessonService.downloadRekapNilai(lessonId, `Rekap_Nilai_${timestamp}.xlsx`);
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  // ── Reset filter ──────────────────────────────────────────────────────────
  const resetFilter = () => {
    setFilterMapel('');
    setFilterKelas('');
    setFilterMateri('');
    setFilterNama('');
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">📊 Rekap Nilai Semua Materi</h1>
            <p className="text-gray-500 mt-1">Nilai kuis siswa dikelompokkan per materi pelajaran.</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading || !filtered.length}
            className="btn btn-primary flex items-center gap-2 px-5 py-2.5 disabled:opacity-50"
          >
            {downloading ? '⏳ Mengunduh...' : '⬇️ Unduh Excel'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ── Kartu ringkasan ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card bg-white text-center border border-gray-100">
            <div className="text-3xl font-bold text-primary">{summary.total}</div>
            <div className="text-sm text-gray-500 mt-1">Total Data</div>
          </div>
          <div className="card bg-white text-center border border-gray-100">
            <div className="text-3xl font-bold text-blue-500">
              {summary.avg !== null ? summary.avg : '—'}
            </div>
            <div className="text-sm text-gray-500 mt-1">Rata-rata Nilai</div>
          </div>
          <div className="card bg-white text-center border border-gray-100">
            <div className="text-3xl font-bold text-green-600">{summary.lulus}</div>
            <div className="text-sm text-gray-500 mt-1">Lulus (≥60)</div>
          </div>
          <div className="card bg-white text-center border border-gray-100">
            <div className="text-3xl font-bold text-gray-400">{summary.blmKerjakan}</div>
            <div className="text-sm text-gray-500 mt-1">Belum Kerjakan</div>
          </div>
        </div>

        {/* ── Filter ── */}
        <div className="card mb-6 border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mata Pelajaran */}
            <div>
              <label className="label">Mata Pelajaran</label>
              <select
                value={filterMapel}
                onChange={(e) => { setFilterMapel(e.target.value); setFilterMateri(''); }}
                className="input-field"
              >
                <option value="">Semua</option>
                {mapelOptions.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            {/* Kelas */}
            <div>
              <label className="label">Kelas</label>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="input-field"
              >
                <option value="">Semua</option>
                {kelasOptions.map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
            {/* Materi */}
            <div>
              <label className="label">Materi</label>
              <select
                value={filterMateri}
                onChange={(e) => setFilterMateri(e.target.value)}
                className="input-field"
              >
                <option value="">Semua</option>
                {materiOptions.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            {/* Nama / NISN */}
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
          {(filterMapel || filterKelas || filterMateri || filterNama) && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-500">{filtered.length} data ditemukan</span>
              <button onClick={resetFilter} className="text-sm text-primary hover:underline">
                × Reset filter
              </button>
            </div>
          )}
        </div>

        {/* ── Tabel ── */}
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 text-lg">Tidak ada data yang sesuai filter.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold w-8">No</th>
                    <th
                      className="px-4 py-3 text-left text-gray-600 font-semibold cursor-pointer hover:text-primary whitespace-nowrap"
                      onClick={() => toggleSort('nama_mapel')}
                    >
                      Mata Pelajaran <SortIcon k="nama_mapel" />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-gray-600 font-semibold cursor-pointer hover:text-primary whitespace-nowrap"
                      onClick={() => toggleSort('judul_bab')}
                    >
                      Materi <SortIcon k="judul_bab" />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-gray-600 font-semibold cursor-pointer hover:text-primary whitespace-nowrap"
                      onClick={() => toggleSort('nama_kelas')}
                    >
                      Kelas <SortIcon k="nama_kelas" />
                    </th>
                    <th
                      className="px-4 py-3 text-left text-gray-600 font-semibold cursor-pointer hover:text-primary whitespace-nowrap"
                      onClick={() => toggleSort('nama_siswa')}
                    >
                      Nama Siswa <SortIcon k="nama_siswa" />
                    </th>
                    <th className="px-4 py-3 text-left text-gray-600 font-semibold whitespace-nowrap">
                      NISN
                    </th>
                    <th className="px-4 py-3 text-center text-gray-600 font-semibold whitespace-nowrap">
                      Soal
                    </th>
                    <th
                      className="px-4 py-3 text-center text-gray-600 font-semibold cursor-pointer hover:text-primary whitespace-nowrap"
                      onClick={() => toggleSort('nilai')}
                    >
                      Nilai <SortIcon k="nilai" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((row, idx) => (
                    <tr key={`${row.lesson_id}-${row.nisn}-${idx}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-400 text-center">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{row.nama_mapel}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs">
                        <span className="line-clamp-2">{row.judul_bab}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">
                          {row.nama_kelas}
                        </span>
                        <span className="ml-1 text-xs text-gray-400">{row.tingkat}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-800 font-medium">{row.nama_siswa}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{row.nisn || '—'}</td>
                      <td className="px-4 py-3 text-center text-gray-500 text-xs whitespace-nowrap">
                        {row.nilai !== null
                          ? `${parseInt(row.soal_benar)}/${parseInt(row.total_soal)}`
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.nilai !== null ? (
                          <span
                            className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-lg border ${nilaiStyle(Number(row.nilai))}`}
                          >
                            {nilaiIcon(Number(row.nilai))}&nbsp;{parseInt(row.nilai)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Belum kerjakan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer tabel */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex flex-wrap gap-4">
              <span>🟢 Nilai ≥ 80 — Sangat Baik</span>
              <span>🟡 Nilai 60–79 — Cukup</span>
              <span>🔴 Nilai &lt; 60 — Perlu Perbaikan</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
