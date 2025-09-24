import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, Camera, User, UserCheck, Eye, Plus, Edit, Trash2, FileText, BarChart3, Target, Award } from 'lucide-react';

interface SiswaData {
  id: number;
  nama_siswa: string;
  institusi: string;
  total_tugas: number;
  tugas_selesai: number;
  total_nilai: number;
  rata_rata_nilai: number;
  total_attendance: number;
  present_days: number;
  absent_days: number;
}

interface RekapData {
  guru_id: number;
  nama_guru: string;
  siswa: SiswaData[];
}

const DataRekap: React.FC = () => {
  const [rekapData, setRekapData] = useState<RekapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
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

      console.log('Fetching rekap data from API...');
      
      const response = await fetch('http://localhost:3000/api/rekap', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('API Response Status:', response.status);
      
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
      console.log('API Response Data:', data);
      
      // Validate data structure
      const validatedData = validateRekapData(data);
      setRekapData(validatedData);
      console.log('Data successfully loaded:', validatedData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data rekap.';
      setError(errorMessage);
      console.error('Error fetching rekap data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false); // Ensure refreshing is false after fetch
    }
  };

  const validateRekapData = (data: any): RekapData[] => {
    if (!Array.isArray(data)) {
      throw new Error('Format data tidak valid. Data harus berupa array.');
    }
    
    return data.map((guru, index) => {
      // Validate guru object structure
      if (!guru.guru_id || typeof guru.guru_id !== 'number') {
        throw new Error(`Data guru ke-${index + 1}: guru_id tidak valid atau tidak ditemukan.`);
      }
      
      if (!guru.nama_guru || typeof guru.nama_guru !== 'string') {
        throw new Error(`Data guru ke-${index + 1}: nama_guru tidak valid atau tidak ditemukan.`);
      }
      
      if (!Array.isArray(guru.siswa)) {
        throw new Error(`Data guru ke-${index + 1}: siswa harus berupa array.`);
      }
      
      // Validate siswa array
      const validatedSiswa = guru.siswa.map((siswa: any, siswaIndex: number) => {
        const requiredFields = ['id', 'nama_siswa', 'institusi', 'total_tugas', 'tugas_selesai', 'total_nilai', 'rata_rata_nilai', 'total_attendance', 'present_days', 'absent_days'];
        const missingFields = requiredFields.filter(field => !(field in siswa));
        
        if (missingFields.length > 0) {
          throw new Error(`Data siswa ke-${siswaIndex + 1} pada guru ${guru.nama_guru}: field yang hilang: ${missingFields.join(', ')}`);
        }
        
        if (typeof siswa.id !== 'number' || typeof siswa.nama_siswa !== 'string' || 
            typeof siswa.institusi !== 'string' || typeof siswa.total_tugas !== 'number' || 
            typeof siswa.tugas_selesai !== 'number' || typeof siswa.total_nilai !== 'number' || 
            typeof siswa.rata_rata_nilai !== 'number' || typeof siswa.total_attendance !== 'number' || 
            typeof siswa.present_days !== 'number' || typeof siswa.absent_days !== 'number') {
          throw new Error(`Data siswa ke-${siswaIndex + 1} pada guru ${guru.nama_guru}: tipe data tidak valid.`);
        }
        
        return {
          id: siswa.id,
          nama_siswa: siswa.nama_siswa,
          institusi: siswa.institusi,
          total_tugas: siswa.total_tugas,
          tugas_selesai: siswa.tugas_selesai,
          total_nilai: siswa.total_nilai,
          rata_rata_nilai: siswa.rata_rata_nilai,
          total_attendance: siswa.total_attendance || 0,
          present_days: siswa.present_days || 0,
          absent_days: siswa.absent_days || 0
        };
      });
      
      return {
        guru_id: guru.guru_id,
        nama_guru: guru.nama_guru,
        siswa: validatedSiswa
      };
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    await fetchRekapData();
  };

  const toggleCardExpansion = (guruId: number) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(guruId)) {
      newExpandedCards.delete(guruId);
    } else {
      newExpandedCards.add(guruId);
    }
    setExpandedCards(newExpandedCards);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  const getGuruConfig = (guruName: string) => {
    const guruColors = {
      'Guru Satu': { bg: "bg-gradient-to-br from-blue-500 to-cyan-600", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Dua': { bg: "bg-gradient-to-br from-green-500 to-emerald-600", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Tiga': { bg: "bg-gradient-to-br from-purple-500 to-pink-600", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Empat': { bg: "bg-gradient-to-br from-yellow-500 to-orange-500", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Lima': { bg: "bg-gradient-to-br from-red-500 to-pink-600", icon: <UserCheck className="w-5 h-5" /> },
    };
    
    return guruColors[guruName as keyof typeof guruColors] || {
      bg: "bg-gradient-to-br from-gray-500 to-gray-600",
      icon: <UserCheck className="w-5 h-5" />
    };
  };

  const getProgressColor = (completed: number, total: number) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeColor = (average: number) => {
    if (average >= 85) return 'text-green-400';
    if (average >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">Memuat data rekap...</p>
                <p className="text-gray-500 text-sm mt-2">Mengambil data dari API</p>
              </div>
            </div>
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
                  onClick={fetchRekapData}
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

  // Calculate summary statistics
  const totalGuru = rekapData.length;
  const totalSiswa = rekapData.reduce((sum, guru) => sum + guru.siswa.length, 0);
  const totalTugas = rekapData.reduce((sum, guru) => 
    sum + guru.siswa.reduce((siswaSum, siswa) => siswaSum + siswa.total_tugas, 0), 0
  );
  const totalTugasSelesai = rekapData.reduce((sum, guru) => 
    sum + guru.siswa.reduce((siswaSum, siswa) => siswaSum + siswa.tugas_selesai, 0), 0
  );
  const totalNilai = rekapData.reduce((sum, guru) => 
    sum + guru.siswa.reduce((siswaSum, siswa) => siswaSum + siswa.total_nilai, 0), 0
  );
  const totalAbsensi = rekapData.reduce((sum, guru) => 
    sum + guru.siswa.reduce((siswaSum, siswa) => siswaSum + siswa.total_attendance, 0), 0
  );
  const totalHadir = rekapData.reduce((sum, guru) => 
    sum + guru.siswa.reduce((siswaSum, siswa) => siswaSum + siswa.present_days, 0), 0
  );
  const totalTidakHadir = rekapData.reduce((sum, guru) => 
    sum + guru.siswa.reduce((siswaSum, siswa) => siswaSum + siswa.absent_days, 0), 0
  );

  return (
    
      <div className="p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <span>Data Rekap</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Rekap data guru dan siswa dengan statistik tugas dan nilai.</p>
        <hr className="border-gray-700 my-4" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span className="text-white">Rekap Guru & Siswa</span>
          </h2>
        </div>

        {/* Guru Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rekapData.map((guru, index) => {
            const guruConfig = getGuruConfig(guru.nama_guru);
            const totalSiswaGuru = guru.siswa.length;
            const totalTugasGuru = guru.siswa.reduce((sum, siswa) => sum + siswa.total_tugas, 0);
            const totalTugasSelesaiGuru = guru.siswa.reduce((sum, siswa) => sum + siswa.tugas_selesai, 0);
            const totalNilaiGuru = guru.siswa.reduce((sum, siswa) => sum + siswa.total_nilai, 0);
            const rataRataNilaiGuru = totalSiswaGuru > 0 ? Math.round(totalNilaiGuru / totalSiswaGuru) : 0;
            const totalAbsensiGuru = guru.siswa.reduce((sum, siswa) => sum + siswa.total_attendance, 0);
            const totalHadirGuru = guru.siswa.reduce((sum, siswa) => sum + siswa.present_days, 0);
            const totalTidakHadirGuru = guru.siswa.reduce((sum, siswa) => sum + siswa.absent_days, 0);
            const isExpanded = expandedCards.has(guru.guru_id);

            return (
              <div 
                key={index} 
                className={`${guruConfig.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                onClick={() => toggleCardExpansion(guru.guru_id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg leading-tight pr-4">{guru.nama_guru}</h3>
                  <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {guruConfig.icon}
                    <span className="ml-1">Guru</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Guru Statistics - Always Visible */}
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>Siswa: {totalSiswaGuru}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Tugas: {totalTugasGuru}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Selesai: {totalTugasSelesaiGuru}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4" />
                        <span>Nilai: {rataRataNilaiGuru}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>Absensi: {totalAbsensiGuru}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Hadir: {totalHadirGuru}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar - Always Visible */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress Tugas</span>
                      <span className={getProgressColor(totalTugasSelesaiGuru, totalTugasGuru)}>
                        {totalTugasGuru > 0 ? Math.round((totalTugasSelesaiGuru / totalTugasGuru) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${totalTugasGuru > 0 ? (totalTugasSelesaiGuru / totalTugasGuru) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Siswa List - Only visible when expanded */}
                  {isExpanded && (
                    <div className="space-y-2 border-t border-white/20 pt-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Daftar Siswa:</span>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {guru.siswa.map((siswa, siswaIndex) => (
                          <div key={siswaIndex} className="mb-3 last:mb-0">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span className="font-medium">{siswa.nama_siswa}</span>
                              </div>
                              <span className="text-xs opacity-75">{siswa.institusi}</span>
                            </div>
                            
                            <div className="ml-4 space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Tugas: {siswa.total_tugas}</span>
                                <span>Selesai: {siswa.tugas_selesai}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Nilai: {siswa.total_nilai}</span>
                                <span className={getGradeColor(siswa.rata_rata_nilai)}>
                                  Rata-rata: {siswa.rata_rata_nilai}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Absensi: {siswa.total_attendance}</span>
                                <span>Hadir: {siswa.present_days}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tidak Hadir: {siswa.absent_days}</span>
                                <span className="text-orange-400">
                                  Kehadiran: {siswa.total_attendance > 0 ? Math.round((siswa.present_days / siswa.total_attendance) * 100) : 0}%
                                </span>
                              </div>
                              
                              {/* Individual Progress Bar */}
                              <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                                <div 
                                  className="bg-white h-1 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${siswa.total_tugas > 0 ? (siswa.tugas_selesai / siswa.total_tugas) * 100 : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Click indicator */}
                  <div className="text-center text-xs opacity-75">
                    {isExpanded ? 'Klik untuk sembunyikan detail' : 'Klik untuk lihat detail siswa'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {rekapData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak Ada Data Rekap</h3>
            <p className="text-gray-500">Belum ada data rekap yang tersedia saat ini.</p>
          </div>
        )}

        {/* Overall Statistics */}
        {rekapData.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Statistik Keseluruhan</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6" />
                  <span className="font-semibold">Progress Tugas</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {totalTugas > 0 ? Math.round((totalTugasSelesai / totalTugas) * 100) : 0}%
                </p>
                <p className="text-sm opacity-90 mt-1">
                  {totalTugasSelesai} dari {totalTugas} tugas selesai
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <Award className="w-6 h-6" />
                  <span className="font-semibold">Nilai Rata-rata</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {totalSiswa > 0 ? Math.round(totalNilai / totalSiswa) : 0}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  dari {totalSiswa} siswa
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6" />
                  <span className="font-semibold">Kehadiran</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0}%
                </p>
                <p className="text-sm opacity-90 mt-1">
                  {totalHadir} dari {totalAbsensi} hari
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6" />
                  <span className="font-semibold">Rasio Siswa/Guru</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {totalGuru > 0 ? (totalSiswa / totalGuru).toFixed(1) : '0'}
                </p>
                <p className="text-sm opacity-90 mt-1">
                  siswa per guru
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default DataRekap;
