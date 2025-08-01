import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Users, AlertCircle } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-6 sm:my-8 w-full" />;

interface ReportData {
  id: number;
  name: string;
  institution: string;
  total_tasks: number;
  completed_tasks: number;
  total_value: number;
  average_value: number;
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
        <span className="text-gray-400">Total Tasks:</span>
        <span className="text-white font-medium">{data.total_tasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
        <span className="text-gray-400">Completed:</span>
        <span className="text-white font-medium">{data.completed_tasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
        <span className="text-gray-400">Total Value:</span>
        <span className="text-white font-medium">{data.total_value}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
        <span className="text-gray-400">Average:</span>
        <span className="text-white font-medium">{data.average_value.toFixed(2)}</span>
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
        setError('Please login to access report data');
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
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`Failed to fetch report data: ${response.status}`);
      }

      const data = await response.json();
      // Handle both single object and array responses
      const reportArray = Array.isArray(data) ? data : [data];
      setReportData(reportArray);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report data');
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
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={fetchReportData}
            className="bg-blue-500 hover:bg-blue-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
          >
            Try Again
          </button>
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
            Report
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Laporan performa dan statistik siswa.</p>
      </div>

      <Divider />

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          placeholder="Search by name or institution..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded focus:outline-none border border-gray-700 text-sm sm:text-base"
        />
      </div>

      <Divider />

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((data) => (
            <ReportCard key={data.id} data={data} />
          ))
        ) : (
          <div className="col-span-1 lg:col-span-2 bg-gray-800/50 rounded-xl p-4 sm:p-6 text-center">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-400 text-sm sm:text-base">
              {searchTerm ? 'No results found for your search.' : 'No report data available.'}
            </p>
          </div>
        )}
      </div>

      <Divider />
    </div>
  );
};

export default Report;
