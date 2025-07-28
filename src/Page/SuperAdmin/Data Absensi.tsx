import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, Camera, User, Filter, Map } from 'lucide-react';

interface Attendance {
  nama_siswa: string;
  tanggal_absensi: string;
  foto_in: string;
  waktu_checkin: string;
  telat: string;
  lokasi_in: string;
  foto_out: string;
  waktu_checkout: string;
  lokasi_out: string;
}

const DataAbsensi: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showDateModal, setShowDateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      setError('Anda harus login terlebih dahulu.');
      setLoading(false);
      return;
    }

    if (role !== 'superadmin') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchAttendances();
  }, []);

  useEffect(() => {
    // Filter attendances based on selected date
    if (selectedDate === '') {
      setFilteredAttendances(attendances);
    } else {
      const filtered = attendances.filter(attendance => {
        const attendanceDate = new Date(attendance.tanggal_absensi);
        const selectedDateObj = new Date(selectedDate);
        
        return attendanceDate.getFullYear() === selectedDateObj.getFullYear() &&
               attendanceDate.getMonth() === selectedDateObj.getMonth() &&
               attendanceDate.getDate() === selectedDateObj.getDate();
      });
      setFilteredAttendances(filtered);
    }
  }, [selectedDate, attendances]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/absensi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk mengakses data ini.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAttendances(data);
      setFilteredAttendances(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data absensi.';
      setError(errorMessage);
      console.error('Error fetching attendances:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  const handleViewMaps = (location: string, studentName: string) => {
    const [lat, lng] = location.split(', ');
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(mapsUrl, '_blank');
  };

  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return 'Semua Tanggal';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusConfig = (telat: string) => {
    if (telat === 'Tepat waktu' || telat === '0 menit') {
      return {
        bg: "bg-gradient-to-br from-green-500 to-emerald-600",
        icon: <CheckCircle className="w-5 h-5" />,
        text: "Tepat Waktu"
      };
    } else {
      return {
        bg: "bg-gradient-to-br from-yellow-500 to-orange-500",
        icon: <AlertCircle className="w-5 h-5" />,
        text: `Telat ${telat}`
      };
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds, keep HH:MM format
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseLocation = (location: string) => {
    const [lat, lng] = location.split(', ');
    return { latitude: lat, longitude: lng };
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
            <div className="flex space-x-3">
              {error.includes('login') || error.includes('sesi') ? (
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  <i className="fa fa-sign-in mr-2"></i>
                  Login Ulang
                </button>
              ) : (
                <button
                  onClick={fetchAttendances}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  <i className="fa fa-refresh mr-2"></i>
                  Coba Lagi
                </button>
              )}
            </div>
            <div className="mt-4 text-gray-400 text-sm">
              <p><strong>Solusi yang mungkin:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Pastikan Anda sudah login dengan akun Super Admin</li>
                <li>Periksa apakah server API berjalan di localhost:3000</li>
                <li>Pastikan token autentikasi masih valid</li>
                <li>Hubungi administrator jika masalah berlanjut</li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <span>Data Absensi</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Pantau dan kelola data kehadiran siswa.</p>
        <hr className="border-gray-700 my-4" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-white">Daftar Absensi</span>
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <Filter className="w-4 h-4 mr-2" />
              {formatSelectedDate(selectedDate)}
            </button>
            <button
              onClick={fetchAttendances}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <i className="fa fa-refresh mr-2"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Attendances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttendances.map((attendance, index) => {
            const statusConfig = getStatusConfig(attendance.telat);
            const locationIn = parseLocation(attendance.lokasi_in);
            const locationOut = parseLocation(attendance.lokasi_out);
            return (
              <div key={index} className={`${statusConfig.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg leading-tight pr-4">{attendance.nama_siswa}</h3>
                  <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {statusConfig.icon}
                    <span className="ml-1">{statusConfig.text}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(attendance.tanggal_absensi)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Check-in: {formatTime(attendance.waktu_checkin)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Check-out: {formatTime(attendance.waktu_checkout)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Camera className="w-4 h-4" />
                      <span>Foto In: {attendance.foto_in}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Camera className="w-4 h-4" />
                      <span>Foto Out: {attendance.foto_out}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Lokasi In: {locationIn.latitude}, {locationIn.longitude}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Lokasi Out: {locationOut.latitude}, {locationOut.longitude}</span>
                    </div>
                  </div>

                  {/* View Maps Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleViewMaps(attendance.lokasi_in, `${attendance.nama_siswa} - Check-in`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center transition-colors"
                    >
                      <Map className="w-4 h-4 mr-1" />
                      View Check-in
                    </button>
                    <button
                      onClick={() => handleViewMaps(attendance.lokasi_out, `${attendance.nama_siswa} - Check-out`)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center transition-colors"
                    >
                      <Map className="w-4 h-4 mr-1" />
                      View Check-out
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAttendances.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {selectedDate ? `Tidak Ada Data Absensi untuk ${formatSelectedDate(selectedDate)}` : 'Tidak Ada Data Absensi'}
            </h3>
            <p className="text-gray-500">
              {selectedDate ? `Belum ada data absensi untuk tanggal ${formatSelectedDate(selectedDate)} saat ini.` : 'Belum ada data absensi yang tersedia saat ini.'}
            </p>
          </div>
        )}

        {/* Date Selection Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Pilih Tanggal</h3>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pilih Tanggal
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedDate('');
                      setShowDateModal(false);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Semua Tanggal
                  </button>
                  <button
                    onClick={() => setShowDateModal(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DataAbsensi;
