import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Camera, 
  User, 
  UserCheck, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  BarChart3, 
  Target, 
  Award,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Activity,
  Percent,
  Star,
  TrendingDown,
  RefreshCw
} from 'lucide-react';

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

const DetailRekap: React.FC = () => {
  const [rekapData, setRekapData] = useState<RekapData[]>([]);
  const [selectedGuru, setSelectedGuru] = useState<RekapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

    // Get guru_id from URL params or location state
    const urlParams = new URLSearchParams(location.search);
    const guruId = urlParams.get('guru_id') || location.state?.guruId;
    
    if (guruId) {
      fetchRekapData(parseInt(guruId));
    } else {
      setError('ID Guru tidak ditemukan.');
      setLoading(false);
    }
  }, [location]);

  const fetchRekapData = async (guruId?: number) => {
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
      
      const validatedData = validateRekapData(data);
      setRekapData(validatedData);
      
      // Find and set selected guru
      if (guruId) {
        const guru = validatedData.find(g => g.guru_id === guruId);
        if (guru) {
          setSelectedGuru(guru);
        } else {
          setError('Data guru tidak ditemukan.');
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data rekap.';
      setError(errorMessage);
      console.error('Error fetching rekap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateRekapData = (data: any): RekapData[] => {
    if (!Array.isArray(data)) {
      throw new Error('Format data tidak valid. Data harus berupa array.');
    }
    
    return data.map((guru, index) => {
      if (!guru.guru_id || typeof guru.guru_id !== 'number') {
        throw new Error(`Data guru ke-${index + 1}: guru_id tidak valid atau tidak ditemukan.`);
      }
      
      if (!guru.nama_guru || typeof guru.nama_guru !== 'string') {
        throw new Error(`Data guru ke-${index + 1}: nama_guru tidak valid atau tidak ditemukan.`);
      }
      
      if (!Array.isArray(guru.siswa)) {
        throw new Error(`Data guru ke-${index + 1}: siswa harus berupa array.`);
      }
      
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

  const handleBack = () => {
    navigate('/DataRekap');
  };

  const getGuruConfig = (guruName: string) => {
    const guruColors = {
      'Guru Satu': { bg: "bg-gradient-to-br from-blue-500 to-cyan-600", icon: <UserCheck className="w-6 h-6" /> },
      'Guru Dua': { bg: "bg-gradient-to-br from-green-500 to-emerald-600", icon: <UserCheck className="w-6 h-6" /> },
      'Guru Tiga': { bg: "bg-gradient-to-br from-purple-500 to-pink-600", icon: <UserCheck className="w-6 h-6" /> },
      'Guru Empat': { bg: "bg-gradient-to-br from-yellow-500 to-orange-500", icon: <UserCheck className="w-6 h-6" /> },
      'Guru Lima': { bg: "bg-gradient-to-br from-red-500 to-pink-600", icon: <UserCheck className="w-6 h-6" /> },
    };
    
    return guruColors[guruName as keyof typeof guruColors] || {
      bg: "bg-gradient-to-br from-gray-500 to-gray-600",
      icon: <UserCheck className="w-6 h-6" />
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

  const getAttendanceColor = (present: number, total: number) => {
    const percentage = total > 0 ? (present / total) * 100 : 0;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Memuat detail rekap...</p>
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
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Kembali
            </button>
            <button
              onClick={() => fetchRekapData()}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedGuru) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Data Guru Tidak Ditemukan</h3>
            <p className="text-gray-500 mb-4">Guru yang diminta tidak ditemukan dalam data rekap.</p>
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Kembali ke Data Rekap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const guruConfig = getGuruConfig(selectedGuru.nama_guru);
  const totalSiswa = selectedGuru.siswa.length;
  const totalTugas = selectedGuru.siswa.reduce((sum, siswa) => sum + siswa.total_tugas, 0);
  const totalTugasSelesai = selectedGuru.siswa.reduce((sum, siswa) => sum + siswa.tugas_selesai, 0);
  const totalNilai = selectedGuru.siswa.reduce((sum, siswa) => sum + siswa.total_nilai, 0);
  const rataRataNilai = totalSiswa > 0 ? Math.round(totalNilai / totalSiswa) : 0;
  const totalAbsensi = selectedGuru.siswa.reduce((sum, siswa) => sum + siswa.total_attendance, 0);
  const totalHadir = selectedGuru.siswa.reduce((sum, siswa) => sum + siswa.present_days, 0);
  const totalTidakHadir = selectedGuru.siswa.reduce((sum, siswa) => sum + siswa.absent_days, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <span>Detail Rekap Guru</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Detail lengkap data guru dan siswa dengan statistik tugas dan nilai.</p>
        <hr className="border-gray-700 my-4" />
      </div>

      {/* Guru Profile Card */}
      <div className={`${guruConfig.bg} rounded-xl p-8 text-white shadow-lg mb-8`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {guruConfig.icon}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{selectedGuru.nama_guru}</h2>
              <p className="text-white/80 text-lg">Guru Pembimbing</p>
            </div>
          </div>
          <div className="text-right">
          </div>
        </div>

        {/* Guru Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Total Siswa</span>
            </div>
            <p className="text-2xl font-bold">{totalSiswa}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Total Tugas</span>
            </div>
            <p className="text-2xl font-bold">{totalTugas}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Tugas Selesai</span>
            </div>
            <p className="text-2xl font-bold">{totalTugasSelesai}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Nilai Rata-rata</span>
            </div>
            <p className="text-2xl font-bold">{rataRataNilai}</p>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress Tugas</span>
              <span className={getProgressColor(totalTugasSelesai, totalTugas)}>
                {totalTugas > 0 ? Math.round((totalTugasSelesai / totalTugas) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalTugas > 0 ? (totalTugasSelesai / totalTugas) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Kehadiran</span>
              <span className={getAttendanceColor(totalHadir, totalAbsensi)}>
                {totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${totalAbsensi > 0 ? (totalHadir / totalAbsensi) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <GraduationCap className="w-6 h-6 text-blue-400" />
          <span>Daftar Siswa ({totalSiswa})</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedGuru.siswa.map((siswa, index) => (
            <div key={siswa.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{siswa.nama_siswa}</h4>
                    <p className="text-gray-400 text-sm">{siswa.institusi}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getGradeColor(siswa.rata_rata_nilai)}`}>
                    {siswa.rata_rata_nilai}
                  </div>
                  <p className="text-xs text-gray-400">Rata-rata</p>
                </div>
              </div>

              {/* Student Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Tugas</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-semibold">{siswa.tugas_selesai}/{siswa.total_tugas}</span>
                    <span className={getProgressColor(siswa.tugas_selesai, siswa.total_tugas)}>
                      {siswa.total_tugas > 0 ? Math.round((siswa.tugas_selesai / siswa.total_tugas) * 100) : 0}%
                    </span>
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">Kehadiran</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white font-semibold">{siswa.present_days}/{siswa.total_attendance}</span>
                    <span className={getAttendanceColor(siswa.present_days, siswa.total_attendance)}>
                      {siswa.total_attendance > 0 ? Math.round((siswa.present_days / siswa.total_attendance) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress Tugas</span>
                    <span>{siswa.total_tugas > 0 ? Math.round((siswa.tugas_selesai / siswa.total_tugas) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${siswa.total_tugas > 0 ? (siswa.tugas_selesai / siswa.total_tugas) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Kehadiran</span>
                    <span>{siswa.total_attendance > 0 ? Math.round((siswa.present_days / siswa.total_attendance) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${siswa.total_attendance > 0 ? (siswa.present_days / siswa.total_attendance) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Total Nilai:</span>
                    <span className="text-white">{siswa.total_nilai}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tidak Hadir:</span>
                    <span className="text-red-400">{siswa.absent_days}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>Ringkasan Statistik</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="font-semibold">Progress Tugas</span>
            </div>
            <p className="text-2xl font-bold">
              {totalTugas > 0 ? Math.round((totalTugasSelesai / totalTugas) * 100) : 0}%
            </p>
            <p className="text-sm opacity-90">
              {totalTugasSelesai} dari {totalTugas} tugas
            </p>
          </div>
          
          
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-semibold">Kehadiran</span>
            </div>
            <p className="text-2xl font-bold">
              {totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0}%
            </p>
            <p className="text-sm opacity-90">
              {totalHadir} dari {totalAbsensi} hari
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Total Siswa</span>
            </div>
            <p className="text-2xl font-bold">{totalSiswa}</p>
            <p className="text-sm opacity-90">
              siswa aktif
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailRekap;
