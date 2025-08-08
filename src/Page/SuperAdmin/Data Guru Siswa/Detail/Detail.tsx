import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserCheck } from 'lucide-react';

interface GuruSiswaDetail {
  id: number;
  nama_guru: string;
  nama_siswa: string;
}

const DetailGuruSiswa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<GuruSiswaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Anda harus login terlebih dahulu.');
        if (!id) throw new Error('ID tidak ditemukan.');

        const res = await fetch(`http://localhost:3000/api/guru-siswa/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Gagal memuat detail: ${res.status} ${res.statusText}`);
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat detail.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button onClick={() => navigate('/DataGuruSiswa')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </button>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4 flex items-center space-x-2">
        <UserCheck className="w-6 h-6 text-blue-400" />
        <span>Detail Guru - Siswa</span>
      </h1>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {detail && (
        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{detail.id}</span>
              </div>
              <div>
                <p className="text-gray-300 text-sm">ID Record</p>
                <p className="text-white font-semibold">#{detail.id}</p>
              </div>
            </div>

            <div className="border-t border-gray-600 pt-3 space-y-2">
              <div>
                <p className="text-gray-300 text-sm">Nama Guru</p>
                <p className="text-white font-semibold">{detail.nama_guru}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Nama Siswa</p>
                <p className="text-white font-semibold">{detail.nama_siswa}</p>
              </div>
              <div>
                <p className="text-gray-300 text-sm">Status</p>
                {(() => {
                  // Try to infer status from API if available: detail.status / aktif / is_active
                  const raw = (detail as any).status ?? (detail as any).aktif ?? (detail as any).is_active;
                  const isActive = typeof raw === 'boolean' ? raw : (typeof raw === 'string' ? raw.toLowerCase() === 'aktif' || raw === '1' || raw === 'true' : undefined);
                  const label = isActive === undefined ? 'AKTIF' : (isActive ? 'AKTIF' : 'TIDAK');
                  const cls = label === 'AKTIF' ? 'bg-green-600' : 'bg-red-600';
                  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailGuruSiswa;
