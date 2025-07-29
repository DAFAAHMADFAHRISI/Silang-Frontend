import React, { useState, useEffect } from 'react';
import Layout from '../../Layout/Layout';
import { useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Search } from 'lucide-react';

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

const DataTugas: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'guru') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
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
      setTasks(Array.isArray(data) ? data : [data]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data tugas.';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
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

  const filteredTasks = tasks.filter(task =>
    task.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (task: Task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
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
      <Layout>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data tugas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={fetchTasks} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-6 mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Data Tugas
            </h1>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Kelola semua tugas dan submission siswa.</p>
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div key={task.id} className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-lg leading-tight pr-4">{task.judul}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">{task.deskripsi}</p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Deadline: {formatDate(task.batas_waktu)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Progress: {task.total_graded}/{task.total_submissions}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>File: {task.file_tugas}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400">Mentor:</span>
                  <span>{task.mentor_nama}</span>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-3">
                  <button 
                    onClick={() => handleViewDetail(task)}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detail</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Tidak ada tugas ditemukan</p>
            <p className="text-gray-500 text-sm mt-2">Coba ubah pencarian atau tambah tugas baru</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedTask.judul}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Task Information */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-400">Informasi Tugas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Deskripsi:</span>
                      <p className="text-white mt-1">{selectedTask.deskripsi}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">File Tugas:</span>
                      <p className="text-white mt-1">{selectedTask.file_tugas}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Mentor:</span>
                      <p className="text-white mt-1">{selectedTask.mentor_nama}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Waktu Diberikan:</span>
                      <p className="text-white mt-1">{formatDate(selectedTask.waktu_diberikan)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Batas Waktu:</span>
                      <p className="text-white mt-1">{formatDate(selectedTask.batas_waktu)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Progress:</span>
                      <p className="text-white mt-1">{selectedTask.total_graded}/{selectedTask.total_submissions} dinilai</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <p className="text-white mt-1">{formatDate(selectedTask.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Submissions Section */}
                {selectedTask.penerima_tugas.length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-green-400">
                      Submissions ({selectedTask.penerima_tugas.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedTask.penerima_tugas.map((submission, index) => (
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

                {selectedTask.penerima_tugas.length === 0 && (
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 text-yellow-400">Submissions</h3>
                    <p className="text-gray-400">Belum ada siswa yang mengumpulkan tugas ini.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DataTugas;
