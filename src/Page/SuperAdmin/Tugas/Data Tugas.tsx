import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { TrendingUp, FileText, User, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  file_tugas: string;
  priority: string;
  nama_mentor: string;
  nama_siswa: string;
  waktu_diberikan: string;
  batas_waktu: string;
}

const DataTugas: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
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

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/superadmin/tugas', {
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
      setTasks(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data tugas.';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
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

  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return {
          bg: "bg-gradient-to-br from-red-500 to-pink-600",
          icon: <AlertCircle className="w-5 h-5" />,
          text: "High Priority"
        };
      case 'medium':
        return {
          bg: "bg-gradient-to-br from-yellow-500 to-orange-500",
          icon: <Clock className="w-5 h-5" />,
          text: "Medium Priority"
        };
      case 'low':
        return {
          bg: "bg-gradient-to-br from-green-500 to-emerald-600",
          icon: <CheckCircle className="w-5 h-5" />,
          text: "Low Priority"
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-500 to-gray-600",
          icon: <FileText className="w-5 h-5" />,
          text: "Normal Priority"
        };
    }
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
                  onClick={fetchTasks}
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
          <span>Data Tugas</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Kelola dan pantau semua tugas yang diberikan kepada siswa.</p>
        <hr className="border-gray-700 my-4" />
        
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span className="text-white">Daftar Tugas</span>
          </h2>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => {
            const priorityConfig = getPriorityConfig(task.priority);
            return (
              <div 
                key={task.id} 
                className="bg-gray-800 rounded-lg p-4 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-700 hover:border-blue-500"
                onClick={() => {
                  console.log('Navigating to task detail:', task.id);
                  navigate(`/SuperAdmin/Tugas/detail/${task.id}`);
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg leading-tight pr-2 flex-1">{task.judul}</h3>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.bg}`}>
                    {priorityConfig.icon}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="truncate">{task.nama_mentor}</span>
                </div>
                
                <div className="mt-3 text-xs text-gray-400">
                  <span>Klik untuk detail →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak Ada Tugas</h3>
            <p className="text-gray-500">Belum ada tugas yang tersedia saat ini.</p>
          </div>
        )}
      </div>
    
  );
};

export default DataTugas;
