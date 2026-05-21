import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Users, AlertCircle } from 'lucide-react';
import {
  SiswaLoading,
  SiswaError,
  SiswaPageHeader,
  SiswaDivider,
  SiswaSearchFilter,
  SISWA_PAGE_CLASS,
} from './components/SiswaLayout';

interface ReportData {
  id: number;
  name: string;
  institution: string;
  total_tasks: number;
  completed_tasks: number;
  total_value: number;
  average_value: number;
  total_attendance: number;
  present_days: number;
  absent_days: number;
}

const ReportCard = ({ data }: { data: ReportData }) => (
  <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
    <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-semibold text-white mb-1 truncate">{data.name}</h3>
        <p className="text-xs sm:text-sm text-gray-400 truncate">{data.institution}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
      <div className="flex items-center space-x-2">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
        <span className="text-gray-400">Total Tugas:</span>
        <span className="text-white font-medium">{data.total_tasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
        <span className="text-gray-400">Selesai:</span>
        <span className="text-white font-medium">{data.completed_tasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
        <span className="text-gray-400">Total Nilai:</span>
        <span className="text-white font-medium">{data.total_value}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
        <span className="text-gray-400">Rata-rata:</span>
        <span className="text-white font-medium">{data.average_value.toFixed(2)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
        <span className="text-gray-400">Total Absensi:</span>
        <span className="text-white font-medium">{data.total_attendance}</span>
      </div>
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
        <span className="text-gray-400">Hadir:</span>
        <span className="text-white font-medium">{data.present_days}</span>
      </div>
      <div className="flex items-center space-x-2">
        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
        <span className="text-gray-400">Tidak Hadir:</span>
        <span className="text-white font-medium">{data.absent_days}</span>
      </div>
    </div>
  </div>
);

const Report: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch report data
  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login untuk mengakses data laporan');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/rekap-siswa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Akses tidak diizinkan. Silakan login kembali.');
        }
        throw new Error(`Gagal mengambil data laporan: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data); // Debug log
      
      // Handle both single object and array responses
      const reportArray = Array.isArray(data) ? data : [data];
      
      // Add fallback values for attendance data if not provided by API
      const processedData = reportArray.map(item => ({
        ...item,
        total_attendance: item.total_attendance || 0,
        present_days: item.present_days || 0,
        absent_days: item.absent_days || 0
      }));
      
      setReportData(processedData);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchReportData();
  }, []);

  // Filter data based on search term
  const filteredData = reportData.filter(data =>
    data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.institution.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <SiswaLoading message="Memuat data laporan..." />;
  }

  if (error) {
    return <SiswaError error={error} onRetry={fetchReportData} />;
  }

  return (
    <div className={SISWA_PAGE_CLASS}>
      <SiswaPageHeader title="Report" subtitle="Laporan performa dan statistik siswa." />

      <SiswaDivider />

      <SiswaSearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Cari berdasarkan nama atau institusi..."
      />

      <SiswaDivider />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((data) => (
            <ReportCard key={data.id} data={data} />
          ))
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 text-center lg:col-span-2">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-400 text-sm sm:text-base">
              {searchTerm ? 'Tidak ada hasil yang ditemukan untuk pencarian Anda.' : 'Tidak ada data laporan yang tersedia.'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Report;
