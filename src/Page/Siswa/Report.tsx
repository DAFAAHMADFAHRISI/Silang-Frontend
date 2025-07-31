import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Users, AlertCircle } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

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
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-700/50 mb-4">
    <div className="flex items-center space-x-4 mb-2">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Users className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-bold text-lg text-white mb-1">{data.name}</h3>
        <p className="text-gray-400 text-sm">{data.institution}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-yellow-400" />
        <span>Total Tasks: {data.total_tasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-blue-400" />
        <span>Completed: {data.completed_tasks}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-green-400" />
        <span>Total Value: {data.total_value}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Award className="w-4 h-4 text-purple-400" />
        <span>Average: {data.average_value.toFixed(2)}</span>
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
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data laporan...</p>
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Student Task Report
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Laporan tugas dan nilai siswa.</p>
      </div>
      <Divider />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none border border-gray-700 w-full md:w-64"
        />
        <button 
          onClick={fetchReportData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <span className="mr-1">⟳</span> Refresh
        </button>
      </div>
      <Divider />
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <span>Report Siswa</span>
        </h2>
        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredData.map((data, idx) => (
              <ReportCard key={data.id || idx} data={data} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl p-6 text-center">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Tidak ada data laporan'}
            </p>
          </div>
        )}
      </div>
      <Divider />
      {filteredData.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full bg-gray-900 border border-gray-700 text-white">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-2 py-3 text-left">#</th>
                  <th className="px-2 py-3 text-left">Name</th>
                  <th className="px-2 py-3 text-left">Institution</th>
                  <th className="px-2 py-3 text-left">Total Tasks</th>
                  <th className="px-2 py-3 text-left">Completed Tasks</th>
                  <th className="px-2 py-3 text-left">Total Value</th>
                  <th className="px-2 py-3 text-left">Average Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((data, idx) => (
                  <tr key={data.id || idx} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="px-2 py-2">{idx + 1}</td>
                    <td className="px-2 py-2">{data.name}</td>
                    <td className="px-2 py-2">{data.institution}</td>
                    <td className="px-2 py-2">{data.total_tasks}</td>
                    <td className="px-2 py-2">{data.completed_tasks}</td>
                    <td className="px-2 py-2">{data.total_value}</td>
                    <td className="px-2 py-2">{data.average_value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Divider />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-white">Rows:</span>
              <select className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700">
                <option>10</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-gray-800 text-gray-400 px-3 py-2 rounded" disabled>{'<<'}</button>
              <span className="text-white">Page 1 of 1</span>
              <button className="bg-gray-800 text-gray-400 px-3 py-2 rounded" disabled>{'>>'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Report;
