import React, { useState, useEffect } from "react";

import { Calendar, Clock, User, CheckCircle, XCircle, Search, Filter, RefreshCw, Eye } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface AbsensiRecord {
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
  absensi: AbsensiRecord[];
}

const DataAbsensiMentor: React.FC = () => {
  const [absensiData, setAbsensiData] = useState<SiswaAbsensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const navigate = useNavigate();

  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/API/absensi-mentor', {
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
      
      const data: SiswaAbsensi[] = await response.json();
      console.log('Debug - Absensi API Response:', data);
      
      setAbsensiData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data absensi.';
      setError(errorMessage);
      console.error('Error fetching absensi data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'mentor') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchAbsensiData();
  }, []);

  const filteredAbsensi = absensiData.filter(siswa => {
    const matchesSearch = siswa.siswa_nama.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter berdasarkan tanggal yang dipilih
    const matchesDate = siswa.absensi.some(absensi => {
      const absensiDate = new Date(absensi.waktu_checkin).toISOString().split('T')[0];
      return absensiDate === selectedDate;
    });
    
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-400 text-sm">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-8 h-8 text-red-500 mx-auto mb-3">⚠️</div>
            <p className="text-red-400 mb-3 text-base font-semibold">Error: {error}</p>
            <div className="space-y-2">
              <button 
                onClick={fetchAbsensiData} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
              >
                Coba Lagi
              </button>
              <button 
                onClick={() => navigate('/Login')} 
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors font-semibold ml-2 text-sm"
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Data Absensi
            </h1>
          </div>
        </div>
        <p className="text-gray-400 mt-2 ml-4 text-sm">Kelola data absensi siswa dan monitoring kehadiran.</p>
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

      {/* Absensi Data Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAbsensi.length === 0 ? (
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
            filteredAbsensi.map((siswaAbsensi) => (
              <div key={siswaAbsensi.siswa_id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                {/* Student Info */}
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <h3 className="text-white font-semibold text-sm truncate">{siswaAbsensi.siswa_nama}</h3>
                </div>
                <p className="text-gray-400 text-xs mb-4">Total Absensi: {siswaAbsensi.absensi.length}</p>
                
                {/* Attendance Record */}
                {siswaAbsensi.absensi.length > 0 ? (
                  <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span className="text-white font-medium text-sm">
                          {new Date(siswaAbsensi.absensi[0].waktu_checkin).getDate()}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        siswaAbsensi.absensi[0].telat.includes('Telat') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {siswaAbsensi.absensi[0].telat}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-xs">Check-in:</span>
                        <span className="text-white text-xs font-medium">
                          {new Date(siswaAbsensi.absensi[0].waktu_checkin).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-xs">Check-out:</span>
                        <span className="text-white text-xs font-medium">
                          {new Date(siswaAbsensi.absensi[0].waktu_checkout).toLocaleTimeString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-700 rounded-lg p-3 mb-4">
                    <p className="text-gray-400 text-xs text-center">Belum ada data absensi</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DataAbsensiMentor;
