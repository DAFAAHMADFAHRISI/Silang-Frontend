import React, { useState, useEffect } from "react";

import { BarChart3, TrendingUp, Award, Users, FileText, Target, RefreshCw, Search, Star, CheckCircle, Building } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface MentorRekap {
  id: number;
  name: string;
  institution: string;
  total_tasks: number;
  completed_tasks: number;
  total_value: number;
  average_value: number;
}

const DataRekapMentor: React.FC = () => {
  const [rekapData, setRekapData] = useState<MentorRekap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchRekapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/api/rekap-mentor', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      const data: MentorRekap[] = await response.json();
      console.log('Debug - Rekap API Response:', data);
      
      setRekapData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data rekap.';
      setError(errorMessage);
      console.error('Error fetching rekap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'mentor') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchRekapData();
  }, []);

  const filteredRekap = rekapData.filter(mentor => {
    return mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           mentor.institution.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data rekap...</p>
          </div>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
              <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
              <div className="space-y-2">
                <button 
                  onClick={fetchRekapData} 
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Coba Lagi
                </button>
                <button 
                  onClick={() => navigate('/Login')} 
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors font-semibold ml-2"
                >
                  Login Ulang
                </button>
              </div>
            </div>
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-6 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Data Rekap Mentor
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchRekapData}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Analisis dan ringkasan performa mentor.</p>
        </div>

        <div className="border-t border-gray-700/50 my-8 w-full" />

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari mentor atau institusi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Rekap Data */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>Data Rekap Mentor ({filteredRekap.length})</span>
          </h2>
          
          {filteredRekap.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Tidak ada data rekap ditemukan.</p>
              <p className="text-gray-500 text-sm">Coba refresh data.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRekap.map((mentorRekap) => (
                <div key={mentorRekap.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {mentorRekap.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{mentorRekap.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Building className="w-4 h-4 text-gray-400" />
                          <p className="text-gray-400 text-sm">{mentorRekap.institution}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span className="text-lg font-bold text-yellow-400">
                        {mentorRekap.average_value}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300 text-sm font-medium">Total Tugas</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{mentorRekap.total_tasks}</p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300 text-sm font-medium">Selesai</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{mentorRekap.completed_tasks}</p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300 text-sm font-medium">Total Nilai</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{mentorRekap.total_value}</p>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 text-sm font-medium">Rata-rata</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-400">{mentorRekap.average_value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    
  );
};

export default DataRekapMentor;
