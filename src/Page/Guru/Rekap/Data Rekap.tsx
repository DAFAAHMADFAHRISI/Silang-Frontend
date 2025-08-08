import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Search, Eye, FileText, Clock, Building } from 'lucide-react';

// Define interfaces based on the actual API response structure from the image
interface RekapData {
  siswa_id: number;
  nama: string;
  institusi: string;
  total_tugas: number;
  tugas_selesai: number;
  total_nilai: number;
  rata_nilai: number;
}

const DataRekap: React.FC = () => {
  const [rekapData, setRekapData] = useState<RekapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      
      // Using the correct API endpoint as shown in the image
      const response = await fetch('http://localhost:3000/api/rekap-guru', {
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
      console.log('Debug - API Response data:', data);
      
      // Ensure data is an array
      const processedData = Array.isArray(data) ? data : [data];
      setRekapData(processedData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data rekap.';
      setError(errorMessage);
      console.error('Error fetching rekap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (rekap: RekapData) => {
    navigate(`/guru/rekap/detail/${rekap.siswa_id}`);
  };

  const getStatusColor = (rataNilai: number) => {
    if (rataNilai >= 85) return 'bg-green-500 text-white';
    if (rataNilai >= 70) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getStatusText = (rataNilai: number) => {
    if (rataNilai >= 85) return 'Baik';
    if (rataNilai >= 70) return 'Cukup';
    return 'Perlu Perhatian';
  };

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 85) return 'text-green-400';
    if (nilai >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const filteredRekapData = rekapData.filter(rekap =>
    rekap.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rekap.institusi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStatusText(rekap.rata_nilai).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalSiswa = rekapData.length;
  const rataRataNilai = rekapData.length > 0 ? 
    rekapData.reduce((sum, item) => sum + item.rata_nilai, 0) / rekapData.length : 0;
  const totalTugas = rekapData.reduce((sum, item) => sum + item.total_tugas, 0);
  const totalTugasSelesai = rekapData.reduce((sum, item) => sum + item.tugas_selesai, 0);

  if (loading) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data rekap...</p>
          </div>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
              <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
              <div className="bg-gray-800 p-4 rounded-lg mb-4 text-left">
                <p className="text-gray-300 text-sm mb-2">Debug Info:</p>
                <p className="text-gray-400 text-xs">Token: {localStorage.getItem('token') ? 'Ada' : 'Tidak ada'}</p>
                <p className="text-gray-400 text-xs">Role: {localStorage.getItem('role') || 'Tidak ada'}</p>
                <p className="text-gray-400 text-xs">Nama: {localStorage.getItem('nama') || 'Tidak ada'}</p>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={fetchRekapData} 
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Coba Lagi
                </button>
                <button 
                  onClick={() => navigate('/Login')} 
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors font-semibold ml-2"
                >
                  Login Ulang
                </button>
              </div>
            </div>
          </div>
        </div>
      
    );
  }

  return (
    
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
          <p className="text-gray-400 mt-2 ml-5">Rekap data akademik dan performa siswa.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Siswa</p>
                <p className="text-2xl font-bold">{totalSiswa}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Rata-rata Nilai</p>
                <p className={`text-2xl font-bold ${getNilaiColor(rataRataNilai)}`}>
                  {rataRataNilai.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Total Tugas</p>
                <p className="text-2xl font-bold">{totalTugas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center">
              <PieChart className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <p className="text-gray-400 text-sm">Tugas Selesai</p>
                <p className="text-2xl font-bold text-green-400">{totalTugasSelesai}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama siswa, institusi, atau status..."
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
                  <h3 className="text-xl font-semibold">{rekap.nama}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(rekap.rata_nilai)}`}>
                    {getStatusText(rekap.rata_nilai)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{rekap.institusi}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>Total: {rekap.total_tugas}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">Selesai:</span>
                      <span className="text-green-400">{rekap.tugas_selesai}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Total Nilai:</span>
                      <p className="font-semibold text-white">{rekap.total_nilai}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Rata-rata:</span>
                      <p className={`font-semibold ${getNilaiColor(rekap.rata_nilai)}`}>
                        {rekap.rata_nilai}
                      </p>
                    </div>
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
      </div>
    
  );
};

export default DataRekap;
