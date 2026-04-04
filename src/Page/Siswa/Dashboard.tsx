import type React from "react"
import { Users, UserCheck, Clock, CheckCircle, AlertCircle, Calendar, Mail, Award, TrendingUp, Building, Flame } from "lucide-react"
import { useState, useEffect } from "react"
import { landingPageAPI } from "../../services/api"

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
  checkInFace: string
  checkOutFace: string
  waktu_checkin: string
  waktu_checkout: string
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
  tanggal_absen?: string
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

interface MagangDatesData {
  id: number
  nama: string
  email: string
  tanggal_mulai_magang: string
  tanggal_selesai_magang: string
  status_magang: string
  nama_institusi: string
}

interface PointsSummary {
  total_points: number
  streak: {
    current_streak: number
    best_streak: number
    last_activity_date: string | null
  }
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

const AttendanceCard: React.FC<AttendanceCardProps> = ({ name, email, checkIn, lateTime, checkOut, checkInFace, checkOutFace, waktu_checkin, waktu_checkout }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAlt, setImageAlt] = useState<string>('');

  const openImageModal = (imageSrc: string, alt: string) => {
    setSelectedImage(imageSrc);
    setImageAlt(alt);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setImageAlt('');
  };

  return (
  <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 mb-4 sm:mb-6">
    {/* Header with user info and status */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm sm:text-base">{name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-white truncate">{name}</h3>
          {email && <p className="text-xs sm:text-sm text-gray-400 truncate">{email}</p>}
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
        lateTime.includes('Telat') || lateTime.includes('Terlambat') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
      }`}>
        {lateTime}
      </div>
    </div>
    
    {/* Check In/Out Times */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Check In:</span>
        <span className="font-medium text-white">{waktu_checkin}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Check Out:</span>
        <span className="font-medium text-white">{waktu_checkout}</span>
      </div>
    </div>

    {/* Face Images Section */}
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-300 mb-2">Foto Absensi</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Check In Face */}
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <span className="text-xs text-gray-400">Check In:</span>
          </div>
          {checkInFace && checkInFace !== '-' ? (
            <div className="relative cursor-pointer group" onClick={() => openImageModal(`http://localhost:3000/images/foto_absensi/${checkInFace}`, 'Check In Face')}>
              <img 
                src={`http://localhost:3000/images/foto_absensi/${checkInFace}`}
                alt="Check In Face"
                className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-600/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-32 sm:h-40 bg-gray-700/50 rounded-lg border border-gray-600/50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Gambar tidak tersedia</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-32 sm:h-40 bg-gray-700/50 rounded-lg border border-gray-600/50 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Belum ada foto</span>
            </div>
          )}
        </div>

        {/* Check Out Face */}
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <span className="text-xs text-gray-400">Check Out:</span>
          </div>
          {checkOutFace && checkOutFace !== '-' ? (
            <div className="relative cursor-pointer group" onClick={() => openImageModal(`http://localhost:3000/images/foto_absensi/${checkOutFace}`, 'Check Out Face')}>
              <img 
                src={`http://localhost:3000/images/foto_absensi/${checkOutFace}`}
                alt="Check Out Face"
                className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-600/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-32 sm:h-40 bg-gray-700/50 rounded-lg border border-gray-600/50 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Gambar tidak tersedia</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-32 sm:h-40 bg-gray-700/50 rounded-lg border border-gray-600/50 flex items-center justify-center">
              <span className="text-gray-500 text-sm">Belum ada foto</span>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Image Modal */}
    {selectedImage && (
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeImageModal}
      >
        <div className="relative max-w-4xl max-h-[90vh] w-full">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt={imageAlt}
            className="w-full h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
            {imageAlt}
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

const Dashboard: React.FC = () => {
  // Get user name and role from localStorage
  const userName = localStorage.getItem('nama') || 'Siswa';
  const userRole = localStorage.getItem('role') || 'siswa';

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
  const [magangDates, setMagangDates] = useState<MagangDatesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsSummary, setPointsSummary] = useState<PointsSummary>({ total_points: 0, streak: { current_streak: 0, best_streak: 0, last_activity_date: null }})

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

  const fetchPointsSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/siswa/points/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      const json = await response.json();
      if (json && json.success && json.data) {
        setPointsSummary({ total_points: json.data.total_points || 0, streak: json.data.streak || { current_streak: 0, best_streak: 0, last_activity_date: null } })
      }
    } catch (e) {
      // ignore
    }
  }

  // Fetch magang dates data
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
          fetchAllSiswaData(),
          fetchMagangDates(),
          fetchPointsSummary()
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

  // Transform API data to component props
  const statsCards = [
    {
      title: "Total Poin",
      value: pointsSummary.total_points,
      icon: <Award className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      trend: undefined,
    },
    {
      title: "Streak Beruntun",
      value: (
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold">{pointsSummary.streak.current_streak}</span>
          <span className="text-xs text-white/80">hari</span>
        </div>
      ),
      icon: <Flame className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-red-500 to-pink-600",
      trend: pointsSummary.streak.best_streak ? `Rekor: ${pointsSummary.streak.best_streak}` : undefined,
    },
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
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Selamat datang, {userName}! sebagai <span className="text-blue-400 font-semibold">{getRoleLabel(userRole)}</span>. Berikut rekap hari ini.</p>
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

      {/* Today's Activities Section - Side by Side */}
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Today's Attendance Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span>Absensi Hari Ini</span>
            </h2>
            <div>
              {attendance.filter((att) => {
                const today = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD local time
                const attDate = att.tanggal_absen || (att.waktu_checkin ? new Date(att.waktu_checkin).toLocaleDateString('en-CA') : '');
                return attDate === today;
              }).length > 0 ? (
                attendance.filter((att) => {
                  const today = new Date().toLocaleDateString('en-CA');
                  const attDate = att.tanggal_absen || (att.waktu_checkin ? new Date(att.waktu_checkin).toLocaleDateString('en-CA') : '');
                  return attDate === today;
                }).map((att, index) => (
                  <AttendanceCard
                    key={att.id}
                    name={userName}
                    email=""
                    checkIn={att.waktu_checkin ? (att.waktu_checkin.length === 8 ? att.waktu_checkin : formatTime(att.waktu_checkin)) : "Belum check-in"}
                    lateTime={att.status_kehadiran || "Tepat waktu"}
                    checkOut={att.waktu_checkout ? (att.waktu_checkout.length === 8 ? att.waktu_checkout : formatTime(att.waktu_checkout)) : "-"}
                    checkInFace={att.checkin_face}
                    checkOutFace={att.checkout_face}
                    waktu_checkin={att.waktu_checkin && att.waktu_checkin.length === 8 ? att.waktu_checkin : (att.waktu_checkin ? formatTime(att.waktu_checkin) : "Belum check-in")}
                    waktu_checkout={att.waktu_checkout && att.waktu_checkout.length === 8 ? att.waktu_checkout : (att.waktu_checkout ? formatTime(att.waktu_checkout) : "-")}
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

          {/* Today's Tasks Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
              <span>Tugas Hari Ini</span>
            </h2>
            <div>
              {transformedTasks.length > 0 ? (
                transformedTasks.map((task, index) => (
                  <TaskCard key={index} {...task} />
                ))
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 text-center">
                  <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">Tidak ada tugas untuk hari ini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Magang Dates Section */}
      {magangDates.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center space-x-2">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            <span>Informasi Magang</span>
          </h2>
          {magangDates.map((magangData, index) => {
            const progress = calculateMagangProgress(magangData);
            return (
              <div key={magangData.id || index} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/80 text-xs sm:text-sm font-medium">Tanggal Mulai</p>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {magangData.tanggal_mulai_magang ? formatDate(magangData.tanggal_mulai_magang) : 'Tidak ada data'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/80 text-xs sm:text-sm font-medium">Tanggal Selesai</p>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {magangData.tanggal_selesai_magang ? formatDate(magangData.tanggal_selesai_magang) : 'Tidak ada data'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/80 text-xs sm:text-sm font-medium">Total Hari</p>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {progress.totalDays} hari
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 sm:p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-white/80 text-xs sm:text-sm font-medium">Sisa Hari</p>
                      <div className="text-white font-bold text-sm sm:text-base">
                        {progress.remainingDays} hari
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Progress Magang - {magangData.nama_institusi}</h3>
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
                  <div className="mt-2 text-sm text-gray-400">
                    Status: <span className="text-white font-medium">{magangData.status_magang}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Divider />



      <Divider />
    </div>
  )
}

export default Dashboard
