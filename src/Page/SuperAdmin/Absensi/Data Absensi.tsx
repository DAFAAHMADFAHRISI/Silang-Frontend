import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, Filter, UserCheck } from 'lucide-react';

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
  foto_in_url: string;
  foto_out_url: string;
}

interface Mentor {
  id: number;
  nama: string;
}

interface MentorSiswa {
  mentor_id: number;
  siswa_id: number;
  nama_siswa: string;
}

const DataAbsensi: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'students' | 'months' | 'dates'>('students');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [students, setStudents] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
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
    // Extract unique students from attendances
    const uniqueStudents = Array.from(new Set(attendances.map(att => att.nama_siswa)));
    setStudents(uniqueStudents);
  }, [attendances]);

  useEffect(() => {
    // Extract unique months for selected student
    if (selectedStudent) {
      const studentAttendances = attendances.filter(att => att.nama_siswa === selectedStudent);
      const uniqueMonths = Array.from(new Set(studentAttendances.map(att => {
        const date = new Date(att.tanggal_absensi);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }))).sort();
      setMonths(uniqueMonths);
    }
  }, [selectedStudent, attendances]);

  useEffect(() => {
    // Extract unique dates for selected student and month
    if (selectedStudent && selectedMonth) {
      const studentAttendances = attendances.filter(att => {
        const date = new Date(att.tanggal_absensi);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return att.nama_siswa === selectedStudent && monthKey === selectedMonth;
      });
      const uniqueDates = Array.from(new Set(studentAttendances.map(att => att.tanggal_absensi))).sort();
      setDates(uniqueDates);
    }
  }, [selectedStudent, selectedMonth, attendances]);

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data absensi.';
      setError(errorMessage);
      console.error('Error fetching attendances:', err);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handlers
  const handleStudentClick = (studentName: string) => {
    setSelectedStudent(studentName);
    setCurrentView('months');
    setSelectedMonth('');
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
    setCurrentView('dates');
  };

  const handleDateClick = (date: string) => {
    navigate(`/DataAbsensi/detail/${selectedStudent}/${selectedMonth}/${date}`);
  };

  const handleBackToStudents = () => {
    setCurrentView('students');
    setSelectedStudent('');
    setSelectedMonth('');
  };

  const handleBackToMonths = () => {
    setCurrentView('months');
    setSelectedMonth('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
        <span>Data Absensi</span>
      </h1>
      <p className="text-gray-400 mt-2 ml-5">Pantau dan kelola data kehadiran siswa.</p>
      <hr className="border-gray-700 my-4" />
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={handleBackToStudents}
          className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
        >
          <Users className="w-4 h-4" />
          <span>Siswa</span>
        </button>
        {selectedStudent && (
          <>
            <span className="text-gray-500">›</span>
            <button
              onClick={handleBackToMonths}
              className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <Calendar className="w-4 h-4" />
              <span>{selectedStudent}</span>
            </button>
          </>
        )}
        {selectedMonth && (
          <>
            <span className="text-gray-500">›</span>
            <span className="text-gray-300 flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatMonth(selectedMonth)}</span>
            </span>
          </>
        )}
      </div>

      {/* Students View */}
      {currentView === 'students' && (
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2 mb-6">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-white">Daftar Siswa</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student, index) => (
              <div
                key={index}
                onClick={() => handleStudentClick(student)}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold">{student.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{student}</h3>
                    <p className="text-white/80 text-sm">Klik untuk melihat bulan</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Months View */}
      {currentView === 'months' && (
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2 mb-6">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span className="text-white">Bulan untuk {selectedStudent}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {months.map((month, index) => (
              <div
                key={index}
                onClick={() => handleMonthClick(month)}
                className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{formatMonth(month)}</h3>
                    <p className="text-white/80 text-sm">Klik untuk melihat tanggal</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dates View */}
      {currentView === 'dates' && (
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2 mb-6">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-white">Tanggal untuk {selectedStudent} - {formatMonth(selectedMonth)}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dates.map((date, index) => (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{formatDate(date)}</h3>
                    <p className="text-white/80 text-sm">Klik untuk melihat detail</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {((currentView === 'students' && students.length === 0) ||
        (currentView === 'months' && months.length === 0) ||
        (currentView === 'dates' && dates.length === 0)) && !loading && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Tidak Ada Data
          </h3>
          <p className="text-gray-500">
            Belum ada data yang tersedia untuk ditampilkan.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataAbsensi;
