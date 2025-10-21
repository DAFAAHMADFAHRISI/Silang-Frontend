import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface AttendanceDetail {
  nama_siswa: string;
  tanggal_absensi: string;
  foto_in: string;
  waktu_checkin: string;
  telat: string;
  lokasi_in: string;
  foto_out: string;
  waktu_checkout: string;
  lokasi_out: string;
  foto_in_url: string;
  foto_out_url: string;
}

const Detail: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  const [attendance, setAttendance] = useState<AttendanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract parameters safely
  const studentName = params.studentName || '';
  const month = params.month || '';
  const date = params.date || '';

  console.log('Detail component mounted with params:', params);
  console.log('Extracted values:', { studentName, month, date });

  useEffect(() => {
    if (studentName && date) {
      fetchAttendanceDetail();
    } else {
      setLoading(false);
      setError('Parameter URL tidak lengkap');
    }
  }, [studentName, month, date]);

  const fetchAttendanceDetail = async () => {
    try {
      console.log('Starting to fetch attendance detail...');
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      console.log('Making API request to:', 'http://localhost:3000/api/absensi');
      const response = await fetch('http://localhost:3000/api/absensi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('API Response status:', response.status);
      
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
      console.log('API Response data:', data);
      
      // Decode URL parameters
      const decodedStudentName = studentName ? decodeURIComponent(studentName) : '';
      const targetDate = date || '';
      
      console.log('Looking for:', { decodedStudentName, targetDate });
      
      // Find the specific attendance record
      let foundAttendance = data.find((att: AttendanceDetail) => 
        att.nama_siswa === decodedStudentName && att.tanggal_absensi === targetDate
      );
      
      // If no exact match, try to find by student name only
      if (!foundAttendance) {
        console.log('No exact match found, trying student name only...');
        foundAttendance = data.find((att: AttendanceDetail) => 
          att.nama_siswa === decodedStudentName
        );
      }
      
      // If still no match, show the first record for debugging
      if (!foundAttendance && data.length > 0) {
        console.log('No student match found, showing first record for debugging...');
        foundAttendance = data[0];
      }
      
      if (foundAttendance) {
        console.log('Found attendance:', foundAttendance);
        setAttendance(foundAttendance);
      } else {
        console.log('No attendance data available');
        throw new Error('Data absensi tidak ditemukan.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data absensi.';
      console.error('Error fetching attendance detail:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === 'null' || timeString === 'undefined') {
      return '--:--';
    }
    return timeString.substring(0, 5);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusConfig = (telat: string) => {
    if (telat === 'Tepat waktu' || telat === '0 menit') {
      return {
        bg: "bg-gradient-to-br from-green-500 to-emerald-600",
        icon: <CheckCircle className="w-5 h-5" />,
        text: "Tepat Waktu",
        textColor: "text-green-400"
      };
    } else {
      return {
        bg: "bg-gradient-to-br from-yellow-500 to-orange-500",
        icon: <AlertCircle className="w-5 h-5" />,
        text: `Telat ${telat}`,
        textColor: "text-orange-400"
      };
    }
  };

  // Always render something
  console.log('Rendering component with state:', { loading, error, attendance: !!attendance });

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-white">Memuat data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={() => navigate('/DataAbsensi')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Kembali ke Data Absensi
          </button>
        </div>
      </div>
    );
  }

  if (!attendance) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Data tidak ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            Data absensi untuk siswa dan tanggal yang dipilih tidak tersedia.
          </p>
          <button
            onClick={() => navigate('/DataAbsensi')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Kembali ke Data Absensi
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(attendance.telat);

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/DataAbsensi')}
            className="text-blue-400 hover:text-blue-300 flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
          <div className="w-px h-6 bg-gray-600"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Detail Absensi
          </h1>
        </div>
      </div>


      {/* Student Info Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">{attendance.nama_siswa.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{attendance.nama_siswa}</h2>
              <p className="text-white/80">{formatDate(attendance.tanggal_absensi)}</p>
            </div>
          </div>
          <div className={`${statusConfig.bg} px-4 py-2 rounded-full flex items-center space-x-2`}>
            {statusConfig.icon}
            <span className="font-semibold">{statusConfig.text}</span>
          </div>
        </div>
      </div>

      {/* Complete Data Display */}
      <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 mb-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
          <Eye className="w-6 h-6 text-blue-400" />
          <span>Data Lengkap Absensi</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tanggal Absensi */}
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm font-medium">Tanggal</span>
            </div>
            <p className="text-white font-semibold text-lg">{formatDate(attendance.tanggal_absensi)}</p>
            <p className="text-gray-400 text-xs mt-1">{attendance.tanggal_absensi}</p>
          </div>

          {/* Waktu Check In */}
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm font-medium">Check In</span>
            </div>
            <p className="text-white font-semibold text-lg">{formatTime(attendance.waktu_checkin)}</p>
            <p className="text-gray-400 text-xs mt-1">{attendance.waktu_checkin}</p>
          </div>

          {/* Keterlambatan */}
          <div className={`rounded-lg p-4 border ${attendance.telat === 'Tepat waktu' || attendance.telat === '0 menit' 
            ? 'bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30' 
            : 'bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30'}`}>
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                attendance.telat === 'Tepat waktu' || attendance.telat === '0 menit'
                  ? 'bg-green-500/20'
                  : 'bg-orange-500/20'
              }`}>
                {attendance.telat === 'Tepat waktu' || attendance.telat === '0 menit' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                )}
              </div>
              <span className="text-gray-400 text-sm font-medium">Status</span>
            </div>
            <p className={`font-semibold text-lg ${
              attendance.telat === 'Tepat waktu' || attendance.telat === '0 menit'
                ? 'text-green-400'
                : 'text-orange-400'
            }`}>
              {attendance.telat === 'Tepat waktu' || attendance.telat === '0 menit' ? 'Tepat Waktu' : attendance.telat}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {attendance.telat === 'Tepat waktu' || attendance.telat === '0 menit' ? 'Sesuai jadwal' : 'Terlambat masuk'}
            </p>
          </div>

          {/* Waktu Check Out */}
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm font-medium">Check Out</span>
            </div>
            <p className="text-white font-semibold text-lg">
              {attendance.waktu_checkout ? formatTime(attendance.waktu_checkout) : '--:--'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {attendance.waktu_checkout || 'Belum check out'}
            </p>
          </div>
        </div>
      </div>

      {/* Photo Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Check In Photo */}
        {attendance.foto_in && attendance.foto_in !== 'null' && (
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-green-400" />
              <span>Foto Check In</span>
            </h3>
            <div className="flex justify-center">
              <img 
                src={`http://localhost:3000/images/foto_absensi/${attendance.foto_in}`}
                alt="Check In Photo"
                className="max-w-full h-64 object-contain rounded-lg border border-gray-600/50"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-64 bg-gray-700/50 rounded-lg border border-gray-600/50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Gambar tidak tersedia</span>
              </div>
            </div>
          </div>
        )}

        {/* Check Out Photo */}
        {attendance.foto_out && attendance.foto_out !== 'null' && (
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Eye className="w-6 h-6 text-red-400" />
              <span>Foto Check Out</span>
            </h3>
            <div className="flex justify-center">
              <img 
                src={`http://localhost:3000/images/foto_absensi/${attendance.foto_out}`}
                alt="Check Out Photo"
                className="max-w-full h-64 object-contain rounded-lg border border-gray-600/50"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-64 bg-gray-700/50 rounded-lg border border-gray-600/50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Gambar tidak tersedia</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Show message if no photos available */}
      {(!attendance.foto_in || attendance.foto_in === 'null') && (!attendance.foto_out || attendance.foto_out === 'null') && (
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 mb-6">
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              Foto Tidak Tersedia
            </h3>
            <p className="text-gray-500">
              Foto check in dan check out tidak tersedia untuk absensi ini.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;