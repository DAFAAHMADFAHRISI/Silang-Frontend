import React, { useState, useEffect } from "react";

import { Users, UserCheck, Clock, CheckCircle, AlertCircle, Calendar, Award, TrendingUp, Mail, RefreshCw } from "lucide-react";
import { useNavigate } from 'react-router-dom';

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

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get user name from localStorage
  const userName = localStorage.getItem('nama') || 'Mentor';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'mentor') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchDashboardData();
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
          <p className="text-gray-400 mt-2 ml-5">Selamat datang, {userName}! Berikut rekap hari ini.</p>
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
      </div>
  );
};

export default Dashboard;
