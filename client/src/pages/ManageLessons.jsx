import { useState, useEffect, useRef } from 'react';
import { useFetch } from '../hooks/useFetch';
import { lessonService } from '../services/lessonService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const EMPTY_FORM = {
  selectedClassId: '',   // class_id (integer as string)
  selectedSubjectId: '', // subject_id (integer as string)
  class_subject_id: '',  // resolved cs.id → dikirim ke backend
  judul_bab: '',
  media_url: '',
};

export const ManageLessons = () => {
  const { data: lessons, loading, error, refetch } = useFetch(
    () => lessonService.getAll(), []
  );
  const { data: classSubjects, loading: loadingCS, error: errorCS } = useFetch(
    () => lessonService.getClassSubjects(), []
  );

  // Derive unique classes: [{class_id, nama_kelas, tingkat}]
  const uniqueClasses = classSubjects
    ? [
        ...new Map(
          classSubjects.map((cs) => [cs.class_id, { class_id: cs.class_id, nama_kelas: cs.nama_kelas, tingkat: cs.tingkat }])
        ).values(),
      ]
    : [];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');

  const pdfInputRef = useRef(null);
  const excelInputRef = useRef(null);

  // Subjects for selected class
  const filteredSubjects = classSubjects && formData.selectedClassId
    ? classSubjects.filter((cs) => String(cs.class_id) === String(formData.selectedClassId))
    : [];

  // Auto-resolve class_subject_id when both class and subject selected
  useEffect(() => {
    if (formData.selectedClassId && formData.selectedSubjectId && classSubjects) {
      const match = classSubjects.find(
        (cs) =>
          String(cs.class_id) === String(formData.selectedClassId) &&
          String(cs.subject_id) === String(formData.selectedSubjectId)
      );
      setFormData((prev) => ({
        ...prev,
        class_subject_id: match ? String(match.id) : '',
      }));
    }
  }, [formData.selectedClassId, formData.selectedSubjectId, classSubjects]);

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setPdfFile(null);
    setExcelFile(null);
    setFormError('');
    setImportSuccess('');
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (lesson) => {
    const cs = classSubjects?.find((c) => c.id === lesson.class_subject_id);
    setEditingId(lesson.id);
    setFormData({
      selectedClassId: cs ? String(cs.class_id) : '',
      selectedSubjectId: cs ? String(cs.subject_id) : '',
      class_subject_id: String(lesson.class_subject_id),
      judul_bab: lesson.judul_bab,
      media_url: lesson.media_url || '',
    });
    setPdfFile(null);
    setExcelFile(null);
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async (isPublished) => {
    setFormError('');
    if (!formData.class_subject_id) {
      setFormError('Pilih kelas dan mata pelajaran terlebih dahulu.');
      return;
    }
    if (!formData.judul_bab.trim()) {
      setFormError('Judul bab wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('class_subject_id', formData.class_subject_id);
      data.append('judul_bab', formData.judul_bab.trim());
      data.append('media_url', formData.media_url.trim());
      data.append('is_published', String(isPublished));
      data.append('konten_teks', ' ');
      if (pdfFile) data.append('pdf_file', pdfFile);

      let savedLesson;
      if (editingId) {
        savedLesson = await lessonService.update(editingId, data);
      } else {
        savedLesson = await lessonService.create(data);
      }

      if (excelFile && savedLesson?.id) {
        try {
          const result = await lessonService.importQuiz(savedLesson.id, excelFile);
          setImportSuccess(`${result.length} soal kuis berhasil diimpor.`);
        } catch (err) {
          setFormError('Materi tersimpan, tapi gagal impor kuis: ' + err.message);
          refetch();
          setSubmitting(false);
          return;
        }
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
    if (!window.confirm('Yakin ingin menghapus materi ini?')) return;
    try {
      await lessonService.delete(id);
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading || loadingCS) return <Loader />;
  if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

  // Debug: tampilkan info jika class-subjects kosong
  const csDebug = errorCS
    ? `⚠️ Gagal memuat data kelas-mapel: ${errorCS}`
    : !classSubjects || classSubjects.length === 0
    ? '⚠️ Tidak ada data kelas & mata pelajaran. Pastikan admin sudah menambahkan kelas dan mata pelajaran serta mengaitkannya.'
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📖 Kelola Materi</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'Tutup Form' : '+ Tambah Materi'}
        </Button>
      </div>

      {/* Warning jika belum ada class-subjects */}
      {csDebug && (
        <div className="mb-6 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
          {csDebug}
        </div>
      )}

      {/* ── FORM ── */}
      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? '✏️ Edit Materi' : '➕ Tambah Materi Baru'}
          </h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
              {formError}
            </div>
          )}
          {importSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm">
              ✅ {importSuccess}
            </div>
          )}

          <div className="space-y-5">
            {/* 1. Kelas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.selectedClassId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedClassId: e.target.value,
                    selectedSubjectId: '',
                    class_subject_id: '',
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Kelas --</option>
                {uniqueClasses.map((c) => (
                  <option key={c.class_id} value={String(c.class_id)}>
                    {c.nama_kelas} — {c.tingkat}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Mata Pelajaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.selectedSubjectId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    selectedSubjectId: e.target.value,
                    class_subject_id: '',
                  })
                }
                disabled={!formData.selectedClassId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {filteredSubjects.map((cs) => (
                  <option key={cs.id} value={String(cs.subject_id)}>
                    {cs.nama_mapel}
                  </option>
                ))}
              </select>
              {formData.selectedClassId && filteredSubjects.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  Tidak ada mata pelajaran yang dikaitkan dengan kelas ini.
                </p>
              )}
            </div>

            {/* 3. Judul Bab */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Bab <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.judul_bab}
                onChange={(e) => setFormData({ ...formData, judul_bab: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Bab 1 - Pengenalan Matematika"
              />
            </div>

            {/* 4. Import PDF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📄 Impor Materi (PDF)
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {pdfFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setPdfFile(null);
                      if (pdfInputRef.current) pdfInputRef.current.value = '';
                    }}
                    className="text-red-500 text-xs hover:underline whitespace-nowrap"
                  >
                    ✕ Hapus
                  </button>
                )}
              </div>
              {pdfFile && <p className="text-xs text-gray-500 mt-1">📎 {pdfFile.name}</p>}
              <p className="text-xs text-gray-400 mt-1">Maks. 20 MB. Format: PDF.</p>
            </div>

            {/* 5. URL YouTube */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🎬 URL Video YouTube
              </label>
              <input
                type="url"
                value={formData.media_url}
                onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* 6. Import Kuis Excel */}
            <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  📊 Impor Soal Kuis (Excel)
                </label>
                <button
                  type="button"
                  onClick={lessonService.downloadQuizTemplate}
                  className="text-xs text-blue-600 hover:underline"
                >
                  ⬇️ Unduh Template
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={(e) => setExcelFile(e.target.files[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {excelFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setExcelFile(null);
                      if (excelInputRef.current) excelInputRef.current.value = '';
                    }}
                    className="text-red-500 text-xs hover:underline whitespace-nowrap"
                  >
                    ✕ Hapus
                  </button>
                )}
              </div>
              {excelFile && <p className="text-xs text-gray-500 mt-1">📎 {excelFile.name}</p>}
              <p className="text-xs text-gray-400 mt-1">
                Kolom: pertanyaan, pilihan_a, pilihan_b, pilihan_c, pilihan_d, jawaban_benar, poin.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={submitting}
              >
                {submitting ? '⏳ Menyimpan...' : '💾 Simpan Draft'}
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={submitting}
              >
                {submitting ? '⏳ Menyimpan...' : '🚀 Posting Materi'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={submitting}>
                Batal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── LIST ── */}
      <div className="space-y-4">
        {lessons && lessons.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            Belum ada materi. Klik <strong>+ Tambah Materi</strong> untuk mulai.
          </div>
        )}
        {lessons &&
          lessons.map((lesson) => (
            <Card key={lesson.id}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {lesson.nama_mapel}
                    </span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                      {lesson.nama_kelas}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        lesson.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {lesson.is_published ? '✅ Dipublikasi' : '📝 Draft'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
                    {lesson.judul_bab}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {lesson.pdf_url && (
                      <a
                        href={lesson.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        📄 Lihat PDF
                      </a>
                    )}
                    {lesson.media_url && (
                      <a
                        href={lesson.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:underline"
                      >
                        🎬 Video YouTube
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() =>
                      lessonService.downloadStudentScores(
                        lesson.id,
                        `Nilai_${lesson.judul_bab.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_${lesson.nama_kelas}.xlsx`
                      )
                    }
                    title="Unduh nilai kuis siswa"
                  >
                    📊 Nilai
                  </Button>
                  <Button variant="outline" onClick={() => handleEdit(lesson)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(lesson.id)}>
                    Hapus
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
};
