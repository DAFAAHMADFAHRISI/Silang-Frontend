import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, UserCheck, AlertCircle, Loader2 } from 'lucide-react';

interface MentorSiswaDetail {
  id: number;
  nama_mentor: string;
  nama_siswa: string;
}

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detailData, setDetailData] = useState<MentorSiswaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMentorSiswaDetail();
    }
  }, [id]);

  const fetchMentorSiswaDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(`http://localhost:3000/api/mentor-siswa/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk mengakses data ini.');
      }
      
      if (response.status === 404) {
        throw new Error('Data tidak ditemukan.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDetailData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil detail data.';
      setError(errorMessage);
      console.error('Error fetching mentor-siswa detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Memuat detail mentor-siswa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <div className="flex space-x-3 justify-center">
              {error.includes('login') || error.includes('sesi') ? (
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Login Ulang
                </button>
              ) : (
                <button
                  onClick={fetchMentorSiswaDetail}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Coba Lagi
                </button>
              )}
              <button
                onClick={() => navigate('/DataMentorSiswa')}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-yellow-400 mb-4">Data tidak ditemukan</p>
            <button
              onClick={() => navigate('/DataMentorSiswa')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Kembali ke Data Mentor-Siswa
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
            onClick={() => navigate('/DataMentorSiswa')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Detail Mentor-Siswa
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Informasi lengkap hubungan mentor dengan siswa.</p>
      </div>

      <div className="space-y-6">
        {/* Detail Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mentor Information */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Informasi Mentor</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Nama Mentor:</span>
                <p className="text-white mt-1 text-lg font-semibold">{detailData.nama_mentor}</p>
              </div>

            </div>
          </div>

          {/* Student Information */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Informasi Siswa</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Nama Siswa:</span>
                <p className="text-white mt-1 text-lg font-semibold">{detailData.nama_siswa}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Status:</span>
                <p className="text-white mt-1 text-sm">
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Aktif
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Relationship Information */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-purple-400 flex items-center space-x-2">
            <UserCheck className="w-5 h-5" />
            <span>Informasi Hubungan</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400 text-sm">Mentor:</span>
                  <p className="text-white font-semibold">{detailData.nama_mentor}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Siswa:</span>
                  <p className="text-white font-semibold">{detailData.nama_siswa}</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-gray-400 text-sm">Status Hubungan:</span>
                  <p className="text-white font-semibold">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Mentor-Siswa
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pt-6">
          <button
            onClick={() => navigate(`/DataMentorSiswa/edit/${detailData.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Edit Data</span>
          </button>
          <button
            onClick={() => navigate('/DataMentorSiswa')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;