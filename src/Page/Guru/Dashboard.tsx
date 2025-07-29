import React, { useState, useEffect } from "react";
import Layout from "../../Layout/Layout";
import { Users, UserCheck, Clock, CheckCircle, AlertCircle, Calendar, Award, TrendingUp, Mail, FileText, Clock as ClockIcon } from "lucide-react";
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

interface TaskSubmission {
  siswa_id: number;
  siswa_nama: string;
  file_jawaban: string;
  tanggal_mengumpulkan: string;
  nilai: number;
  catatan_siswa: string;
  catatan_guru: string;
  status: string;
}

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  priority: string;
  file_tugas: string;
  waktu_diberikan: string;
  batas_waktu: string;
  created_at: string;
  updated_at: string;
  mentor_nama: string;
  total_submissions: number;
  total_graded: number;
  penerima_tugas: TaskSubmission[];
}

const TaskCard = ({ task }: { task: Task }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-gradient-to-br from-red-500 to-pink-600';
      case 'medium':
        return 'bg-gradient-to-br from-orange-500 to-red-500';
      case 'low':
        return 'bg-gradient-to-br from-blue-500 to-purple-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sudah Dinilai':
        return 'bg-green-500';
      case 'Belum Dinilai':
        return 'bg-yellow-500';
      case 'Belum Dikumpulkan':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const completedSubmissions = task.penerima_tugas.filter(sub => sub.status === 'Sudah Dinilai').length;
  const totalSubmissions = task.penerima_tugas.length;
  const pendingSubmissions = task.penerima_tugas.filter(sub => sub.status === 'Belum Dinilai').length;

  return (
    <div className={`${getPriorityColor(task.priority)} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-lg leading-tight pr-4">{task.judul}</h3>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.penerima_tugas[0]?.status || 'Belum Dikumpulkan')}`}>
            {task.penerima_tugas[0]?.status || 'Belum Dikumpulkan'}
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
            {task.priority}
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Deadline: {formatDate(task.batas_waktu)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Progress: {completedSubmissions}/{totalSubmissions}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <FileText className="w-4 h-4" />
          <span>File: {task.file_tugas}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <UserCheck className="w-4 h-4" />
          <span>Mentor: {task.mentor_nama}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <ClockIcon className="w-4 h-4" />
          <span>Diberikan: {formatDate(task.waktu_diberikan)}</span>
        </div>
        
        {isOverdue(task.batas_waktu) && (
          <div className="flex items-center space-x-2 text-sm bg-red-500/20 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-300" />
            <span className="text-red-300">Deadline telah lewat!</span>
          </div>
        )}
        
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-sm leading-relaxed">{task.deskripsi}</p>
        </div>
        
        {task.penerima_tugas.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Submissions ({totalSubmissions})</p>
              <div className="flex space-x-2 text-xs">
                <span className="bg-green-500/20 px-2 py-1 rounded">✓ {completedSubmissions}</span>
                <span className="bg-yellow-500/20 px-2 py-1 rounded">⏳ {pendingSubmissions}</span>
              </div>
            </div>
            {task.penerima_tugas.map((submission, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{submission.siswa_nama}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                    {submission.nilai && (
                      <span className="text-xs bg-white/20 px-2 py-1 rounded">
                        {submission.nilai}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs space-y-1">
                  <p>File: {submission.file_jawaban}</p>
                  <p>Submitted: {formatDate(submission.tanggal_mengumpulkan)}</p>
                  {submission.catatan_siswa && (
                    <p className="text-blue-300">Note Siswa: {submission.catatan_siswa}</p>
                  )}
                  {submission.catatan_guru && (
                    <p className="text-yellow-300">Note Guru: {submission.catatan_guru}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
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

    if (role !== 'guru') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchDashboardData();
    fetchTodayTasks();
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

  const fetchTodayTasks = async () => {
    try {
      setTasksLoading(true);
      setTasksError(null);
      
      // Menggunakan data statis untuk tugas hari ini
      const staticTasks: Task[] = [
        {
          id: 1,
          judul: "Periksa Tugas Bahasa Inggris",
          deskripsi: "Essay tentang future plans untuk kelas 7A. Periksa grammar dan struktur kalimat.",
          priority: "High",
          file_tugas: "essay_future_plans.pdf",
          waktu_diberikan: "2025-01-29T08:00:00.000Z",
          batas_waktu: "2025-01-30T16:00:00.000Z",
          created_at: "2025-01-29T08:00:00.000Z",
          updated_at: "2025-01-29T08:00:00.000Z",
          mentor_nama: "Sari Indah Permata",
          total_submissions: 3,
          total_graded: 1,
          penerima_tugas: [
            {
              siswa_id: 1,
              siswa_nama: "Ahmad Rizki",
              file_jawaban: "essay_ahmad.pdf",
              tanggal_mengumpulkan: "2025-01-29T14:30:00.000Z",
              nilai: 85,
              catatan_siswa: "Sudah diketik rapi",
              catatan_guru: "Grammar perlu diperbaiki",
              status: "Sudah Dinilai"
            },
            {
              siswa_id: 2,
              siswa_nama: "Siti Nurhaliza",
              file_jawaban: "essay_siti.pdf",
              tanggal_mengumpulkan: "2025-01-29T15:45:00.000Z",
              nilai: 0,
              catatan_siswa: "",
              catatan_guru: "",
              status: "Belum Dinilai"
            },
            {
              siswa_id: 3,
              siswa_nama: "Budi Santoso",
              file_jawaban: "",
              tanggal_mengumpulkan: "",
              nilai: 0,
              catatan_siswa: "",
              catatan_guru: "",
              status: "Belum Dikumpulkan"
            }
          ]
        },
        {
          id: 2,
          judul: "Input Nilai Matematika",
          deskripsi: "Input nilai ulangan harian matematika untuk seluruh kelas 8. Topik: Aljabar.",
          priority: "Medium",
          file_tugas: "nilai_matematika.xlsx",
          waktu_diberikan: "2025-01-28T10:00:00.000Z",
          batas_waktu: "2025-01-31T16:00:00.000Z",
          created_at: "2025-01-28T10:00:00.000Z",
          updated_at: "2025-01-28T10:00:00.000Z",
          mentor_nama: "Budi Prasetyo",
          total_submissions: 0,
          total_graded: 0,
          penerima_tugas: []
        },
        {
          id: 3,
          judul: "Rapat Koordinasi Guru",
          deskripsi: "Rapat koordinasi mingguan untuk membahas progress siswa dan rencana pembelajaran.",
          priority: "Low",
          file_tugas: "notulen_rapat.pdf",
          waktu_diberikan: "2025-01-29T09:00:00.000Z",
          batas_waktu: "2025-01-29T11:00:00.000Z",
          created_at: "2025-01-29T09:00:00.000Z",
          updated_at: "2025-01-29T11:00:00.000Z",
          mentor_nama: "Kepala Sekolah",
          total_submissions: 1,
          total_graded: 1,
          penerima_tugas: [
            {
              siswa_id: 4,
              siswa_nama: "Guru Koordinator",
              file_jawaban: "notulen_rapat.pdf",
              tanggal_mengumpulkan: "2025-01-29T11:00:00.000Z",
              nilai: 100,
              catatan_siswa: "Rapat selesai tepat waktu",
              catatan_guru: "Semua agenda telah dibahas",
              status: "Sudah Dinilai"
            }
          ]
        }
      ];
      
      console.log('Using static tasks data:', staticTasks);
      setTasks(staticTasks);
      setTasksError(null);
      
    } catch (err) {
      console.error('Error with static tasks:', err);
      setTasks([]);
      setTasksError('Gagal memuat tugas hari ini.');
    } finally {
      setTasksLoading(false);
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
      <Layout>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Memuat data dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-6 mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dashboard
            </h1>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Selamat datang, berikut rekap hari ini.</p>
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
        {/* Today's Tasks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              <span>Tugas Hari Ini</span>
              <span className="text-sm text-gray-400">({tasks.length} tugas)</span>
            </h2>
            <button 
              onClick={fetchTodayTasks}
              disabled={tasksLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <div className={`w-4 h-4 ${tasksLoading ? 'animate-spin' : ''}`}>
                {tasksLoading ? '⟳' : '↻'}
              </div>
              <span>Refresh</span>
            </button>
          </div>
          {tasksLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Memuat tugas hari ini...</p>
            </div>
          ) : tasksError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{tasksError}</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={fetchTodayTasks} 
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
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Tidak ada tugas untuk hari ini</p>
              <p className="text-gray-500 text-sm mt-2">Semua tugas telah selesai atau belum ada tugas yang dijadwalkan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
        <Divider />
      </div>
    </Layout>
  );
};

export default Dashboard;
