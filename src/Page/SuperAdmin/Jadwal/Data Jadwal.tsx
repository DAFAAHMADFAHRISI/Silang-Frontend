import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';

interface Schedule {
  id: number;
  hari: string;
  jam_masuk: string;
  jam_keluar: string;
  location: string;
  radius_meter: number;
  created_at: string;
  updated_at: string;
}

const DataJadwal: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/jadwal', {
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
      setSchedules(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data jadwal.';
      setError(errorMessage);
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Inline add/edit functionality removed in favor of dedicated pages

  const handleDeleteSchedule = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(`http://localhost:3000/api/jadwal/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }

      setSchedules(schedules.filter(schedule => schedule.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus jadwal.';
      setError(errorMessage);
      console.error('Error deleting schedule:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  const getDayConfig = (hari: string) => {
    const dayColors = {
      'Senin': { bg: "bg-gradient-to-br from-blue-500 to-cyan-600", icon: <Calendar className="w-5 h-5" /> },
      'Selasa': { bg: "bg-gradient-to-br from-green-500 to-emerald-600", icon: <Calendar className="w-5 h-5" /> },
      'Rabu': { bg: "bg-gradient-to-br from-yellow-500 to-orange-500", icon: <Calendar className="w-5 h-5" /> },
      'Kamis': { bg: "bg-gradient-to-br from-purple-500 to-pink-600", icon: <Calendar className="w-5 h-5" /> },
      'Jumat': { bg: "bg-gradient-to-br from-red-500 to-pink-600", icon: <Calendar className="w-5 h-5" /> },
      'Sabtu': { bg: "bg-gradient-to-br from-indigo-500 to-purple-600", icon: <Calendar className="w-5 h-5" /> },
      'Minggu': { bg: "bg-gradient-to-br from-gray-500 to-gray-600", icon: <Calendar className="w-5 h-5" /> },
    };
    
    return dayColors[hari as keyof typeof dayColors] || {
      bg: "bg-gradient-to-br from-gray-500 to-gray-600",
      icon: <Calendar className="w-5 h-5" />
    };
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds, keep HH:MM format
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parseLocation = (location: string) => {
    const [lat, lng] = location.split(', ');
    return { latitude: lat, longitude: lng };
  };

  if (loading) {
    return (
      
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      
    );
  }

  if (error) {
    return (
      
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
                  onClick={fetchSchedules}
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
      
    );
  }

  return (
    
      <div className="p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <span>Data Jadwal</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Kelola dan pantau jadwal kehadiran siswa.</p>
        <hr className="border-gray-700 my-4" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span className="text-white">Daftar Jadwal</span>
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/DataJadwal/tambah')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Jadwal
            </button>
          </div>
        </div>

        {/* Schedules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => {
            const dayConfig = getDayConfig(schedule.hari);
            const location = parseLocation(schedule.location);
            return (
              <div key={schedule.id} className={`${dayConfig.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg leading-tight pr-4">{schedule.hari}</h3>
                  <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {dayConfig.icon}
                    <span className="ml-1">Jadwal</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Masuk: {formatTime(schedule.jam_masuk)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Keluar: {formatTime(schedule.jam_keluar)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Lat: {location.latitude}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Lng: {location.longitude}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Radius: {schedule.radius_meter}m</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {formatDate(schedule.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Updated: {formatDate(schedule.updated_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-2">
                  <button 
                    onClick={() => navigate(`/DataJadwal/edit/${schedule.id}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {schedules.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak Ada Jadwal</h3>
            <p className="text-gray-500">Belum ada jadwal yang tersedia saat ini.</p>
          </div>
        )}

        {/* Inline modals removed; using dedicated routes for add/edit */}
      </div>
    
  );
};

export default DataJadwal;
