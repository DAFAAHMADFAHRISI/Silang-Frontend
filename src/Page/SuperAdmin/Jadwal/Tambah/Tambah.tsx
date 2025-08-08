import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';

interface ScheduleForm {
  hari: string;
  jam_masuk: string;
  jam_keluar: string;
  location: string;
  radius_meter: string;
}

const TambahJadwal: React.FC = () => {
  const [formData, setFormData] = useState<ScheduleForm>({
    hari: '',
    jam_masuk: '',
    jam_keluar: '',
    location: '',
    radius_meter: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      setError('Anda harus login terlebih dahulu.');
      return;
    }

    if (role !== 'superadmin') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      return;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const payload = new URLSearchParams();
      payload.append('hari', formData.hari);
      payload.append('jam_masuk', formData.jam_masuk);
      payload.append('jam_keluar', formData.jam_keluar);
      payload.append('location', formData.location);
      payload.append('radius_meter', formData.radius_meter);

      const response = await fetch('http://localhost:3000/api/jadwal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body: payload.toString(),
      });

      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }

      navigate('/DataJadwal');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan jadwal.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => navigate('/DataJadwal');

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-2">
        <Calendar className="w-6 h-6 text-blue-400" />
        <span>Tambah Jadwal</span>
      </h1>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hari</label>
            <select
              value={formData.hari}
              onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Pilih Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Jam Masuk</label>
              <input
                type="text"
                value={formData.jam_masuk}
                onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })}
                placeholder="07:00"
                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Jam Keluar</label>
              <input
                type="text"
                value={formData.jam_keluar}
                onChange={(e) => setFormData({ ...formData, jam_keluar: e.target.value })}
                placeholder="15:00"
                pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Lokasi (Latitude, Longitude)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="-7.177012649696195, 113.22701726568748"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Radius (meter)</label>
            <input
              type="number"
              value={formData.radius_meter}
              onChange={(e) => setFormData({ ...formData, radius_meter: e.target.value })}
              placeholder="100"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Kembali
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahJadwal;
