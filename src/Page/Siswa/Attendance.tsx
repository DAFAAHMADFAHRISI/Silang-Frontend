import React, { useEffect, useState } from 'react';
import { UserCheck, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle, Award, Users, Mail } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-6 sm:my-8 w-full" />;

interface AttendanceRow {
  id: number;
  nama_siswa: string;
  tanggal_absen: string;
  waktu_checkin: string;
  waktu_checkout: string;
  checkin_face: string;
  checkout_face: string;
  checkin_location: string;
  checkout_location: string;
  status_kehadiran: string;
}

const Attendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/absensi-siswa', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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

      const result = await response.json();
      
      if (result.success && result.data) {
        setAttendanceData(result.data);
      } else {
        throw new Error('Format response tidak valid');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data absensi.';
      setError(errorMessage);
      console.error('Error fetching attendance:', err);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const filteredAttendance = attendanceData.filter(item => {
    const matchesSearch = item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tanggal_absen.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'late' && item.status_kehadiran.toLowerCase().includes('terlambat')) ||
                         (statusFilter === 'ontime' && !item.status_kehadiran.toLowerCase().includes('terlambat'));
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as-is if can't parse
      }
      return date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateString; // Return as-is if error
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    
    // Jika format sudah HH:MM:SS, langsung return
    if (timeString.includes(':')) {
      return timeString;
    }
    
    // Jika format adalah timestamp, convert ke HH:MM:SS
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString; // Return as-is if can't parse
      }
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    } catch {
      return timeString; // Return as-is if error
    }
  };

  const getLateStatus = (statusKehadiran: string) => {
    if (!statusKehadiran) {
      return { text: 'Tidak ada status', class: 'text-gray-400' };
    }
    
    const status = statusKehadiran.toLowerCase();
    
    if (status.includes('terlambat')) {
      return { text: statusKehadiran, class: 'text-red-400' };
    } else if (status.includes('on time') || status.includes('tepat waktu') || status.includes('hadir')) {
      return { text: 'Tepat Waktu', class: 'text-green-400' };
    } else if (status.includes('izin') || status.includes('sakit')) {
      return { text: statusKehadiran, class: 'text-yellow-400' };
    } else if (status.includes('alpha') || status.includes('tidak hadir')) {
      return { text: statusKehadiran, class: 'text-red-500' };
    } else {
      return { text: statusKehadiran, class: 'text-blue-400' };
    }
  };

  const openLocationMap = (location: string, type: 'checkin' | 'checkout') => {
    if (!location) return;
    
    try {
      const [lat, lng] = location.split(',').map(coord => coord.trim());
      
      // Validasi koordinat
      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        alert('Koordinat tidak valid');
        return;
      }
      
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening map:', error);
      alert('Tidak dapat membuka lokasi');
    }
  };

  const renderLocationCell = (location: string, type: 'checkin' | 'checkout') => {
    if (!location) {
      return <span className="text-gray-500">-</span>;
    }

    try {
      const [lat, lng] = location.split(',').map(coord => coord.trim());
      
      // Validasi koordinat
      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        return <span className="text-gray-500">Invalid</span>;
      }

      return (
        <button
          onClick={() => openLocationMap(location, type)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors whitespace-nowrap"
          title={`Buka lokasi ${type === 'checkin' ? 'check-in' : 'check-out'} di Google Maps`}
        >
          View Map
        </button>
      );
    } catch (error) {
      return <span className="text-gray-500">Error</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
            <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
            <div className="space-y-2">
              <button 
                onClick={fetchAttendance} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Coba Lagi
              </button>
              <button 
                onClick={() => window.location.href = '/Login'} 
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 mt-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Attendance
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Riwayat kehadiran dan absensi siswa.</p>
      </div>
      
      <Divider />
      
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Absensi</p>
              <p className="text-2xl font-bold text-white">{filteredAttendance.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tepat Waktu</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredAttendance.filter(item => !item.status_kehadiran.toLowerCase().includes('terlambat')).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Terlambat</p>
              <p className="text-2xl font-bold text-red-400">
                {filteredAttendance.filter(item => item.status_kehadiran.toLowerCase().includes('terlambat')).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Check Out</p>
              <p className="text-2xl font-bold text-blue-400">
                {filteredAttendance.filter(item => item.waktu_checkout).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
        <input
          type="text"
          placeholder="Cari nama atau tanggal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded focus:outline-none border border-gray-700 w-full sm:w-64 text-sm sm:text-base"
        />
        <div className="flex gap-2 items-center">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700 text-xs sm:text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="ontime">Tepat Waktu</option>
            <option value="late">Terlambat</option>
          </select>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded flex items-center text-xs sm:text-sm"
          >
            {refreshing ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Loading...
              </>
            ) : (
              <>
                <span className="mr-1">⟳</span> Refresh
              </>
            )}
          </button>
        </div>
      </div>
      
      <Divider />
      
      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Nama Siswa</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Tanggal</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Check In</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Status</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Check Out</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Lokasi In</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Lokasi Out</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="text-center">
                    <UserCheck className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    {attendanceData.length === 0 ? (
                      <>
                        <p className="text-gray-400 text-lg">Belum ada data absensi</p>
                        <p className="text-gray-500 text-sm">Data absensi akan muncul setelah Anda melakukan check-in</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-lg">Tidak ada data yang sesuai</p>
                        <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAttendance.map((row) => {
                const lateStatus = getLateStatus(row.status_kehadiran);
                return (
                  <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-2 sm:px-4 text-white font-medium">{row.nama_siswa}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-300">{formatDate(row.tanggal_absen)}</td>
                    <td className="py-3 px-2 sm:px-4 text-green-400 font-medium">{formatTime(row.waktu_checkin)}</td>
                    <td className={`py-3 px-2 sm:px-4 font-medium ${lateStatus.class}`}>
                      {lateStatus.text}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-blue-400 font-medium">{formatTime(row.waktu_checkout)}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-400 text-xs">
                      {renderLocationCell(row.checkin_location, 'checkin')}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-gray-400 text-xs">
                      {renderLocationCell(row.checkout_location, 'checkout')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <Divider />
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs sm:text-sm">Rows:</span>
          <select className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 text-xs sm:text-sm">
            <option>{filteredAttendance.length}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-800 text-gray-400 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm" disabled>{'<<'}</button>
          <span className="text-white text-xs sm:text-sm">Page 1 of 1</span>
          <button className="bg-gray-800 text-gray-400 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm" disabled>{'>>'}</button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
