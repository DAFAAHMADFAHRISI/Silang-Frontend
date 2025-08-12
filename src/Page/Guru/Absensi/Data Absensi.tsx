import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { User, Clock, MapPin, Image, Calendar, Search, Eye, Filter, RefreshCw } from 'lucide-react';

// Define interfaces based on the API response structure from the image
interface AbsensiEntry {
  id: number;
  waktu_checkin: string;
  waktu_checkout: string;
  checkin_face: string;
  checkout_face: string;
  checkin_location: string;
  checkout_location: string;
  created_at: string;
  telat: string;
  jadwal_masuk: string;
  jadwal_keluar: string;
}

interface SiswaAbsensi {
  siswa_id: number;
  siswa_nama: string;
  absensi: AbsensiEntry[];
}

const DataAbsensi: React.FC = () => {
  const [absensiData, setAbsensiData] = useState<SiswaAbsensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchAbsensiData();
  }, []);

  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      console.log('Debug - Token:', token);
      console.log('Debug - Role:', role);
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/api/absensi-guru', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Debug - Response status:', response.status);
      console.log('Debug - Response ok:', response.ok);
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk mengakses data ini.');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Debug - Error response:', errorText);
        throw new Error(`Error server: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Debug - API Response data:', data);
      
      // Ensure data is an array
      const processedData = Array.isArray(data) ? data : [data];
      setAbsensiData(processedData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data absensi.';
      setError(errorMessage);
      console.error('Error fetching absensi data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (siswa: SiswaAbsensi, absensi: AbsensiEntry) => {
    navigate(`/guru/absensi/detail/${absensi.id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (telat: string) => {
    if (telat.includes('Telat')) {
      return 'bg-red-500 text-white';
    } else if (telat === '0 menit' || telat === 'Tepat Waktu') {
      return 'bg-green-500 text-white';
    } else {
      return 'bg-yellow-500 text-white';
    }
  };

  const getStatusText = (telat: string) => {
    if (telat.includes('Telat')) {
      return telat;
    } else if (telat === '0 menit') {
      return 'Tepat Waktu';
    } else {
      return 'Tepat Waktu';
    }
  };

  const filteredAbsensiData = absensiData.filter(siswa => {
    const matchesSearch = siswa.siswa_nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      siswa.absensi.some(entry =>
        entry.telat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.waktu_checkin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.waktu_checkout.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Filter berdasarkan tanggal yang dipilih
    const matchesDate = siswa.absensi.some(absensi => {
      const absensiDate = new Date(absensi.waktu_checkin).toISOString().split('T')[0];
      return absensiDate === selectedDate;
    });
    
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data absensi...</p>
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
                  onClick={fetchAbsensiData} 
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
                Data Absensi
              </h1>
            </div>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Kelola data absensi siswa dan monitoring kehadiran.</p>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama siswa atau status absensi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors font-semibold flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filter Tanggal</span>
            </button>
            
            {showDateFilter && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setShowDateFilter(false);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  Hari Ini
                </button>
                <button
                  onClick={() => setShowDateFilter(false)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>

          {/* Selected Date Display */}
          {showDateFilter && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">
                  Menampilkan absensi untuk tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Absensi List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAbsensiData.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-6">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-3">
                {searchTerm || showDateFilter ? 'Tidak Ada Hasil Pencarian' : 'Belum Ada Data Absensi'}
              </h3>
              <p className="text-gray-400 text-center mb-6 max-w-md leading-relaxed">
                {searchTerm 
                  ? `Tidak ditemukan siswa dengan nama "${searchTerm}" untuk tanggal yang dipilih.`
                  : showDateFilter
                  ? `Tidak ada data absensi untuk tanggal ${new Date(selectedDate).toLocaleDateString('id-ID')}.`
                  : 'Data absensi siswa akan muncul di sini setelah siswa melakukan check-in dan check-out.'
                }
              </p>
              {(searchTerm || showDateFilter) && (
                <div className="space-x-2">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Hapus Pencarian
                    </button>
                  )}
                  {showDateFilter && (
                    <button
                      onClick={() => {
                        setSelectedDate(new Date().toISOString().split('T')[0]);
                        setShowDateFilter(false);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            filteredAbsensiData.map((siswa) => (
              <div key={siswa.siswa_id} className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-blue-400 mr-3" />
                  <h3 className="text-xl font-semibold">{siswa.siswa_nama}</h3>
                </div>
                <p className="text-gray-400 mb-4">Total Absensi: {siswa.absensi.length}</p>

                <div className="space-y-4 max-h-60 overflow-y-auto scrollbar-hide">
                  {siswa.absensi.length === 0 ? (
                    <p className="text-gray-500 text-sm">Belum ada catatan absensi.</p>
                  ) : (
                    siswa.absensi.map((entry) => (
                      <div key={entry.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" /> {formatDate(entry.waktu_checkin).split(' ')[0]}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entry.telat)}`}>
                            {getStatusText(entry.telat)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">
                          <Clock className="inline-block w-4 h-4 mr-1" /> Check-in: {formatTime(entry.waktu_checkin)}
                        </p>
                        <p className="text-gray-300 text-sm mb-3">
                          <Clock className="inline-block w-4 h-4 mr-1" /> Check-out: {formatTime(entry.waktu_checkout)}
                        </p>
                        <button
                          onClick={() => handleViewDetail(siswa, entry)}
                          className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detail</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    
  );
};

export default DataAbsensi;
