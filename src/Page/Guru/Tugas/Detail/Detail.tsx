import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { FileText, Clock, CheckCircle, AlertCircle, Eye, Search, ArrowLeft } from 'lucide-react';

interface TaskSubmission {
  siswa_id: number;
  siswa_nama: string;
  file_jawaban: string;
  tanggal_mengumpulkan: string;
  nilai: number;
  catatan_siswa: string;
  catatan_guru: string;
  status: string;
}

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  priority: string;
  file_tugas: string;
  waktu_diberikan: string;
  batas_waktu: string;
  created_at: string;
  updated_at: string;
  mentor_nama: string;
  total_submissions: number;
  total_graded: number;
  penerima_tugas: TaskSubmission[];
}

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchTaskDetail();
    }
  }, [id]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      // Fetch all tasks and find the specific one by ID
      const response = await fetch('http://localhost:3000/api/tugas-guru', {
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
      const tasks = Array.isArray(data) ? data : [data];
      
      // Find the specific task by ID
      const foundTask = tasks.find(task => task.id.toString() === id);
      
      if (!foundTask) {
        throw new Error('Tugas tidak ditemukan');
      }
      
      setTask(foundTask);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat detail tugas.';
      setError(errorMessage);
      console.error('Error fetching task detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sudah Dinilai':
        return 'bg-green-500 text-white';
      case 'Belum Dinilai':
        return 'bg-yellow-500 text-white';
      case 'Belum Dikumpulkan':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat detail tugas...</p>
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
              <button 
                onClick={() => navigate('/guru/tugas')} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Tugas
              </button>
            </div>
          </div>
        </div>
      
    );
  }

  if (!task) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-yellow-400 mb-4">Tugas tidak ditemukan</p>
              <button 
                onClick={() => navigate('/guru/tugas')} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Tugas
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
              onClick={() => navigate('/guru/tugas')}
              className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Kembali</span>
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Detail Tugas
            </h1>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Informasi lengkap tugas dan submission siswa.</p>
        </div>

        <div className="space-y-6">
          {/* Task Information */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{task.judul}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            
            <div className="space-y-6">
              {/* Task Information */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-blue-400">Informasi Tugas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Deskripsi:</span>
                    <p className="text-white mt-1">{task.deskripsi}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">File Tugas:</span>
                    <p className="text-white mt-1">{task.file_tugas}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Mentor:</span>
                    <p className="text-white mt-1">{task.mentor_nama}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Waktu Diberikan:</span>
                    <p className="text-white mt-1">{formatDate(task.waktu_diberikan)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Batas Waktu:</span>
                    <p className="text-white mt-1">{formatDate(task.batas_waktu)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Progress:</span>
                    <p className="text-white mt-1">{task.total_graded}/{task.total_submissions} dinilai</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <p className="text-white mt-1">{formatDate(task.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Submissions Section */}
              {task.penerima_tugas.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-green-400">
                    Submissions ({task.penerima_tugas.length})
                  </h3>
                  <div className="space-y-4">
                    {task.penerima_tugas.map((submission, index) => (
                      <div key={index} className="bg-gray-600 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{submission.siswa_nama}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                            {submission.nilai > 0 && (
                              <span className="bg-white/20 px-3 py-1 rounded text-sm font-medium">
                                Nilai: {submission.nilai}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">File Jawaban:</span>
                            <p className="text-white mt-1">{submission.file_jawaban || 'Belum ada file'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Tanggal Submit:</span>
                            <p className="text-white mt-1">
                              {submission.tanggal_mengumpulkan 
                                ? formatDate(submission.tanggal_mengumpulkan)
                                : 'Belum dikumpulkan'
                              }
                            </p>
                          </div>
                          {submission.catatan_siswa && (
                            <div className="md:col-span-2">
                              <span className="text-gray-400">Catatan Siswa:</span>
                              <p className="text-blue-300 mt-1">{submission.catatan_siswa}</p>
                            </div>
                          )}
                          {submission.catatan_guru && (
                            <div className="md:col-span-2">
                              <span className="text-gray-400">Catatan Guru:</span>
                              <p className="text-yellow-300 mt-1">{submission.catatan_guru}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {task.penerima_tugas.length === 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-400">Submissions</h3>
                  <p className="text-gray-400">Belum ada siswa yang mengumpulkan tugas ini.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default Detail;
