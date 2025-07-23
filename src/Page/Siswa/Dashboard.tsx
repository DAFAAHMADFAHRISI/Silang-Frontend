import type React from "react"
import { Users, UserCheck, Clock, CheckCircle, AlertCircle, Calendar, Mail, Award, TrendingUp } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
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

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <div
    className={`${color} rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
  >
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
)

const TaskCard: React.FC<TaskCardProps> = ({ title, dueDate, status, score, completedTime, notes }) => {
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
  }

  const config = statusConfig[status]

  return (
    <div
      className={`${config.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-lg leading-tight pr-4">{title}</h3>
        <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {config.icon}
          <span className="ml-1">{config.statusText}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Due: {dueDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4" />
            <span>Score: {score}</span>
          </div>
        </div>

        {completedTime && (
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Completed: {completedTime}</span>
          </div>
        )}

        <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
          <p className="text-sm leading-relaxed">{notes}</p>
        </div>
      </div>
    </div>
  )
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ name, email, checkIn, lateTime, checkOut }) => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-700/50">
    <div className="flex items-start space-x-4">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-2xl font-bold text-white">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <h3 className="font-bold text-xl text-white mb-1">{name}</h3>
          <div className="flex items-center space-x-2 text-gray-400">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <UserCheck className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">CHECK-IN</span>
            </div>
            <p className="text-sm font-bold text-white">{checkIn}</p>
          </div>

          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-400">LATE TIME</span>
            </div>
            <p className="text-sm font-bold text-red-400">{lateTime}</p>
          </div>

          <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-400">CHECK-OUT</span>
            </div>
            <p className="text-sm font-bold text-white">{checkOut}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: "Hadir Hari Ini",
      value: 1,
      icon: <UserCheck className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      trend: "+5%",
    },
    {
      title: "Telat Hari Ini",
      value: 0,
      icon: <Clock className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-orange-500",
      trend: "-2%",
    },
    {
      title: "Tepat Waktu",
      value: 1,
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      trend: "+8%",
    },
    {
      title: "Jumlah Mentor",
      value: 13,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-pink-600",
      trend: "+1",
    },
    {
      title: "Jumlah Siswa",
      value: 19,
      icon: <Users className="w-6 h-6 text-white" />,
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      trend: "+3",
    },
  ]

  const tasks = [
    {
      title: "Lakukan Analisis dan Desain Arsitektur Aplikasi Silang",
      dueDate: "42 menit yang lalu",
      status: "pending" as const,
      score: 0,
      notes: "Melakukan Analisis dan Desain Arsitektur Aplikasi Silang",
    },
    {
      title: "Buat SOP Si Aladin",
      dueDate: "dalam sehari",
      status: "completed" as const,
      score: 85,
      completedTime: "09:49:41 AM",
      notes: "Tutorial Si Aladin",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-1 px-6 pb-6">
      {/* Header */}
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Welcome back! Here's what's happening today.</p>
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

      {/* Today's Attendance Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <UserCheck className="w-6 h-6 text-green-400" />
          <span>Absensi Hari Ini</span>
        </h2>
        <div className="max-w-2xl">
          <AttendanceCard
            name="Dafa Ahmad Fahrisi"
            email="dafamangku@gmail.com"
            checkIn="06:56:37 AM"
            lateTime="0 jam 0 menit 0 detik"
            checkOut="-"
          />
        </div>
      </div>

      <Divider />

      {/* Today's Tasks Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-purple-400" />
          <span>Tugas Hari Ini</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tasks.map((task, index) => (
            <TaskCard key={index} {...task} />
          ))}
        </div>
      </div>

      <Divider />
    </div>
  )
}

export default Dashboard
