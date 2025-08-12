import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { BarChart3, PieChart, TrendingUp, Users, Calendar, Search, Eye, ArrowLeft } from 'lucide-react';

interface RekapData {
  siswa_id: number;
  nama: string;
  institusi: string;
  total_tugas: number;
  tugas_selesai: number;
  total_nilai: number;
  rata_nilai: number;
}

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rekap, setRekap] = useState<RekapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRekapDetail();
    }
  }, [id]);

  const fetchRekapDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      // Fetch all rekap data and find the specific one by ID
      const response = await fetch('http://localhost:3000/api/rekap-guru', {
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
      
      const data = await response.json();
      const rekapData = Array.isArray(data) ? data : [data];
      
      // Find the specific rekap by siswa_id
      const foundRekap = rekapData.find(rekap => rekap.siswa_id.toString() === id);
      
      if (!foundRekap) {
        throw new Error('Data rekap tidak ditemukan');
      }
      
      setRekap(foundRekap);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat detail rekap.';
      setError(errorMessage);
      console.error('Error fetching rekap detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (rataNilai: number) => {
    if (rataNilai >= 85) return 'bg-green-500 text-white';
    if (rataNilai >= 70) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getStatusText = (rataNilai: number) => {
    if (rataNilai >= 85) return 'Baik';
    if (rataNilai >= 70) return 'Cukup';
    return 'Perlu Perhatian';
  };

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 85) return 'text-green-400';
    if (nilai >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat detail rekap...</p>
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
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => navigate('/guru/rekap')} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Rekap
              </button>
            </div>
          </div>
        </div>
      
    );
  }

  if (!rekap) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-yellow-500 mx-auto mb-4">⚠️</div>
              <p className="text-yellow-400 mb-4">Data rekap tidak ditemukan</p>
              <button 
                onClick={() => navigate('/guru/rekap')} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Rekap
              </button>
            </div>
          </div>
        </div>
      
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => navigate('/guru/rekap')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Detail Rekap
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Informasi lengkap rekap akademik siswa.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Detail Rekap {rekap.nama}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rekap.rata_nilai)}`}>
              {getStatusText(rekap.rata_nilai)}
            </span>
          </div>

          <div className="space-y-6">
            {/* General Information */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Informasi Umum</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Nama Siswa:</span>
                  <p className="text-white mt-1 font-medium">{rekap.nama}</p>
                </div>
                <div>
                  <span className="text-gray-400">Institusi:</span>
                  <p className="text-white mt-1 font-medium">{rekap.institusi}</p>
                </div>
                <div>
                  <span className="text-gray-400">Status Akademik:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(rekap.rata_nilai)}`}>
                    {getStatusText(rekap.rata_nilai)}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-green-400">Performa Akademik</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Total Nilai:</span>
                  <p className="font-semibold text-lg mt-1 text-white">
                    {rekap.total_nilai}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Rata-rata Nilai:</span>
                  <p className={`font-semibold text-lg mt-1 ${getNilaiColor(rekap.rata_nilai)}`}>
                    {rekap.rata_nilai}
                  </p>
                </div>
              </div>
            </div>

            {/* Task Statistics */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Statistik Tugas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Total Tugas:</span>
                  <p className="text-white mt-1 font-medium">{rekap.total_tugas}</p>
                </div>
                <div>
                  <span className="text-gray-400">Tugas Selesai:</span>
                  <p className="text-green-400 mt-1 font-medium">{rekap.tugas_selesai}</p>
                </div>
                <div>
                  <span className="text-gray-400">Tugas Belum Selesai:</span>
                  <p className="text-red-400 mt-1 font-medium">{rekap.total_tugas - rekap.tugas_selesai}</p>
                </div>
                <div>
                  <span className="text-gray-400">Persentase Selesai:</span>
                  <p className="text-blue-400 mt-1 font-medium">
                    {rekap.total_tugas > 0 ? Math.round((rekap.tugas_selesai / rekap.total_tugas) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Visualisasi Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-600 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {rekap.total_tugas > 0 ? Math.round((rekap.tugas_selesai / rekap.total_tugas) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-300">Progress Tugas</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {rekap.tugas_selesai} dari {rekap.total_tugas} tugas
                  </div>
                </div>
                <div className="bg-gray-600 rounded-lg p-4 text-center">
                  <div className={`text-3xl font-bold mb-2 ${getNilaiColor(rekap.rata_nilai)}`}>
                    {rekap.rata_nilai}
                  </div>
                  <div className="text-sm text-gray-300">Rata-rata Nilai</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Total: {rekap.total_nilai}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
