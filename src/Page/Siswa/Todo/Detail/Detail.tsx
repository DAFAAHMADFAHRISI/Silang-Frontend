import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Award,
  Users,
  Clock,
  Search,
  Filter,
  RefreshCw,
  X,
  FileText,
  Download,
  Eye,
  Plus,
  Upload,
  Send,
  ArrowLeft
} from 'lucide-react';
import { SiswaLoading, SiswaError, SISWA_PAGE_CLASS } from '../../components/SiswaLayout';
import { getDeadlineStatus, isDeadlineLate } from '../../../../utils/deadlineStatus';

// ============================================================================
// INTERFACES
// ============================================================================

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  priority: string;
  file_tugas: string;
  waktu_diberikan: string;
  batas_waktu: string;
  file_jawaban: string;
  tanggal_mengumpulkan: string;
  nilai: number;
  catatan_siswa: string;
  catatan_guru: string;
  mentor_nama: string;
  status_tugas: string;
  status?: string;
}

interface SelectedFile {
  name: string;
  content: string;
  type: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Detail: React.FC = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task data
  const [task, setTask] = useState<Task | null>(null);

  // File viewer states
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchTaskDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3000/api/tugas-siswa/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch task details: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setTask(data.data);
      } else {
        setError('Task not found');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tidak ada tanggal';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Format tanggal tidak valid';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, {
      bg: string;
      icon: React.ReactElement;
      statusText: string;
      color: string
    }> = {
      'In Progress': {
        bg: 'bg-gradient-to-br from-orange-500 to-red-500',
        icon: <AlertCircle className="w-5 h-5" />,
        statusText: 'Sedang Dikerjakan',
        color: 'text-orange-400'
      },
      'Sudah Dinilai': {
        bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
        icon: <CheckCircle className="w-5 h-5" />,
        statusText: 'Sudah Dinilai',
        color: 'text-blue-400'
      },
      'Belum Dinilai': {
        bg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        icon: <Clock className="w-5 h-5" />,
        statusText: 'Belum Dinilai',
        color: 'text-yellow-400'
      },
    };
    return configs[status] || configs['In Progress'];
  };

  // ============================================================================
  // FILE HANDLING FUNCTIONS
  // ============================================================================

  const handleDownloadFile = async (fileName: string, fileType: 'task' | 'answer') => {
    try {
      if (!task) {
        console.error('Task data not available');
        return;
      }

      setFileLoading(true);

      const token = localStorage.getItem('token');
      const fileUrl = fileType === 'task'
        ? `http://localhost:3000/api/tugas-siswa/${task.id}/download-task`
        : `http://localhost:3000/api/tugas-siswa/${task.id}/download-answer`;

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`File ${fileName} downloaded successfully`);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleViewFile = async (fileName: string, fileType: 'task' | 'answer') => {
    try {
      if (!task) {
        console.error('Task data not available');
        return;
      }

      setFileLoading(true);

      const token = localStorage.getItem('token');
      const fileUrl = fileType === 'task'
        ? `http://localhost:3000/api/tugas-siswa/${task.id}/view-task`
        : `http://localhost:3000/api/tugas-siswa/${task.id}/view-answer`;

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to view file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // For PDF files, open in new tab
      if (fileName.toLowerCase().endsWith('.pdf')) {
        window.open(url, '_blank');
      } else {
        // For other file types, show in modal
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedFile({
            name: fileName,
            content: e.target?.result as string,
            type: fileType
          });
          setFileViewerOpen(true);
        };
        reader.readAsText(blob);
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to view file. Please try again.');
    } finally {
      setFileLoading(false);
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  if (loading) {
    return <SiswaLoading message="Memuat detail tugas..." />;
  }

  if (error || !task) {
    return (
      <SiswaError
        error={error || 'Tugas tidak ditemukan'}
        onRetry={() => navigate('/siswa/todo')}
        retryLabel="Kembali ke Daftar Tugas"
      />
    );
  }

  const statusConfig = getStatusConfig(task.status_tugas);

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  const deadlineLabel = task.tanggal_mengumpulkan ? (task.status || 'Tepat Waktu') : getDeadlineStatus(task.batas_waktu, null);
  const submissionLate = task.tanggal_mengumpulkan ? (task.status === 'Terlambat') : isDeadlineLate(task.batas_waktu, null);

  return (
    <div className={SISWA_PAGE_CLASS}>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <button
            type="button"
            onClick={() => navigate('/todosiswa')}
            className="self-start bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white p-2.5 sm:p-3 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 min-w-0 flex-1">
            <div className={`${statusConfig.bg} rounded-xl p-3 flex-shrink-0 self-start`}>
              {statusConfig.icon}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white break-words">{task.judul}</h1>
              <p className="text-gray-400 text-sm sm:text-base">{statusConfig.statusText}</p>
              {task.tanggal_mengumpulkan && (
                <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${submissionLate
                    ? 'bg-red-900/50 text-red-400 border-red-600/40'
                    : 'bg-green-900/50 text-green-400 border-green-600/40'
                  }`}>
                  {deadlineLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          CONTENT SECTION
      ========================================================================= */}

      <div className="space-y-6">

        {/* Description Card */}
        <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            Deskripsi
          </h3>
          <p className="text-gray-300 leading-relaxed">{task.deskripsi}</p>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Task Information */}
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Informasi Tugas</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Prioritas</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mentor</span>
                <span className="text-white font-medium">{task.mentor_nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nilai</span>
                <span className="text-white font-bold">{task.nilai || 0}/100</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Jadwal Tugas</h3>
            <div className="space-y-4">
              <div>
                <span className="text-gray-400 text-sm">Diberikan</span>
                <p className="text-white">{formatDate(task.waktu_diberikan)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Batas Waktu</span>
                <p className="text-white">{formatDate(task.batas_waktu)}</p>
              </div>
              {task.tanggal_mengumpulkan && (
                <div>
                  <span className="text-gray-400 text-sm">Dikumpulkan</span>
                  <p className="text-blue-400">{formatDate(task.tanggal_mengumpulkan)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Files Section */}
        <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">File Pendukung</h3>
            <button
              onClick={() => navigate(`/siswa/todo/edit/${task.id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 font-medium text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Edit Tugas</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Task File */}
            <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => handleViewFile(task.file_tugas, 'task')}
                    className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer text-left w-full"
                  >
                    File Tugas
                  </button>
                  <p className="text-gray-400 text-sm truncate" title={task.file_tugas}>
                    {task.file_tugas}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownloadFile(task.file_tugas, 'task')}
                className="text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0 ml-3"
                title="Download file"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>

            {/* Answer File */}
            {task.file_jawaban && (
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <FileText className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => handleViewFile(task.file_jawaban, 'answer')}
                      className="text-white font-medium hover:text-green-400 transition-colors cursor-pointer text-left w-full"
                    >
                      File Jawaban
                    </button>
                    <p className="text-gray-400 text-sm truncate" title={task.file_jawaban}>
                      {task.file_jawaban}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadFile(task.file_jawaban, 'answer')}
                  className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0 ml-3"
                  title="Download file"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Task Section - Show for tasks that haven't been submitted yet */}
        {!task.tanggal_mengumpulkan && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2" />
              Kumpulkan Jawaban Anda
            </h3>

            {/* Deadline Status */}
            {(() => {
              const now = new Date();
              const deadline = new Date(task.batas_waktu);
              const isLate = now > deadline;

              return (
                <div className={`mb-4 p-3 rounded-lg ${isLate
                    ? 'bg-red-500/10 border border-red-500/20'
                    : 'bg-green-500/10 border border-green-500/20'
                  }`}>
                  <div className="flex items-center space-x-2">
                    {isLate ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <span className={`text-sm font-medium ${isLate ? 'text-red-400' : 'text-green-400'
                      }`}>
                      {isLate ? 'Batas waktu telah terlewati' : 'Sesuai batas waktu'}
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${isLate ? 'text-red-300' : 'text-green-300'
                    }`}>
                    Batas Waktu: {formatDate(task.batas_waktu)}
                  </p>
                </div>
              );
            })()}

            <p className="text-blue-300 mb-4">
              {(() => {
                const now = new Date();
                const deadline = new Date(task.batas_waktu);
                const isLate = now > deadline;

                return isLate
                  ? 'Unggah file jawaban Anda dan kumpulkan tugas ini untuk pertama kali. Catatan: Pengumpulan ini akan ditandai terlambat.'
                  : 'Unggah file jawaban Anda dan kumpulkan tugas ini untuk pertama kali untuk ditinjau.';
              })()}
            </p>

            <button
              onClick={() => navigate(`/siswa/todo/submit/${task.id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Jawaban</span>
            </button>
          </div>
        )}

        {/* Show message if task is completed */}
        {task.status_tugas === 'Sudah Dinilai' && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Tugas Selesai
            </h3>
            <p className="text-purple-300 mb-2">Tugas ini telah selesai dan dinilai.</p>
            <p className="text-purple-300 text-sm">Nilai: {task.nilai || 0}/100</p>
          </div>
        )}

        {/* Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {task.catatan_siswa && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Komentar Siswa
              </h3>
              <p className="text-blue-300 leading-relaxed">{task.catatan_siswa}</p>
            </div>
          )}

          {task.catatan_guru && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Komentar Guru
              </h3>
              <p className="text-green-300 leading-relaxed">{task.catatan_guru}</p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================
          FILE VIEWER MODAL
      ========================================================================= */}

      {fileViewerOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">

            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 rounded-t-2xl p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedFile.name}</h2>
                    <p className="text-gray-400">
                      {selectedFile.type === 'task' ? 'Konten File Tugas' : 'Konten File Jawaban'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDownloadFile(selectedFile.name, selectedFile.type as 'task' | 'answer')}
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                    title="Download file"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setFileViewerOpen(false);
                      setSelectedFile(null);
                    }}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {fileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Memuat konten file...</span>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-6 max-h-[65vh] overflow-y-auto border border-gray-700/50">

                  {/* File Information */}
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Informasi File</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Nama File:</span>
                        <span className="text-white ml-2">{selectedFile.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tipe File:</span>
                        <span className="text-white ml-2">
                          {selectedFile.type === 'task' ? 'File Tugas' : 'File Jawaban'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* File Content */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Konten File</h3>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {selectedFile.content}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
