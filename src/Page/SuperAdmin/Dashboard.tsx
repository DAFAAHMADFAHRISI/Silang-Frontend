import React from "react";
import Layout from "../../Layout/Layout";
import { Users, UserCheck, Clock, CheckCircle, TrendingUp } from "lucide-react";

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

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: "Hadir Hari Ini",
      value: 1,
      icon: <UserCheck className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      trend: undefined,
    },
    {
      title: "Telat Hari Ini",
      value: 1,
      icon: <Clock className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      trend: undefined,
    },
    {
      title: "Tepat Waktu",
      value: 0,
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      trend: undefined,
    },
    {
      title: "Jumlah Mentor",
      value: 1,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      trend: undefined,
    },
    {
      title: "Jumlah Siswa",
      value: 1,
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
        <p className="text-gray-400 mt-2 ml-5">Welcome back! Here's what's happening today.</p>
        <hr className="border-gray-700 my-4" />
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <span className="text-white">Statistik</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
        <hr className="border-gray-700 mt-6" />
      </div>
    </Layout>
  );
};

export default Dashboard;
