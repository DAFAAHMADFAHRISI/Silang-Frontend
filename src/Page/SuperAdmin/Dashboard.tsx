import React, { useEffect, useState } from "react";
import Layout from "../../Layout/Layout";
import { Users, UserCheck, Clock, CheckCircle, TrendingUp, Calendar, Award, AlertCircle } from "lucide-react";

// StatCard diambil dari Dashboard siswa agar identik
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

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

const TaskCard = ({ title, dueDate, status, notes }: { title: string; dueDate: string; status: "pending" | "completed"; notes: string }) => {
  const statusConfig = {
    pending: {
      bg: "bg-gradient-to-br from-orange-500 to-red-500",
      icon: <AlertCircle className="w-5 h-5" />,
      statusText: "Pending",
    },
    completed: {
      bg: "bg-gradient-to-br from-blue-500 to-purple-600",
      icon: <CheckCircle className="w-5 h-5" />,
      statusText: "Completed",
    },
  };
  const config = statusConfig[status];
  return (
    <div className={`${config.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-lg leading-tight pr-4">{title}</h3>
        <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {config.icon}
          <span className="ml-1">{config.statusText}</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4" />
          <span>Due: {dueDate}</span>
        </div>
        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-sm leading-relaxed">{notes}</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [statsData, setStatsData] = useState({
    total_siswa_hadir: 0,
    total_siswa_telat: 0,
    total_siswa_tepat_waktu: 0,
    total_mentor: 0,
    total_siswa: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user name from localStorage
  const userName = localStorage.getItem('nama') || 'Super Admin';

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://localhost:3000/api/dashboard", {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Gagal mengambil data statistik");
        const data = await res.json();
        setStatsData(data);
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      title: "Hadir Hari Ini",
      value: statsData.total_siswa_hadir,
      icon: <UserCheck className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      trend: undefined,
    },
    {
      title: "Telat Hari Ini",
      value: statsData.total_siswa_telat,
      icon: <Clock className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      trend: undefined,
    },
    {
      title: "Tepat Waktu",
      value: statsData.total_siswa_tepat_waktu,
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      trend: undefined,
    },
    {
      title: "Jumlah Mentor",
      value: statsData.total_mentor,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      trend: undefined,
    },
    {
      title: "Jumlah Siswa",
      value: statsData.total_siswa,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      trend: undefined,
    },
  ];

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <span>Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Selamat datang, {userName}! Berikut rekap hari ini.</p>
        <hr className="border-gray-700 my-4" />
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <span className="text-white">Statistik</span>
        </h2>
        {loading ? (
          <div className="text-white">Loading...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} />
            ))}
          </div>
        )}
        <hr className="border-gray-700 mt-6" />
        <Divider />
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow-400" />
          <span className="text-white">Tugas & Pengumuman</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaskCard
            title="Verifikasi Data Institusi Baru"
            dueDate="Hari ini"
            status="pending"
            notes="Segera verifikasi data institusi yang baru mendaftar agar dapat menggunakan sistem."
          />
          <TaskCard
            title="Review Laporan Bulanan"
            dueDate="Minggu ini"
            status="completed"
            notes="Laporan bulanan sudah tersedia, silakan review dan arsipkan jika sudah sesuai."
          />
          <TaskCard
            title="Update Data Mentor"
            dueDate="2 hari lagi"
            status="pending"
            notes="Pastikan data mentor sudah diperbarui untuk semester baru."
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
