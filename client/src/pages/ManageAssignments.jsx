import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { subjectService } from '../services/subjectService';
import { classService } from '../services/classService';
import { userManagementService } from '../services/userManagementService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const EMPTY_FORM = {
  class_id: '',
  subject_id: '',
  teacher_id: '',
};

export const ManageAssignments = () => {
  const { data: assignments, loading: loadingA, error: errorA, refetch } =
    useFetch(() => subjectService.getAllClassSubjects(), []);

  const { data: classes, loading: loadingC } =
    useFetch(() => classService.getAll(), []);

  const { data: subjects, loading: loadingS } =
    useFetch(() => subjectService.getAll(), []);

  const { data: teachers, loading: loadingT } =
    useFetch(() => userManagementService.getAll({ role: 'guru' }), []);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // cs.id being edited (for reassign)
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ── Group assignments by kelas for display ──────────────────────────────────
  const grouped = assignments
    ? assignments.reduce((acc, a) => {
        const key = `${a.tingkat}-${a.nama_kelas}`;
        if (!acc[key]) acc[key] = { label: `${a.nama_kelas} (Tingkat ${a.tingkat})`, items: [] };
        acc[key].items.push(a);
        return acc;
      }, {})
    : {};

  // ── Reset form ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setFormError('');
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // ── Edit (reassign guru) ────────────────────────────────────────────────────
  const handleEdit = (a) => {
    setEditingId(a.id);
    setFormData({
      class_id: String(a.class_id),
      subject_id: String(a.subject_id),
      teacher_id: a.teacher_id ? String(a.teacher_id) : '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.class_id || !formData.subject_id) {
      setFormError('Kelas dan mata pelajaran wajib dipilih.');
      return;
    }

    setSubmitting(true);
    try {
      await subjectService.assignToClass(
        formData.class_id,
        formData.subject_id,
        formData.teacher_id || null
      );
      closeForm();
      refetch();
    } catch (err) {
      setFormError('Gagal menyimpan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id, label) => {
    if (!window.confirm(`Hapus penugasan "${label}"?`)) return;
    try {
      await subjectService.removeClassSubject(id);
      refetch();
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const isLoading = loadingA || loadingC || loadingS || loadingT;
  if (isLoading) return <Loader />;
  if (errorA) return <div className="text-center text-red-500 p-8">{errorA}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">🔗 Penugasan Kelas & Mapel</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kaitkan mata pelajaran ke kelas dan tetapkan guru pengampu
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Tutup Form' : '+ Tambah Penugasan'}
        </Button>
      </div>

      {/* ── FORM ── */}
      {showForm && (
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-5">
            {editingId ? '✏️ Ubah Guru Pengampu' : '➕ Tambah Penugasan Baru'}
          </h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm">
              ⚠️ {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Kelas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                disabled={!!editingId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Kelas --</option>
                {classes?.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nama_kelas} (Tingkat {c.tingkat})
                  </option>
                ))}
              </select>
            </div>

            {/* Mata Pelajaran */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                disabled={!!editingId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {subjects?.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.nama_mapel}
                  </option>
                ))}
              </select>
            </div>

            {/* Guru */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guru Pengampu
                <span className="text-gray-400 font-normal ml-1">(opsional)</span>
              </label>
              <select
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Belum ada guru --</option>
                {teachers?.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {t.nama} ({t.email})
                  </option>
                ))}
              </select>
              {teachers?.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  Belum ada akun guru. Tambahkan guru di menu Pengguna terlebih dahulu.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={submitting}>
                {submitting ? '⏳ Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
              <Button type="button" variant="outline" onClick={closeForm} disabled={submitting}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── LIST ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          Belum ada penugasan. Klik <strong>+ Tambah Penugasan</strong> untuk memulai.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(grouped).map((group) => (
            <div key={group.label}>
              <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🏫 {group.label}
              </h2>
              <div className="space-y-3">
                {group.items.map((a) => (
                  <Card key={a.id}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Mapel badge */}
                        <span className="shrink-0 text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          {a.nama_mapel}
                        </span>

                        {/* Guru info */}
                        <div className="min-w-0">
                          {a.nama_guru ? (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {a.nama_guru.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {a.nama_guru}
                                </p>
                                <p className="text-xs text-gray-400 truncate">{a.email_guru}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-orange-500 italic">
                              ⚠️ Belum ada guru pengampu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(a)}
                        >
                          {a.nama_guru ? 'Ganti Guru' : 'Tetapkan Guru'}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() =>
                            handleDelete(a.id, `${a.nama_mapel} — ${a.nama_kelas}`)
                          }
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
