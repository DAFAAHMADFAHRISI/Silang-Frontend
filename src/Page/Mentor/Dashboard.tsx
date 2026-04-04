import React, { useState, useEffect } from "react";

import { Users, UserCheck, Clock, CheckCircle, AlertCircle, Calendar, Award, TrendingUp, Mail, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { landingPageAPI } from "../../services/api";

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

const StatCard = ({ title, value, icon, color, trend }: { title: string; value: string | number; icon: React.ReactNode; color: string; trend?: string }) => (
  <div className={`${color} rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}>
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">{icon}</div>
      {trend && (
        <div className="flex items-center text-sm font-medium">
          <TrendingUp className="w-4 h-4 mr-1" />
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-white/80 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </div>
);

// Interface for API response data
interface DashboardData {
  total_siswa_hadir: number;
  total_siswa_telat: number;
  total_siswa_tepat_waktu: number;
  total_guru: number;
  total_siswa: number;
}

interface MagangDatesData {
  id: number;
  nama: string;
  email: string;
  tanggal_mulai_magang: string;
  tanggal_selesai_magang: string;
  status_magang: string;
  nama_institusi: string;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [magangDates, setMagangDates] = useState<MagangDatesData[]>([]);
  const [expandedMagang, setExpandedMagang] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get user name and role from localStorage
  const userName = localStorage.getItem('nama') || 'Mentor';
  const userRole = localStorage.getItem('role') || 'mentor';

  // Map role to display label
  const getRoleLabel = (role: string): string => {
    const roleMap: Record<string, string> = {
      superadmin: 'Super Admin',
      mentor: 'Mentor',
      guru: 'Guru',
      siswa: 'Siswa',
    };
    return roleMap[role.toLowerCase()] || role;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'mentor') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchDashboardData();
    fetchMagangDates();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      // Using the correct API endpoint as shown in the image
      const response = await fetch('http://localhost:3000/api/dashboard-mentor', {
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
      
      const data: DashboardData = await response.json();
      console.log('Debug - API Response data:', data);
      
      setDashboardData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data dashboard.';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMagangDates = async () => {
    try {
      const response = await landingPageAPI.getMagangDates();
      // Handle the API response structure
      if (response.success && response.data) {
        setMagangDates(response.data);
      } else {
        setMagangDates([]);
      }
    } catch (err) {
      console.error('Error fetching magang dates:', err);
      setMagangDates([]);
    }
  };

  // Calculate magang progress
  const calculateMagangProgress = (magangData: MagangDatesData) => {
    if (!magangData.tanggal_mulai_magang || !magangData.tanggal_selesai_magang) {
      return { totalDays: 0, remainingDays: 0, progressPercentage: 0 };
    }

    try {
      const startDate = new Date(magangData.tanggal_mulai_magang);
      const endDate = new Date(magangData.tanggal_selesai_magang);
      const now = new Date();

      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDays = totalDays - remainingDays;
      const progressPercentage = Math.max(0, Math.min(100, Math.round((elapsedDays / totalDays) * 100)));

      return { totalDays, remainingDays: Math.max(0, remainingDays), progressPercentage };
    } catch (error) {
      return { totalDays: 0, remainingDays: 0, progressPercentage: 0 };
    }
  };

  const toggleMagangExpansion = (id: number) => {
    setExpandedMagang(expandedMagang === id ? null : id);
  };

  // Calculate derived statistics
  const calculateStats = () => {
    if (!dashboardData) return [];
    
    return [
      {
        title: "Total Siswa",
        value: dashboardData.total_siswa,
        icon: <Users className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-green-500 to-emerald-600",
        trend: undefined,
      },
      {
        title: "Hadir Hari Ini",
        value: dashboardData.total_siswa_hadir,
        icon: <UserCheck className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-blue-500 to-cyan-600",
        trend: undefined,
      },
      {
        title: "Tidak Masuk Hari Ini",
        value: dashboardData.total_siswa - dashboardData.total_siswa_hadir,
        icon: <AlertCircle className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-red-500 to-pink-600",
        trend: undefined,
      },
      {
        title: "Telat Hari Ini",
        value: dashboardData.total_siswa_telat,
        icon: <Clock className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-yellow-500 to-orange-500",
        trend: undefined,
      },
      {
        title: "Tepat Waktu Hari Ini",
        value: dashboardData.total_siswa_tepat_waktu,
        icon: <CheckCircle className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-indigo-500 to-purple-600",
        trend: undefined,
      },
      {
        title: "Total Guru",
        value: dashboardData.total_guru,
        icon: <Award className="w-6 h-6 text-white" />,
        color: "bg-gradient-to-br from-purple-500 to-pink-600",
        trend: undefined,
      },
    ];
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data dashboard...</p>
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
            <div className="bg-gray-800 p-4 rounded-lg mb-4 text-left">
              <p className="text-gray-300 text-sm mb-2">Debug Info:</p>
              <p className="text-gray-400 text-xs">Token: {localStorage.getItem('token') ? 'Ada' : 'Tidak ada'}</p>
              <p className="text-gray-400 text-xs">Role: {localStorage.getItem('role') || 'Tidak ada'}</p>
              <p className="text-gray-400 text-xs">Nama: {localStorage.getItem('nama') || 'Tidak ada'}</p>
            </div>
            <div className="space-y-2">
              <button 
                onClick={fetchDashboardData} 
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

  const stats = calculateStats();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-6 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Dashboard
              </h1>
            </div>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Selamat datang, {userName}! sebagai <span className="text-blue-400 font-semibold">{getRoleLabel(userRole)}</span>. Berikut rekap hari ini.</p>
        </div>
        <Divider />
        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <span>Statistik</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>

        {/* Magang Dates Section */}
        {magangDates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span>Informasi Magang</span>
            </h2>
            <div className="space-y-4">
              {magangDates.map((magangData, index) => {
                const isExpanded = expandedMagang === magangData.id;
                const progress = calculateMagangProgress(magangData);
                
                return (
                  <div key={magangData.id || index} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    {/* Compact Header - Always Visible */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-gray-700/30 transition-colors"
                      onClick={() => toggleMagangExpansion(magangData.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {magangData.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{magangData.nama}</h3>
                            <p className="text-gray-400 text-sm">{magangData.nama_institusi}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Status</p>
                            <p className={`text-sm font-medium ${
                              magangData.status_magang === 'Selesai' ? 'text-green-400' : 
                              magangData.status_magang === 'Belum Ditentukan' ? 'text-yellow-400' : 
                              'text-blue-400'
                            }`}>
                              {magangData.status_magang}
                            </p>
                          </div>
                          <div className="text-gray-400">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details - Only when clicked */}
                    {isExpanded && (
                      <div className="border-t border-gray-700/50 p-6 bg-gray-900/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <Calendar className="w-5 h-5 text-white" />
                              <p className="text-white/80 text-sm font-medium">Tanggal Mulai</p>
                            </div>
                            <p className="text-white font-bold">
                              {magangData.tanggal_mulai_magang ? 
                                new Date(magangData.tanggal_mulai_magang).toLocaleDateString('id-ID') : 
                                'Belum Ditentukan'
                              }
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <CheckCircle className="w-5 h-5 text-white" />
                              <p className="text-white/80 text-sm font-medium">Tanggal Selesai</p>
                            </div>
                            <p className="text-white font-bold">
                              {magangData.tanggal_selesai_magang ? 
                                new Date(magangData.tanggal_selesai_magang).toLocaleDateString('id-ID') : 
                                'Belum Ditentukan'
                              }
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <Clock className="w-5 h-5 text-white" />
                              <p className="text-white/80 text-sm font-medium">Total Hari</p>
                            </div>
                            <p className="text-white font-bold">
                              {magangData.tanggal_mulai_magang && magangData.tanggal_selesai_magang ? 
                                `${progress.totalDays} hari` : 
                                'Belum Ditentukan'
                              }
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <TrendingUp className="w-5 h-5 text-white" />
                              <p className="text-white/80 text-sm font-medium">Sisa Hari</p>
                            </div>
                            <p className="text-white font-bold">
                              {magangData.tanggal_mulai_magang && magangData.tanggal_selesai_magang ? 
                                `${progress.remainingDays} hari` : 
                                'Belum Ditentukan'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar - Only show if dates are available */}
                        {magangData.tanggal_mulai_magang && magangData.tanggal_selesai_magang && (
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-white">Progress Magang</h4>
                              <span className="text-blue-400 font-bold">
                                {progress.progressPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${progress.progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Divider />
      </div>
  );
};

export default Dashboard;
