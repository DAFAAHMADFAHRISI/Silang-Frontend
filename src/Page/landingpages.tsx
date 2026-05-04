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
  Activity
} from 'lucide-react';

interface DashboardData {
  institusi: any[];
  siswaAktif: { total: number };
  siswaTidakAktif: { total: number };
  siswaLulus: { total: number };
  guru: { total: number };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [institusiData, siswaAktifData, siswaTidakAktifData, siswaLulusData, guruData] = await Promise.all([
          landingPageAPI.getInstitusi(),
          landingPageAPI.getSiswaAktif(),
          landingPageAPI.getSiswaTidakAktif(),
          landingPageAPI.getSiswaLulus(),
          landingPageAPI.getGuru()
        ]);

        setData({
          institusi: institusiData,
          siswaAktif: siswaAktifData,
          siswaTidakAktif: siswaTidakAktifData,
          siswaLulus: siswaLulusData,
          guru: guruData
        });
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

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img
              src={process.env.PUBLIC_URL + '/LogoKominfo.png'}
              alt="Logo Kominfo"
              className="w-[115px] h-[100px] mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-white mb-4">
              Selamat Datang di<br />
              <span className="text-blue-400">
                Sistem Informasi Layanan Magang (SILANG)
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-300 mb-8">
              Aplikasi untuk mempermudah pengelolaan informasi magang antara siswa, pembimbing, dan instansi di Dinas Komunikasi dan Informatika Kabupaten Sampang.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                className="px-8 py-3 rounded-3xl border border-blue-600 bg-transparent text-blue-400 font-medium text-base cursor-pointer transition-colors duration-200 hover:bg-blue-600 hover:text-white"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="px-8 py-3 rounded-3xl border border-blue-600 bg-transparent text-blue-400 font-medium text-base cursor-pointer transition-colors duration-200 hover:bg-blue-600 hover:text-white"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* KPI Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Statistik Sistem</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KPICard
              title="Siswa Aktif"
              value={data?.siswaAktif.total || 0}
              icon={<Users className="w-6 h-6" />}
              color="text-green-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Siswa Tidak Aktif"
              value={data?.siswaTidakAktif.total || 0}
              icon={<UserCheck className="w-6 h-6" />}
              color="text-red-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Siswa Lulus"
              value={data?.siswaLulus.total || 0}
              icon={<Award className="w-6 h-6" />}
              color="text-purple-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Total Guru"
              value={data?.guru.total || 0}
              icon={<GraduationCap className="w-6 h-6" />}
              color="text-blue-400"
              bgColor="bg-gray-800"
            />
            <KPICard
              title="Institusi"
              value={data?.institusi.length || 0}
              icon={<Building2 className="w-6 h-6" />}
              color="text-yellow-400"
              bgColor="bg-gray-800"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-12">
          <BarChart
            data={barChartData}
            title="Distribusi Data Sistem"
          />
        </div>

        {/* Institusi Information */}
        {data?.institusi && data.institusi.length > 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500 bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-3 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  Informasi Institusi
                </h3>
                <p className="text-gray-400 text-lg">Daftar institusi yang terdaftar dalam sistem SILANG</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.institusi.map((institusi, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 hover:from-gray-600 hover:to-gray-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-gray-600 hover:border-blue-500 relative overflow-hidden"
                  >
                    {/* Card decoration */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full -translate-y-8 translate-x-8 group-hover:bg-opacity-30 transition-all duration-300"></div>

                    <div className="relative z-10">
                      <div className="flex items-start mb-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl mr-4 shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-blue-300 transition-colors duration-300">
                            {institusi.nama_institusi}
                          </h4>
                          <div className="flex items-start">
                            <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                            <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                              {institusi.alamat}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div className="flex items-center mt-4 pt-4 border-t border-gray-600">
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
                    <div className="text-2xl font-bold text-blue-400">{data.institusi.length}</div>
                    <div className="text-gray-400 text-sm">Total Institusi</div>
                  </div>
                  <div className="w-px h-8 bg-gray-600"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{data.institusi.length}</div>
                    <div className="text-gray-400 text-sm">Institusi Aktif</div>
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
