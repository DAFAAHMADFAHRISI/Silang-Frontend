import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, Camera, User, UserCheck, Eye, Plus, Edit, Trash2 } from 'lucide-react';

interface MentorSiswa {
  id: number;
  nama_mentor: string;
  nama_siswa: string;
}

interface MentorSiswaDetail {
  id: number;
  nama_mentor: string;
  nama_siswa: string;
}

const DataMentorSiswa: React.FC = () => {
  const [mentorSiswaData, setMentorSiswaData] = useState<MentorSiswa[]>([]);
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

    fetchMentorSiswaData();
  }, []);

  const fetchMentorSiswaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/mentor-siswa', {
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
      setMentorSiswaData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data mentor-siswa.';
      setError(errorMessage);
      console.error('Error fetching mentor-siswa data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (id: number) => {
    navigate(`/DataMentorSiswa/detail/${id}`);
  };

  const handleDeleteMentorSiswa = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(`http://localhost:3000/api/mentor-siswa/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk mengakses data ini.');
      }
      
      if (response.status === 404) {
        throw new Error('Data tidak ditemukan.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data berhasil dihapus:', data);
      
      // Refresh data
      await fetchMentorSiswaData();
      
      alert('Data mentor-siswa berhasil dihapus!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data mentor-siswa.';
      alert(errorMessage);
      console.error('Error deleting mentor-siswa:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  // Group data by mentor
  const groupByMentor = () => {
    const grouped: { [key: string]: MentorSiswa[] } = {};
    mentorSiswaData.forEach(item => {
      if (!grouped[item.nama_mentor]) {
        grouped[item.nama_mentor] = [];
      }
      grouped[item.nama_mentor].push(item);
    });
    return grouped;
  };

  const getMentorConfig = (mentorName: string) => {
    const mentorColors = {
      'Mentor Satu': { bg: "bg-gradient-to-br from-blue-500 to-cyan-600", icon: <UserCheck className="w-5 h-5" /> },
      'Mentor Dua': { bg: "bg-gradient-to-br from-green-500 to-emerald-600", icon: <UserCheck className="w-5 h-5" /> },
      'Mentor Tiga': { bg: "bg-gradient-to-br from-purple-500 to-pink-600", icon: <UserCheck className="w-5 h-5" /> },
      'Mentor Empat': { bg: "bg-gradient-to-br from-yellow-500 to-orange-500", icon: <UserCheck className="w-5 h-5" /> },
      'Mentor Lima': { bg: "bg-gradient-to-br from-red-500 to-pink-600", icon: <UserCheck className="w-5 h-5" /> },
    };
    
    return mentorColors[mentorName as keyof typeof mentorColors] || {
      bg: "bg-gradient-to-br from-gray-500 to-gray-600",
      icon: <UserCheck className="w-5 h-5" />
    };
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
                  onClick={fetchMentorSiswaData}
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

  const groupedData = groupByMentor();

  return (
    
      <div className="p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <span>Data Mentor - Siswa</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Kelola dan pantau hubungan mentor dengan siswa.</p>
        <hr className="border-gray-700 my-4" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-white">Daftar Mentor & Siswa</span>
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/DataMentorSiswa/tambah')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </button>
          </div>
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedData).map(([mentorName, students]) => {
            const mentorConfig = getMentorConfig(mentorName);
            return (
              <div key={mentorName} className={`${mentorConfig.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg leading-tight pr-4">{mentorName}</h3>
                  <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {mentorConfig.icon}
                    <span className="ml-1">Mentor</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <UserCheck className="w-4 h-4" />
                        <span>Jumlah Siswa: {students.length}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>Status: Aktif</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Daftar Siswa:</span>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      {students.map((student, index) => (
                        <div key={index} className="flex items-center justify-between text-sm mb-2 last:mb-0">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>{student.nama_siswa}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleViewDetail(student.id)}
                              className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat</span>
                            </button>
                            <button
                              onClick={() => navigate(`/DataMentorSiswa/edit/${student.id}`)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteMentorSiswa(student.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {mentorSiswaData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak Ada Data Mentor-Siswa</h3>
            <p className="text-gray-500">Belum ada data hubungan mentor-siswa yang tersedia saat ini.</p>
          </div>
        )}

        {/* Summary Section */}
        {mentorSiswaData.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Ringkasan</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-6 h-6" />
                  <span className="font-semibold">Total Mentor</span>
                </div>
                <p className="text-2xl font-bold mt-2">{Object.keys(groupedData).length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6" />
                  <span className="font-semibold">Total Siswa</span>
                </div>
                <p className="text-2xl font-bold mt-2">{mentorSiswaData.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6" />
                  <span className="font-semibold">Rata-rata Siswa/Mentor</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {Object.keys(groupedData).length > 0 
                    ? (mentorSiswaData.length / Object.keys(groupedData).length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    
  );
};

export default DataMentorSiswa;
