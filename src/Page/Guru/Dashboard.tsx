import React, { useState, useEffect } from "react";
import { Users, UserCheck, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState([
    {
      title: "Jumlah Kelas",
      value: 0,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      trend: "+1",
    },
    {
      title: "Siswa Bimbingan",
      value: 0,
      icon: <UserCheck className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      trend: "+4",
    },
    {
      title: "Siswa Hadir",
      value: 0,
      icon: <Clock className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      trend: undefined,
    },
    {
      title: "Siswa Telat",
      value: 0,
      icon: <AlertCircle className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-red-500 to-pink-600",
      trend: undefined,
    },
    {
      title: "Siswa Tepat Waktu",
      value: 0,
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      trend: undefined,
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Get user name from localStorage
  const userName = localStorage.getItem('nama') || 'Guru';

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      setError('Anda harus login terlebih dahulu.');
      setLoading(false);
      return;
    }

    if (role !== 'guru') {
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

      const response = await fetch('http://localhost:3000/api/dashboard-guru', {
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
      
      // Update stats with API data
      setStats([
        {
          title: "Total Siswa",
          value: data.total_siswa || 0,
          icon: <Users className="w-6 h-6 text-white" />,
          color: "bg-gradient-to-br from-green-500 to-emerald-600",
          trend: undefined,
        },
        {
          title: "Total Mentor",
          value: data.total_mentor || 0,
          icon: <UserCheck className="w-6 h-6 text-white" />,
          color: "bg-gradient-to-br from-blue-500 to-cyan-600",
          trend: undefined,
        },
        {
          title: "Siswa Hadir",
          value: data.total_siswa_hadir || 0,
          icon: <Clock className="w-6 h-6 text-white" />,
          color: "bg-gradient-to-br from-yellow-500 to-orange-500",
          trend: undefined,
        },
        {
          title: "Siswa Telat",
          value: data.total_siswa_telat || 0,
          icon: <AlertCircle className="w-6 h-6 text-white" />,
          color: "bg-gradient-to-br from-red-500 to-pink-600",
          trend: undefined,
        },
        {
          title: "Siswa Tepat Waktu",
          value: data.total_siswa_tepat_waktu || 0,
          icon: <CheckCircle className="w-6 h-6 text-white" />,
          color: "bg-gradient-to-br from-indigo-500 to-purple-600",
          trend: undefined,
        },
      ]);
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data dashboard. Silakan coba lagi.';
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={fetchDashboardData} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Coba Lagi
              </button>
              <button 
                onClick={handleLogout} 
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>
      <Divider />
    </div>
  );
};

export default Dashboard;
