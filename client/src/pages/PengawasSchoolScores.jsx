import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pengawasService } from '../services/pengawasService';
import { Loader } from '../components/Loader';

export const PengawasSchoolScores = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState('');
  const [filterMapel, setFilterMapel] = useState('');
  const [filterNama, setFilterNama] = useState('');

  useEffect(() => {
    Promise.all([
      pengawasService.getSchoolById(id),
      pengawasService.getSchoolScores(id),
    ])
      .then(([s, sc]) => { setSchool(s); setScores(sc); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const kelasList  = useMemo(() => [...new Set(scores.map(r => r.nama_kelas))], [scores]);
  const mapelList  = useMemo(() => [...new Set(scores.map(r => r.nama_mapel))], [scores]);

  const filtered = useMemo(() => scores.filter(r => {
    if (filterKelas && r.nama_kelas !== filterKelas) return false;
    if (filterMapel && r.nama_mapel !== filterMapel) return false;
    if (filterNama && !r.nama_siswa.toLowerCase().includes(filterNama.toLowerCase())) return false;
    return true;
  }), [scores, filterKelas, filterMapel, filterNama]);

  const nilaiColor = (n) => {
    if (n === null) return 'text-gray-400';
    if (n >= 80) return 'text-green-600 font-bold';
    if (n >= 60) return 'text-yellow-600 font-bold';
    return 'text-red-500 font-bold';
  };

  if (loading) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button onClick={() => navigate(`/pengawas/schools/${id}`)} className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Kembali ke Detail Sekolah
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 Nilai Siswa</h1>
        <p className="text-gray-500 mt-1">{school?.nama}</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={filterKelas} onChange={e => setFilterKelas(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">Semua Kelas</option>
            {kelasList.map(k => <option key={k}>{k}</option>)}
          </select>
          <select value={filterMapel} onChange={e => setFilterMapel(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">Semua Mapel</option>
            {mapelList.map(m => <option key={m}>{m}</option>)}
          </select>
          <input type="text" placeholder="Cari nama siswa..."
            value={filterNama} onChange={e => setFilterNama(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        {(filterKelas || filterMapel || filterNama) && (
          <button onClick={() => { setFilterKelas(''); setFilterMapel(''); setFilterNama(''); }}
            className="mt-2 text-xs text-indigo-500 hover:underline">× Reset filter</button>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['No','Nama Siswa','NISN','Kelas','Mata Pelajaran','Materi','Jawab','Benar','Nilai'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-gray-500 font-semibold text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={i} className="hover:bg-indigo-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{i+1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{r.nama_siswa}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.nisn || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">{r.nama_kelas}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.nama_mapel}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <span className="line-clamp-1">{r.judul_bab}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">{parseInt(r.soal_dijawab)||0}/{parseInt(r.total_soal)||0}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{parseInt(r.soal_benar)||0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={nilaiColor(r.nilai)}>
                      {r.nilai !== null ? parseInt(r.nilai) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-400">
          {filtered.length} data ditampilkan
        </div>
      </div>
    </div>
  );
};
