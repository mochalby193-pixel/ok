import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { subjectService } from '../services/subjectService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const ManageSubjects = () => {
  const { data: subjects, loading, error, refetch } = useFetch(() => subjectService.getAll(), []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama_mapel: '',
    deskripsi: '',
    icon_url: '',
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await subjectService.update(editingId, formData);
      } else {
        await subjectService.create(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nama_mapel: '', deskripsi: '', icon_url: '' });
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject.id);
    setFormData({
      nama_mapel: subject.nama_mapel,
      deskripsi: subject.deskripsi || '',
      icon_url: subject.icon_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      try {
        await subjectService.delete(id);
        refetch();
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-danger p-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📚 Kelola Mata Pelajaran</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Tutup Form' : '+ Tambah Mata Pelajaran'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nama Mata Pelajaran</label>
              <input
                type="text"
                value={formData.nama_mapel}
                onChange={(e) => setFormData({ ...formData, nama_mapel: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Deskripsi</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="input-field"
                rows="3"
              />
            </div>

            <div>
              <label className="label">Icon URL (optional)</label>
              <input
                type="url"
                value={formData.icon_url}
                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                className="input-field"
                placeholder="https://example.com/icon.png"
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit">
                {editingId ? 'Update' : 'Simpan'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ nama_mapel: '', deskripsi: '', icon_url: '' });
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects && subjects.map((subject) => (
          <Card key={subject.id}>
            {subject.icon_url && (
              <img src={subject.icon_url} alt={subject.nama_mapel} className="w-16 h-16 mb-3" />
            )}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {subject.nama_mapel}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">{subject.deskripsi}</p>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleEdit(subject)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(subject.id)}>
                Hapus
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
