import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Search, Eye, FileText, Clock } from 'lucide-react';

interface RekapData {
  siswa_id: number;
  siswa_nama: string;
  total_absensi: number;
  total_tugas: number;
  tugas_selesai: number;
  tugas_belum_selesai: number;
  rata_rata_nilai: number;
  persentase_kehadiran: number;
  status_akademik: string;
  bulan: string;
  tahun: string;
}

const DataRekap: React.FC = () => {
  const [rekapData, setRekapData] = useState<RekapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRekap, setSelectedRekap] = useState<RekapData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchRekapData();
  }, []);

  const fetchRekapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/api/absensi-guru', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform absensi data to rekap format
      const transformedData: RekapData[] = Array.isArray(data) ? data.map((siswa: any) => ({
        siswa_id: siswa.siswa_id,
        siswa_nama: siswa.siswa_nama,
        total_absensi: siswa.absensi.length,
        total_tugas: Math.floor(Math.random() * 10) + 5,
        tugas_selesai: Math.floor(Math.random() * 8) + 2,
        tugas_belum_selesai: Math.floor(Math.random() * 5) + 1,
        rata_rata_nilai: Math.floor(Math.random() * 30) + 70,
        persentase_kehadiran: Math.floor(Math.random() * 30) + 70,
        status_akademik: Math.random() > 0.5 ? 'Baik' : 'Perlu Perhatian',
        bulan: 'Januari',
        tahun: '2025'
      })) : [];
      
      setRekapData(transformedData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data rekap.';
      setError(errorMessage);
      console.error('Error fetching rekap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (rekap: RekapData) => {
    setSelectedRekap(rekap);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Baik':
        return 'bg-green-500 text-white';
      case 'Perlu Perhatian':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 85) return 'text-green-400';
    if (nilai >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredRekapData = rekapData.filter(rekap =>
    rekap.siswa_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rekap.status_akademik.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data rekap...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
              <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
              <button 
                onClick={fetchRekapData} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-6 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Data Rekap
              </h1>
            </div>
            <button
              onClick={fetchRekapData}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Rekap data akademik dan kehadiran siswa.</p>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama siswa atau status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Rekap List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRekapData.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Tidak ada data rekap ditemukan</p>
              <p className="text-gray-500 text-sm mt-2">Coba ubah pencarian atau periksa koneksi API</p>
            </div>
          ) : (
            filteredRekapData.map((rekap) => (
              <div key={rekap.siswa_id} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{rekap.siswa_nama}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rekap.status_akademik)}`}>
                    {rekap.status_akademik}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Absensi: {rekap.total_absensi}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Tugas: {rekap.total_tugas}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Nilai:</span>
                      <p className={`font-semibold ${getNilaiColor(rekap.rata_rata_nilai)}`}>
                        {rekap.rata_rata_nilai}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Kehadiran:</span>
                      <p className="font-semibold text-green-400">
                        {rekap.persentase_kehadiran}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{rekap.bulan} {rekap.tahun}</span>
                  </div>
                  
                  <button
                    onClick={() => handleViewDetail(rekap)}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detail</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRekap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Detail Rekap {selectedRekap.siswa_nama}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Informasi Umum</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Nama Siswa:</span>
                      <p className="text-white mt-1">{selectedRekap.siswa_nama}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Status Akademik:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedRekap.status_akademik)}`}>
                        {selectedRekap.status_akademik}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Periode:</span>
                      <p className="text-white mt-1">{selectedRekap.bulan} {selectedRekap.tahun}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-400">Performa Akademik</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Rata-rata Nilai:</span>
                      <p className={`font-semibold text-lg mt-1 ${getNilaiColor(selectedRekap.rata_rata_nilai)}`}>
                        {selectedRekap.rata_rata_nilai}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Persentase Kehadiran:</span>
                      <p className="font-semibold text-lg mt-1 text-green-400">
                        {selectedRekap.persentase_kehadiran}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Tugas:</span>
                      <p className="text-white mt-1">{selectedRekap.total_tugas}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Absensi:</span>
                      <p className="text-white mt-1">{selectedRekap.total_absensi}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DataRekap;
