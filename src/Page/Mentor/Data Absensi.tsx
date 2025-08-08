import React, { useState, useEffect } from "react";

import { Calendar, Clock, User, CheckCircle, XCircle, Search, Filter, RefreshCw } from "lucide-react";
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
  const navigate = useNavigate();

  const fetchAbsensiData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/api/absensi-mentor', {
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
    return siswa.siswa_nama.toLowerCase().includes(searchTerm.toLowerCase());
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
                Data Absensi Mentor
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchAbsensiData}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Pantau dan kelola data absensi siswa yang terhubung.</p>
        </div>

        <div className="border-t border-gray-700/50 my-8 w-full" />

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari siswa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Absensi Data */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span>Data Absensi Siswa ({filteredAbsensi.length})</span>
          </h2>
          
          {filteredAbsensi.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Tidak ada data absensi ditemukan.</p>
              <p className="text-gray-500 text-sm">Coba refresh data.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAbsensi.map((siswaAbsensi) => (
                <div key={siswaAbsensi.siswa_id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {siswaAbsensi.siswa_nama.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{siswaAbsensi.siswa_nama}</h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">Total Record: {siswaAbsensi.absensi.length}</span>
                    </div>
                  </div>
                  
                  {siswaAbsensi.absensi.length > 0 ? (
                    <div className="space-y-3">
                      {siswaAbsensi.absensi.slice(0, 3).map((absensi) => (
                        <div key={absensi.id} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">
                              {new Date(absensi.waktu_checkin).toLocaleDateString('id-ID')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              absensi.telat.includes('Telat') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                              {absensi.telat}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Check-in: </span>
                              <span className="text-white">{new Date(absensi.waktu_checkin).toLocaleTimeString('id-ID')}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Check-out: </span>
                              <span className="text-white">{new Date(absensi.waktu_checkout).toLocaleTimeString('id-ID')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-400">Belum ada data absensi</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default DataAbsensiMentor;
