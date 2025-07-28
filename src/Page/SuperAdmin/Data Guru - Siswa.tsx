import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, Camera, User, UserCheck, Eye, Plus, Edit, Trash2 } from 'lucide-react';

interface GuruSiswa {
  id: number;
  nama_guru: string;
  nama_siswa: string;
}

interface GuruSiswaDetail {
  id: number;
  nama_guru: string;
  nama_siswa: string;
}

interface GuruSiswaForm {
  guru_id: string;
  siswa_id: string;
}

const DataGuruSiswa: React.FC = () => {
  const [guruSiswaData, setGuruSiswaData] = useState<GuruSiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<GuruSiswaDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GuruSiswaDetail | null>(null);
  const [formData, setFormData] = useState<GuruSiswaForm>({
    guru_id: '',
    siswa_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      setError('Anda harus login terlebih dahulu.');
      setLoading(false);
      return;
    }

    if (role !== 'superadmin') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchGuruSiswaData();
  }, []);

  const fetchGuruSiswaData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/guru-siswa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk mengakses data ini.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setGuruSiswaData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil data guru-siswa.';
      setError(errorMessage);
      console.error('Error fetching guru-siswa data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuruSiswaById = async (id: number) => {
    try {
      setDetailLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(`http://localhost:3000/api/guru-siswa/${id}`, {
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
      setSelectedRecord(data);
      setShowDetailModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil detail data.';
      alert(errorMessage);
      console.error('Error fetching guru-siswa detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddGuruSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.guru_id || !formData.siswa_id) {
      alert('Mohon isi semua field yang diperlukan.');
      return;
    }

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const formBody = new URLSearchParams();
      formBody.append('guru_id', formData.guru_id);
      formBody.append('siswa_id', formData.siswa_id);

      const response = await fetch('http://localhost:3000/api/guru-siswa/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body: formBody,
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
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Data berhasil ditambahkan:', data);
      
      // Reset form and close modal
      setFormData({ guru_id: '', siswa_id: '' });
      setShowAddModal(false);
      
      // Refresh data
      await fetchGuruSiswaData();
      
      alert('Data guru-siswa berhasil ditambahkan!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambahkan data guru-siswa.';
      alert(errorMessage);
      console.error('Error adding guru-siswa:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGuruSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRecord || !formData.guru_id || !formData.siswa_id) {
      alert('Mohon isi semua field yang diperlukan.');
      return;
    }

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const formBody = new URLSearchParams();
      formBody.append('guru_id', formData.guru_id);
      formBody.append('siswa_id', formData.siswa_id);

      const response = await fetch(`http://localhost:3000/api/guru-siswa/update/${editingRecord.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body: formBody,
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
      console.log('Data berhasil diupdate:', data);
      
      // Reset form and close modal
      setFormData({ guru_id: '', siswa_id: '' });
      setShowEditModal(false);
      setEditingRecord(null);
      
      // Refresh data
      await fetchGuruSiswaData();
      
      alert('Data guru-siswa berhasil diupdate!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate data guru-siswa.';
      alert(errorMessage);
      console.error('Error updating guru-siswa:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGuruSiswa = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(`http://localhost:3000/api/guru-siswa/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
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
      console.log('Data berhasil dihapus:', data);
      
      // Refresh data
      await fetchGuruSiswaData();
      
      alert('Data guru-siswa berhasil dihapus!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus data guru-siswa.';
      alert(errorMessage);
      console.error('Error deleting guru-siswa:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  // Group data by guru
  const groupByGuru = () => {
    const grouped: { [key: string]: GuruSiswa[] } = {};
    guruSiswaData.forEach(item => {
      if (!grouped[item.nama_guru]) {
        grouped[item.nama_guru] = [];
      }
      grouped[item.nama_guru].push(item);
    });
    return grouped;
  };

  const getGuruConfig = (guruName: string) => {
    const guruColors = {
      'Guru Satu': { bg: "bg-gradient-to-br from-blue-500 to-cyan-600", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Dua': { bg: "bg-gradient-to-br from-green-500 to-emerald-600", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Tiga': { bg: "bg-gradient-to-br from-purple-500 to-pink-600", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Empat': { bg: "bg-gradient-to-br from-yellow-500 to-orange-500", icon: <UserCheck className="w-5 h-5" /> },
      'Guru Lima': { bg: "bg-gradient-to-br from-red-500 to-pink-600", icon: <UserCheck className="w-5 h-5" /> },
    };
    
    return guruColors[guruName as keyof typeof guruColors] || {
      bg: "bg-gradient-to-br from-gray-500 to-gray-600",
      icon: <UserCheck className="w-5 h-5" />
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
            <div className="flex space-x-3">
              {error.includes('login') || error.includes('sesi') ? (
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  <i className="fa fa-sign-in mr-2"></i>
                  Login Ulang
                </button>
              ) : (
                <button
                  onClick={fetchGuruSiswaData}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  <i className="fa fa-refresh mr-2"></i>
                  Coba Lagi
                </button>
              )}
            </div>
            <div className="mt-4 text-gray-400 text-sm">
              <p><strong>Solusi yang mungkin:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Pastikan Anda sudah login dengan akun Super Admin</li>
                <li>Periksa apakah server API berjalan di localhost:3000</li>
                <li>Pastikan token autentikasi masih valid</li>
                <li>Hubungi administrator jika masalah berlanjut</li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const groupedData = groupByGuru();

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <span>Data Guru - Siswa</span>
        </h1>
        <p className="text-gray-400 mt-2 ml-5">Kelola dan pantau hubungan guru dengan siswa.</p>
        <hr className="border-gray-700 my-4" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Users className="w-6 h-6 text-blue-400" />
            <span className="text-white">Daftar Guru & Siswa</span>
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </button>
            <button
              onClick={fetchGuruSiswaData}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-300 transform hover:scale-105"
            >
              <i className="fa fa-refresh mr-2"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Guru Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedData).map(([guruName, students]) => {
            const guruConfig = getGuruConfig(guruName);
            return (
              <div key={guruName} className={`${guruConfig.bg} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg leading-tight pr-4">{guruName}</h3>
                  <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {guruConfig.icon}
                    <span className="ml-1">Guru</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <UserCheck className="w-4 h-4" />
                        <span>Jumlah Siswa: {students.length}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4" />
                        <span>Status: Aktif</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Daftar Siswa:</span>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      {students.map((student, index) => (
                        <div key={index} className="flex items-center justify-between text-sm mb-2 last:mb-0">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span>{student.nama_siswa}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => fetchGuruSiswaById(student.id)}
                              disabled={detailLoading}
                              className="bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors disabled:opacity-50"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingRecord(student);
                                setFormData({ guru_id: '3', siswa_id: '4' }); // Default values
                                setShowEditModal(true);
                              }}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteGuruSiswa(student.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center space-x-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {guruSiswaData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak Ada Data Guru-Siswa</h3>
            <p className="text-gray-500">Belum ada data hubungan guru-siswa yang tersedia saat ini.</p>
          </div>
        )}

        {/* Summary Section */}
        {guruSiswaData.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Ringkasan</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-6 h-6" />
                  <span className="font-semibold">Total Guru</span>
                </div>
                <p className="text-2xl font-bold mt-2">{Object.keys(groupedData).length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6" />
                  <span className="font-semibold">Total Siswa</span>
                </div>
                <p className="text-2xl font-bold mt-2">{guruSiswaData.length}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-4 text-white">
                <div className="flex items-center space-x-2">
                  <Users className="w-6 h-6" />
                  <span className="font-semibold">Rata-rata Siswa/Guru</span>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {Object.keys(groupedData).length > 0 
                    ? (guruSiswaData.length / Object.keys(groupedData).length).toFixed(1)
                    : '0'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Detail Guru-Siswa</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRecord(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>

              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{selectedRecord.id}</span>
                        </div>
                        <div>
                          <p className="text-gray-300 text-sm">ID Record</p>
                          <p className="text-white font-semibold">#{selectedRecord.id}</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-600 pt-3">
                        <div className="space-y-2">
                          <div>
                            <p className="text-gray-300 text-sm">Nama Guru</p>
                            <p className="text-white font-semibold">{selectedRecord.nama_guru}</p>
                          </div>
                          <div>
                            <p className="text-gray-300 text-sm">Nama Siswa</p>
                            <p className="text-white font-semibold">{selectedRecord.nama_siswa}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setSelectedRecord(null);
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Tambah Guru-Siswa</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ guru_id: '', siswa_id: '' });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleAddGuruSiswa} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Guru ID
                  </label>
                  <input
                    type="number"
                    value={formData.guru_id}
                    onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Siswa ID
                  </label>
                  <input
                    type="number"
                    value={formData.siswa_id}
                    onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: 4"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ guru_id: '', siswa_id: '' });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Menambahkan...' : 'Tambah'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Edit Guru-Siswa</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRecord(null);
                    setFormData({ guru_id: '', siswa_id: '' });
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <i className="fa fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleEditGuruSiswa} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Guru ID
                  </label>
                  <input
                    type="number"
                    value={formData.guru_id}
                    onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: 3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Siswa ID
                  </label>
                  <input
                    type="number"
                    value={formData.siswa_id}
                    onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: 4"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingRecord(null);
                      setFormData({ guru_id: '', siswa_id: '' });
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Mengupdate...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DataGuruSiswa;
