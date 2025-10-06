import type React from "react"
import { Users, UserCheck, Clock, CheckCircle, AlertCircle, Calendar, Mail, Award, TrendingUp, Building } from "lucide-react"
import { useState, useEffect } from "react"

interface StatCardProps {
  title: string
  value: string | number | React.ReactNode
  icon: React.ReactNode
  color: string
  trend?: string
}

interface TaskCardProps {
  title: string
  dueDate: string
  status: "pending" | "completed"
  score: number
  completedTime?: string
  notes: string
}

interface AttendanceCardProps {
  name: string
  email: string
  checkIn: string
  lateTime: string
  checkOut: string
  avatar?: string
}

interface DashboardStats {
  total_hadir: number
  total_telat: number
  total_tepat_waktu: number
  jumlah_mentor: number
  jumlah_siswa: number
  jumlah_guru: number
}

interface InstitusiData {
  total_siswa: number
  nama_institusi: string
}

interface AllSiswaData {
  total_all_siswa: number
}

interface AttendanceData {
  id: number
  waktu_checkin: string
  waktu_checkout: string
  checkin_face: string
  checkout_face: string
  checkin_location: string
  checkout_location: string
  status_kehadiran: string
}

interface TaskData {
  id: number
  judul: string
  deskripsi: string
  priority: string
  file_tugas: string
  waktu_diberikan: string
  batas_waktu: string
  file_jawaban: string
  tanggal_mengumpulkan: string
  nilai: number
  catatan_siswa: string
  catatan_guru: string
  mentor_nama: string
  status_tugas: string
}

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <div
      className={`${color} rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">{icon}</div>
        {trend && (
          <div className="flex items-center text-xs sm:text-sm font-medium">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-white/80 text-xs sm:text-sm font-medium">{title}</p>
        <div className="text-white font-bold">
          {value}
        </div>
      </div>
    </div>
  );
}

const TaskCard: React.FC<TaskCardProps> = ({ title, dueDate, status, score, completedTime, notes }) => {
  const statusConfig = {
    pending: {
      bg: "bg-gradient-to-br from-orange-500 to-red-500",
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      statusText: "Pending",
    },
    completed: {
      bg: "bg-gradient-to-br from-blue-500 to-purple-600",
      icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      statusText: "Completed",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-1 truncate">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-2">{notes}</p>
        </div>
        <div className={`${config.bg} rounded-lg p-2 sm:p-3 ml-3 flex-shrink-0`}>
          {config.icon}
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Deadline:</span>
          <span className={`font-medium ${dueDate.includes('Terlambat') ? 'text-red-400' : 'text-green-400'}`}>
            {dueDate}
          </span>
        </div>
        
        {status === "completed" && completedTime && (
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-400">Completed:</span>
            <span className="text-blue-400 font-medium">{completedTime}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Score:</span>
          <span className="font-bold text-white">{score}/100</span>
        </div>
        
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-gray-400">Status:</span>
          <span className={`font-medium ${status === "completed" ? "text-green-400" : "text-orange-400"}`}>
            {config.statusText}
          </span>
        </div>
      </div>
    </div>
  );
};

const AttendanceCard: React.FC<AttendanceCardProps> = ({ name, email, checkIn, lateTime, checkOut }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 mb-4 sm:mb-6">
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm sm:text-base">{name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{name}</h3>
          {email && <p className="text-xs sm:text-sm text-gray-400 truncate">{email}</p>}
        </div>
      </div>
      <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
        lateTime.includes('Telat') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
      }`}>
        {lateTime}
      </div>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Check In:</span>
        <span className="font-medium text-white">{checkIn}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Check Out:</span>
        <span className="font-medium text-white">{checkOut}</span>
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  // Get user name from localStorage
  const userName = localStorage.getItem('nama') || 'Siswa';

  // State for API data
  const [stats, setStats] = useState<DashboardStats>({
    total_hadir: 0,
    total_telat: 0,
    total_tepat_waktu: 0,
    jumlah_mentor: 0,
    jumlah_siswa: 0,
    jumlah_guru: 0
  });
  const [institusiData, setInstitusiData] = useState<InstitusiData>({
    total_siswa: 0,
    nama_institusi: ""
  });
  const [allSiswaData, setAllSiswaData] = useState<AllSiswaData>({
    total_all_siswa: 0
  });
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/dashboard-siswa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard statistics');
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/dashboard-absensi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`Failed to fetch attendance data: ${response.status}`);
      }
      const data = await response.json();
      setAttendance(data);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load attendance data');
    }
  };

  // Fetch tasks data
  const fetchTasksData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/dashboard-tugas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`Failed to fetch tasks data: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks data');
    }
  };

  // Fetch institusi data
  const fetchInstitusiData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/dashboard-siswa-by-institusi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`Failed to fetch institusi data: ${response.status}`);
      }
      const data = await response.json();
      setInstitusiData(data);
    } catch (err) {
      console.error('Error fetching institusi data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load institusi data');
    }
  };

  // Fetch all siswa data
  const fetchAllSiswaData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/dashboard-all-siswa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`Failed to fetch all siswa data: ${response.status}`);
      }
      const data = await response.json();
      setAllSiswaData(data);
    } catch (err) {
      console.error('Error fetching all siswa data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load all siswa data');
    }
  };

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access dashboard data');
        setLoading(false);
        return;
      }
      
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchAttendanceData(),
          fetchTasksData(),
          fetchInstitusiData(),
          fetchAllSiswaData()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    if (!isoString) return "Tidak ada data";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return "Format waktu tidak valid";
      }
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return "Error format waktu";
    }
  };

  // Format date from ISO string
  const formatDate = (isoString: string) => {
    if (!isoString) return "Tidak ada data";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return "Format tanggal tidak valid";
      }
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return "Error format tanggal";
    }
  };

  // Calculate time difference for due dates
  const getTimeDifference = (dueDate: string) => {
    if (!dueDate) return "Tidak ada deadline";
    try {
      const now = new Date();
      const due = new Date(dueDate);
      if (isNaN(due.getTime())) {
        return "Format deadline tidak valid";
      }
      const diff = due.getTime() - now.getTime();
      
      if (diff < 0) {
        return 'Terlambat';
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `dalam ${days} hari`;
      } else if (hours > 0) {
        return `dalam ${hours} jam`;
      } else {
        return 'dalam beberapa menit';
      }
    } catch (error) {
      return "Error menghitung deadline";
    }
  };

  // Transform API data to component props
  const statsCards = [
    // {
    //   title: "Hadir Hari Ini",
    //   value: stats.total_hadir || 0,
    //   icon: <UserCheck className="w-6 h-6 text-white" />,
    //   color: "bg-gradient-to-br from-green-500 to-emerald-600",
    //   trend: "+5%",
    // },
    // {
    //   title: "Tidak Masuk Hari Ini",
    //   value: (stats.jumlah_siswa || 0) - (stats.total_hadir || 0),
    //   icon: <AlertCircle className="w-6 h-6 text-white" />,
    //   color: "bg-gradient-to-br from-red-500 to-pink-600",
    //   trend: "-2%",
    // },
    // {
    //   title: "Telat Hari Ini",
    //   value: stats.total_telat || 0,
    //   icon: <Clock className="w-6 h-6 text-white" />,
    //   color: "bg-gradient-to-br from-yellow-500 to-orange-500",
    //   trend: "-2%",
    // },
    // {
    //   title: "Tepat Waktu Hari Ini",
    //   value: stats.total_tepat_waktu || 0,
    //   icon: <CheckCircle className="w-6 h-6 text-white" />,
    //   color: "bg-gradient-to-br from-blue-500 to-cyan-600",
    //   trend: "+8%",
    // },
    {
      title: "Jumlah Guru",
      value: stats.jumlah_guru || 0,
      icon: <Award className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      trend: "+1",
    },
    {
      title: "Jumlah Mentor",
      value: stats.jumlah_mentor || 0,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      trend: "+3",
    },
    {
      title: institusiData.nama_institusi || "Institusi",
      value: (
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-white/80">
             {institusiData.total_siswa || 0}
          </p>
        </div>
      ),
      icon: <Building className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-teal-500 to-cyan-600",
      trend: "+2",
    },
    {
      title: "Total Siswa",
      value: allSiswaData.total_all_siswa || 0,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-emerald-500 to-green-600",
      trend: "+5",
    },
  ];

  const transformedTasks = tasks.map(task => ({
    title: task.judul || 'Tugas Tanpa Judul',
    dueDate: task.batas_waktu ? getTimeDifference(task.batas_waktu) : 'Tidak ada deadline',
    status: task.status_tugas === "Sudah Dinilai" ? "completed" as const : "pending" as const,
    score: task.nilai || 0,
    completedTime: task.tanggal_mengumpulkan ? formatTime(task.tanggal_mengumpulkan) : undefined,
    notes: task.catatan_siswa || task.deskripsi || 'Tidak ada catatan',
  }));

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          {error.includes('Unauthorized') || error.includes('login') ? (
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }} 
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors mr-2"
            >
              Login
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors"
            >
              Coba Lagi
            </button>
          )}
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
            Dashboard
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Selamat datang, {userName}! Berikut rekap hari ini.</p>
      </div>

      <Divider />

      {/* Statistics Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          <span>Statistik</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statsCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      <Divider />

      {/* Today's Attendance Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
          <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          <span>Absensi Hari Ini</span>
        </h2>
        <div className="max-w-2xl">
          {attendance.length > 0 ? (
            attendance.map((att, index) => (
              <AttendanceCard
                key={att.id}
                name={userName}
                email=""
                checkIn={att.waktu_checkin ? formatTime(att.waktu_checkin) : "Belum check-in"}
                lateTime={att.status_kehadiran || "Tepat waktu"}
                checkOut={att.waktu_checkout ? formatTime(att.waktu_checkout) : "-"}
              />
            ))
          ) : (
            <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 text-center">
              <UserCheck className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-400 text-sm sm:text-base">Belum ada data absensi hari ini</p>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* Today's Tasks Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          <span>Tugas Hari Ini</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {transformedTasks.length > 0 ? (
            transformedTasks.map((task, index) => (
              <TaskCard key={index} {...task} />
            ))
          ) : (
            <div className="col-span-1 lg:col-span-2 bg-gray-800/50 rounded-xl p-4 sm:p-6 text-center">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-400 text-sm sm:text-base">Tidak ada tugas untuk hari ini</p>
            </div>
          )}
        </div>
      </div>

      <Divider />
    </div>
  )
}

export default Dashboard
