import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { landingPageAPI } from '../services/api';
import KPICard from '../components/LandingPage/KPICard';
import BarChart from '../components/LandingPage/BarChart';
import DonutChart from '../components/LandingPage/DonutChart';
import { 
  Users, 
  GraduationCap, 
  Building2, 
  UserCheck,
  TrendingUp,
  Activity
} from 'lucide-react';

interface DashboardData {
  institusi: any[];
  siswaAktif: { total: number };
  siswaTidakAktif: { total: number };
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
        const [institusiData, siswaAktifData, siswaTidakAktifData, guruData] = await Promise.all([
          landingPageAPI.getInstitusi(),
          landingPageAPI.getSiswaAktif(),
          landingPageAPI.getSiswaTidakAktif(),
          landingPageAPI.getGuru()
        ]);

        setData({
          institusi: institusiData,
          siswaAktif: siswaAktifData,
          siswaTidakAktif: siswaTidakAktifData,
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
    { name: 'Guru', value: data.guru.total },
    { name: 'Institusi', value: data.institusi.length }
  ] : [];

  const donutChartData = data ? [
    { name: 'Siswa Aktif', value: data.siswaAktif.total, color: '#10B981' },
    { name: 'Siswa Tidak Aktif', value: data.siswaTidakAktif.total, color: '#EF4444' },
    { name: 'Guru', value: data.guru.total, color: '#3B82F6' },
    { name: 'Institusi', value: data.institusi.length, color: '#F59E0B' }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <BarChart
            data={barChartData}
            title="Distribusi Data Sistem"
          />
          <DonutChart
            data={donutChartData}
            title="Persentase Data Sistem"
          />
        </div>

        {/* Institusi Information */}
        {data?.institusi && data.institusi.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Informasi Institusi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.institusi.map((institusi, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-5 hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex items-start mb-3">
                    <div className="bg-blue-500 bg-opacity-20 p-2 rounded-lg mr-3">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2 leading-tight">
                        {institusi.nama_institusi}
                      </h4>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {institusi.alamat}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-6 mt-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300 text-sm">
            © 2025 SILANG - Sistem Informasi Layanan Magang.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
