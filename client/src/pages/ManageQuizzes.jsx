import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { quizService } from '../services/quizService';
import { lessonService } from '../services/lessonService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const EMPTY_FORM = {
  lesson_id: '',
  pertanyaan: '',
  pilihan_a: '',
  pilihan_b: '',
  pilihan_c: '',
  pilihan_d: '',
  jawaban_benar: '',
  poin: '10',
  urutan: '0',
};

const JAWABAN_OPTIONS = ['a', 'b', 'c', 'd'];

export const ManageQuizzes = () => {
  // getAll() akan otomatis terfilter di backend berdasarkan role guru
  const { data: quizzes, loading, error, refetch } = useFetch(
    () => quizService.getAll(), []
  );
  // getClassSubjects() terfilter berdasarkan penugasan guru
  const { data: classSubjects, loading: loadingCS } = useFetch(
    () => lessonService.getClassSubjects(), []
  );
  // Lessons difilter nanti dari classSubjects yang dipilih
  const { data: allLessons, loading: loadingL } = useFetch(
    () => lessonService.getAll(), []
  );

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedCsId, setSelectedCsId] = useState(''); // filter materi
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Lessons yang tersedia untuk dropdown (sesuai class_subject yang dipilih)
  const availableLessons = allLessons
    ? selectedCsId
      ? allLessons.filter((l) => String(l.class_subject_id) === String(selectedCsId))
      : allLessons
    : [];

  // Unique class-subjects dari allLessons (untuk filter tampilan list)
  const uniqueCS = classSubjects || [];

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setSelectedCsId('');
    setEditingId(null);
    setFormError('');
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (quiz) => {
    // Cari class_subject_id dari lesson
    const lesson = allLessons?.find((l) => l.id === quiz.lesson_id);
    setEditingId(quiz.id);
    setSelectedCsId(lesson ? String(lesson.class_subject_id) : '');
    setFormData({
      lesson_id: String(quiz.lesson_id),
      pertanyaan: quiz.pertanyaan,
      pilihan_a: quiz.pilihan_a,
      pilihan_b: quiz.pilihan_b,
      pilihan_c: quiz.pilihan_c,
      pilihan_d: quiz.pilihan_d,
      jawaban_benar: quiz.jawaban_benar,
      poin: String(quiz.poin ?? 10),
      urutan: String(quiz.urutan ?? 0),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.lesson_id) {
      setFormError('Pilih materi terlebih dahulu.');
      return;
    }
    if (!formData.pertanyaan.trim()) {
      setFormError('Pertanyaan tidak boleh kosong.');
      return;
    }
    if (!formData.jawaban_benar) {
      setFormError('Pilih jawaban yang benar.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        poin: parseInt(formData.poin) || 10,
        urutan: parseInt(formData.urutan) || 0,
      };
      if (editingId) {
        await quizService.update(editingId, payload);
      } else {
        await quizService.create(payload);
      }
      closeForm();
      refetch();
    } catch (err) {
      setFormError('Gagal menyimpan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus soal kuis ini?')) return;
    try {
      await quizService.delete(id);
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  // Filter tampilan list berdasarkan class_subject yang dipilih (filter UI)
  const [filterCsId, setFilterCsId] = useState('');
  const filteredQuizzes = quizzes
    ? filterCsId
      ? quizzes.filter((q) => {
          const lesson = allLessons?.find((l) => l.id === q.lesson_id);
          return lesson && String(lesson.class_subject_id) === filterCsId;
        })
      : quizzes
    : [];

  if (loading || loadingCS || loadingL) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📝 Kelola Kuis</h1>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Tutup Form' : '+ Tambah Soal'}
        </Button>
      </div>

      {/* Peringatan jika belum ada penugasan */}
      {uniqueCS.length === 0 && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
          ⚠️ Anda belum memiliki penugasan kelas & mata pelajaran. Hubungi admin untuk mendapatkan penugasan.
        </div>
      )}

      {/* ── FORM ── */}
      {showForm && (
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-5">
            {editingId ? '✏️ Edit Soal Kuis' : '➕ Tambah Soal Kuis'}
          </h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Filter kelas-mapel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas & Mata Pelajaran
              </label>
              <select
                value={selectedCsId}
                onChange={(e) => {
                  setSelectedCsId(e.target.value);
                  setFormData((p) => ({ ...p, lesson_id: '' }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Semua Penugasan --</option>
                {uniqueCS.map((cs) => (
                  <option key={cs.id} value={String(cs.id)}>
                    {cs.nama_kelas} ({cs.tingkat}) — {cs.nama_mapel}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Materi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Materi / Bab <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.lesson_id}
                onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Materi --</option>
                {availableLessons.map((l) => (
                  <option key={l.id} value={String(l.id)}>
                    {l.judul_bab}
                    {l.nama_mapel ? ` — ${l.nama_mapel}` : ''}
                    {l.nama_kelas ? ` (${l.nama_kelas})` : ''}
                  </option>
                ))}
              </select>
              {selectedCsId && availableLessons.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  Belum ada materi untuk kelas ini. Buat materi terlebih dahulu.
                </p>
              )}
            </div>

            {/* Pertanyaan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pertanyaan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.pertanyaan}
                onChange={(e) => setFormData({ ...formData, pertanyaan: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tulis pertanyaan kuis di sini..."
              />
            </div>

            {/* Pilihan A-D */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['a', 'b', 'c', 'd'].map((opt) => (
                <div key={opt}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilihan {opt.toUpperCase()} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData[`pilihan_${opt}`]}
                    onChange={(e) => setFormData({ ...formData, [`pilihan_${opt}`]: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Jawaban ${opt.toUpperCase()}`}
                    required
                  />
                </div>
              ))}
            </div>

            {/* Jawaban benar + poin + urutan */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jawaban Benar <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jawaban_benar}
                  onChange={(e) => setFormData({ ...formData, jawaban_benar: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Pilih --</option>
                  {JAWABAN_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poin</label>
                <input
                  type="number"
                  value={formData.poin}
                  onChange={(e) => setFormData({ ...formData, poin: e.target.value })}
                  min={1}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <input
                  type="number"
                  value={formData.urutan}
                  onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
                  min={0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting ? '⏳ Menyimpan...' : editingId ? 'Update' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={submitting}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── FILTER LIST ── */}
      {quizzes && quizzes.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter:</label>
          <select
            value={filterCsId}
            onChange={(e) => setFilterCsId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Materi</option>
            {uniqueCS.map((cs) => (
              <option key={cs.id} value={String(cs.id)}>
                {cs.nama_kelas} — {cs.nama_mapel}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">{filteredQuizzes.length} soal</span>
        </div>
      )}

      {/* ── QUIZ LIST ── */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            Belum ada soal kuis. Klik <strong>+ Tambah Soal</strong> untuk mulai.
          </div>
        )}
        {filteredQuizzes.map((quiz, index) => (
          <Card key={quiz.id}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {quiz.judul_bab}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Poin: {quiz.poin ?? 10}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    No. {quiz.urutan ?? index + 1}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 mb-3">
                  {index + 1}. {quiz.pertanyaan}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div
                      key={opt}
                      className={`px-3 py-2 rounded-lg text-sm ${
                        quiz.jawaban_benar === opt
                          ? 'bg-green-100 text-green-800 font-semibold border border-green-300'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {opt.toUpperCase()}. {quiz[`pilihan_${opt}`]}
                      {quiz.jawaban_benar === opt && ' ✓'}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" onClick={() => handleEdit(quiz)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(quiz.id)}>Hapus</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
