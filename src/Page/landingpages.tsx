import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { landingPageAPI } from '../services/api';
import KPICard from '../components/LandingPage/KPICard';
import BarChart from '../components/LandingPage/BarChart';

import {
  Users,
  GraduationCap,
  Building2,
  UserCheck,
  Award,
  TrendingUp,
  Activity,
  Flame,
  Star,
  Medal,
  Crown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardData {
  institusi: any[];
  siswaAktif: { total: number };
  siswaTidakAktif: { total: number };
  siswaLulus: { total: number };
  guru: { total: number };
}

interface TopStreakStudent {
  id: number;
  nama: string;
  foto_profile: string | null;
  status: string;
  nama_institusi: string;
  streak_terbaik: number;
  streak_saat_ini: number;
  total_poin: number;
}

interface TopStreakYear {
  tahun: number;
  top_siswa: TopStreakStudent[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [topStreak, setTopStreak] = useState<TopStreakYear[]>([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [institusiData, siswaAktifData, siswaTidakAktifData, siswaLulusData, guruData, topStreakData] = await Promise.all([
          landingPageAPI.getInstitusi(),
          landingPageAPI.getSiswaAktif(),
          landingPageAPI.getSiswaTidakAktif(),
          landingPageAPI.getSiswaLulus(),
          landingPageAPI.getGuru(),
          landingPageAPI.getTopStreak().catch(() => ({ data: [] }))
        ]);

        setData({
          institusi: institusiData,
          siswaAktif: siswaAktifData,
          siswaTidakAktif: siswaTidakAktifData,
          siswaLulus: siswaLulusData,
          guru: guruData
        });

        setTopStreak(topStreakData.data || []);
        // Default to the newest year (last index since sorted ascending)
        if (topStreakData.data && topStreakData.data.length > 0) {
          setSelectedYearIndex(topStreakData.data.length - 1);
        }
      } catch (err) {
        setError('Gagal memuat data dashboard');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare chart data
  const barChartData = data ? [
    { name: 'Siswa Aktif', value: data.siswaAktif.total },
    { name: 'Siswa Tidak Aktif', value: data.siswaTidakAktif.total },
    { name: 'Siswa Lulus', value: data.siswaLulus.total },
    { name: 'Guru', value: data.guru.total },
    { name: 'Institusi', value: data.institusi.length }
  ] : [];

  const getMedalStyle = (rank: number) => {
    switch (rank) {
      case 0: return {
        gradient: 'from-blue-400 via-sky-400 to-blue-600',
        border: 'border-blue-400/60',
        glow: 'shadow-blue-500/30',
        text: 'text-blue-400',
        bg: 'bg-blue-400/10',
        icon: <Crown className="w-6 h-6" />,
        label: '🥇 1st'
      };
      case 1: return {
        gradient: 'from-blue-500 via-sky-500 to-indigo-500',
        border: 'border-blue-500/40',
        glow: 'shadow-blue-500/20',
        text: 'text-blue-400/90',
        bg: 'bg-blue-500/10',
        icon: <Medal className="w-6 h-6" />,
        label: '🥈 2nd'
      };
      case 2: return {
        gradient: 'from-blue-600 via-indigo-600 to-indigo-800',
        border: 'border-blue-600/30',
        glow: 'shadow-blue-600/10',
        text: 'text-blue-500',
        bg: 'bg-blue-600/10',
        icon: <Star className="w-6 h-6" />,
        label: '🥉 3rd'
      };
      default: return {
        gradient: 'from-blue-400 to-blue-600',
        border: 'border-blue-400/50',
        glow: 'shadow-blue-500/20',
        text: 'text-blue-400',
        bg: 'bg-blue-400/10',
        icon: <Star className="w-5 h-5" />,
        label: `#${rank + 1}`
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-300 mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const currentYearData = topStreak[selectedYearIndex] || null;

  const getRankLayoutClass = (rank: number, total: number) => {
    if (total < 3) return '';
    if (rank === 0) return 'md:col-start-2 md:row-start-1 md:-mt-4 md:mb-4';
    if (rank === 1) return 'md:col-start-1 md:row-start-1';
    if (rank === 2) return 'md:col-start-3 md:row-start-1';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col justify-between">
      {/* Header Section */}
      <div className="py-8 sm:py-12 border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img
              src={process.env.PUBLIC_URL + '/LogoKominfo.png'}
              alt="Logo Kominfo"
              className="w-[90px] h-[78px] sm:w-[115px] sm:h-[100px] mx-auto mb-6"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Selamat Datang di<br />
              <span className="text-blue-400">
                Sistem Informasi Layanan Magang (SILANG)
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300 mb-8 px-4">
              Aplikasi untuk mempermudah pengelolaan informasi magang antara siswa, pembimbing, dan instansi di Dinas Komunikasi dan Informatika Kabupaten Sampang.
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center">
              <button
                className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-3xl border border-blue-600 bg-transparent text-blue-400 font-medium text-sm sm:text-base cursor-pointer transition-colors duration-200 hover:bg-blue-600 hover:text-white"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-3xl border border-blue-600 bg-transparent text-blue-400 font-medium text-sm sm:text-base cursor-pointer transition-colors duration-200 hover:bg-blue-600 hover:text-white"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* KPI Cards */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 text-center">Statistik Sistem</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            <KPICard
              title="Siswa Aktif"
              value={data?.siswaAktif.total || 0}
              icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="text-green-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Siswa Tidak Aktif"
              value={data?.siswaTidakAktif.total || 0}
              icon={<UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="text-red-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Siswa Lulus"
              value={data?.siswaLulus.total || 0}
              icon={<Award className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="text-purple-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Total Guru"
              value={data?.guru.total || 0}
              icon={<GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="text-blue-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Institusi"
              value={data?.institusi.length || 0}
              icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="text-yellow-400"
              bgColor="bg-gray-800"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8 sm:mb-12">
          <BarChart
            data={barChartData}
            title="Distribusi Data Sistem"
          />
        </div>

        {/* ===== HALL OF FAME - TOP 3 PET STREAK PER TAHUN ===== */}
        {topStreak.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-gradient-to-br from-gray-800 via-gray-850 to-gray-900 rounded-2xl p-4 sm:p-8 shadow-2xl border border-gray-700 relative overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 bg-opacity-5 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-500 bg-opacity-5 rounded-full translate-y-16 -translate-x-16"></div>
              <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500 bg-opacity-[0.03] rounded-full -translate-x-1/2 -translate-y-1/2"></div>

              <div className="relative z-10">
                {/* Section Title */}
                <div className="text-center mb-8">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600 bg-clip-text text-transparent uppercase tracking-wider mb-2">
                    Top 3 Siswa Pet Streak Terbaik
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base">Setiap Periode Magang</p>
                </div>

                {/* Year Selector - Single Year Display */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <button
                    onClick={() => setSelectedYearIndex(Math.max(0, selectedYearIndex - 1))}
                    disabled={selectedYearIndex === 0}
                    className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${selectedYearIndex === 0
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700 active:scale-95'
                      }`}
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl shadow-lg shadow-blue-500/25">
                    <span className="text-white font-bold text-sm sm:text-lg">
                      {currentYearData?.tahun || '—'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedYearIndex(Math.min(topStreak.length - 1, selectedYearIndex + 1))}
                    disabled={selectedYearIndex === topStreak.length - 1}
                    className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${selectedYearIndex === topStreak.length - 1
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700 active:scale-95'
                      }`}
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Top 3 Cards */}
                {currentYearData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {currentYearData.top_siswa.map((student, rank) => {
                      const medal = getMedalStyle(rank);
                      const totalStudents = currentYearData.top_siswa.length;
                      const layoutClass = getRankLayoutClass(rank, totalStudents);
                      return (
                        <div
                          key={student.id}
                          className={`group relative bg-gradient-to-br from-gray-700/80 to-gray-800/80 rounded-2xl p-4 sm:p-6 border ${medal.border} hover:border-opacity-100 transition-all duration-500 transform hover:-translate-y-3 hover:shadow-2xl ${medal.glow} backdrop-blur-sm ${layoutClass}`}
                          style={{
                            order: rank === 0 ? -1 : rank,
                          }}
                        >
                          {/* Glow effect on hover */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${medal.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>

                          <div className="relative z-10 text-center flex flex-col items-center">
                            {/* Medal Icon Badge */}
                            <div className={`inline-flex items-center gap-1.5 ${medal.bg} ${medal.text} px-3 py-1 rounded-full text-xs font-extrabold mb-4 shadow-sm`}>
                              {medal.icon}
                              <span>{medal.label}</span>
                            </div>

                            {/* Student Name */}
                            <h4 className={`${medal.text} font-bold text-base sm:text-lg mb-1 group-hover:brightness-125 transition-all duration-300 line-clamp-2 min-h-[3.5rem] w-full`}>
                              {student.nama}
                            </h4>

                            {/* Institution */}
                            <p className="text-gray-400 text-[10px] sm:text-xs mb-4 truncate w-full">
                              {student.nama_institusi || 'Institusi Tidak Diketahui'}
                            </p>

                            {/* Stats */}
                            <div className="space-y-2 w-full">
                              <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
                                <div className="flex items-center gap-2">
                                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                                  <span className="text-gray-400 text-[10px] sm:text-xs">Best Streak</span>
                                </div>
                                <span className="text-orange-400 font-bold text-xs sm:text-sm">{student.streak_terbaik} hari</span>
                              </div>
                              <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                                  <span className="text-gray-400 text-[10px] sm:text-xs">Total Poin</span>
                                </div>
                                <span className="text-green-400 font-bold text-xs sm:text-sm">{student.total_poin} pts</span>
                              </div>
                              {currentYearData.tahun === new Date().getFullYear() && (
                                <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5">
                                  <div className="flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                                    <span className="text-gray-400 text-[10px] sm:text-xs">Streak Saat Ini</span>
                                  </div>
                                  <span className="text-blue-400 font-bold text-xs sm:text-sm">{student.streak_saat_ini} hari</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reorder for mobile: show 1st place at top */}
                <style>{`
                  @media (max-width: 768px) {
                    .grid > div[style*="order: -1"] {
                      order: -1 !important;
                    }
                  }
                  @media (min-width: 768px) {
                    .grid > div {
                      order: unset !important;
                    }
                  }
                `}</style>

                {/* Summary footer */}
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                  <div className="flex items-center justify-center gap-6 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-400/60" />
                      <span>Peringkat berdasarkan streak terbaik selama periode magang</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Institusi Information */}
        {data?.institusi && data.institusi.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-8 shadow-2xl border border-gray-700 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500 bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 shadow-lg">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  Informasi Institusi
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">Daftar institusi yang terdaftar dalam sistem SILANG</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {data.institusi.map((institusi, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 sm:p-6 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-gray-600 hover:border-blue-500 relative overflow-hidden"
                  >
                    {/* Card decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full -translate-y-8 translate-x-8 group-hover:bg-opacity-30 transition-all duration-300"></div>

                    <div className="relative z-10">
                      <div className="flex items-start mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                          <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg sm:text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors duration-300">
                            {institusi.nama_institusi}
                          </h4>
                          <div className="flex items-start">
                            <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                              {institusi.alamat}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-gray-600">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-green-400 text-xs font-medium">Aktif</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary section */}
              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-400">{data.institusi.length}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Total Institusi</div>
                  </div>
                  <div className="w-px h-8 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-400">{data.institusi.length}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">Institusi Aktif</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 mt-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2026 SILANG - Sistem Informasi Layanan Magang.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
