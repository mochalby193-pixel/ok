import { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { classService } from '../services/classService';
import { Loader } from '../components/Loader';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const ManageClasses = () => {
  const { data: classes, loading, error, refetch } = useFetch(() => classService.getAll(), []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama_kelas: '',
    tingkat: '',
    deskripsi: '',
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await classService.update(editingId, formData);
      } else {
        await classService.create(formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ nama_kelas: '', tingkat: '', deskripsi: '' });
      refetch();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (classData) => {
    setEditingId(classData.id);
    setFormData({
      nama_kelas: classData.nama_kelas,
      tingkat: classData.tingkat,
      deskripsi: classData.deskripsi || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kelas ini?')) {
      try {
        await classService.delete(id);
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
        <h1 className="text-4xl font-bold text-gray-800">🏫 Kelola Kelas</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Tutup Form' : '+ Tambah Kelas'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {editingId ? 'Edit Kelas' : 'Tambah Kelas Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nama Kelas</label>
              <input
                type="text"
                value={formData.nama_kelas}
                onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Tingkat (1-6)</label>
              <select
                value={formData.tingkat}
                onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Pilih Tingkat</option>
                {[1, 2, 3, 4, 5, 6].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
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
                  setFormData({ nama_kelas: '', tingkat: '', deskripsi: '' });
                }}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes && classes.map((classData) => (
          <Card key={classData.id}>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {classData.nama_kelas}
            </h3>
            <p className="text-gray-600 mb-2">Tingkat: {classData.tingkat}</p>
            <p className="text-gray-600 mb-4">Siswa: {classData.jumlah_siswa}</p>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleEdit(classData)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDelete(classData.id)}>
                Hapus
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
