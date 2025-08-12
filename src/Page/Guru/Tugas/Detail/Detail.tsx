import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { FileText, Clock, CheckCircle, AlertCircle, Eye, Search, ArrowLeft, Download, X } from 'lucide-react';

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

interface SelectedFile {
  name: string;
  content: string;
  type: 'task' | 'submission';
  studentName?: string;
}

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File viewer states
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

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

  const handleDownload = async (fileName: string, fileType: 'task' | 'submission') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      // Use the same pattern as the working student implementation
      let downloadUrl = '';
      
      if (fileType === 'task') {
        // For task files, we need the task ID - get it from the current task
        if (!task) {
          throw new Error('Task data tidak tersedia');
        }
        downloadUrl = `http://localhost:3000/api/tugas-guru/${task.id}/download-task`;
      } else {
        // For submission files, we need both task ID and submission info
        if (!task) {
          throw new Error('Task data tidak tersedia');
        }
        // Find the submission that matches the filename
        const submission = task.penerima_tugas.find(sub => sub.file_jawaban === fileName);
        if (!submission) {
          throw new Error('Submission tidak ditemukan');
        }
        downloadUrl = `http://localhost:3000/api/tugas-guru/${task.id}/download-submission/${submission.siswa_id}`;
      }

      console.log('Attempting to download from:', downloadUrl);

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        throw new Error(`File ${fileName} tidak ditemukan di server`);
      }

      if (!response.ok) {
        throw new Error(`Error server: ${response.status} - ${response.statusText}`);
      }

      // Check if response is actually a file
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        // If response is JSON, it might be an error message
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengunduh file');
      }

      const blob = await response.blob();
      
      if (blob.size === 0) {
        throw new Error('File kosong atau tidak valid');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('File downloaded successfully:', fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      
      // More specific error messages
      let errorMessage = 'Gagal mengunduh file. Silakan coba lagi.';
      
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('tidak ditemukan')) {
          errorMessage = `File ${fileName} tidak ditemukan di server.`;
        } else if (error.message.includes('401')) {
          errorMessage = 'Sesi Anda telah berakhir. Silakan login ulang.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Anda tidak memiliki izin untuk mengunduh file ini.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleViewFile = async (fileName: string, fileType: 'task' | 'submission', studentName?: string) => {
    try {
      if (!task) {
        console.error('Task data not available');
        return;
      }

      setFileLoading(true);
      
      const token = localStorage.getItem('token');
      let fileUrl = '';
      
      if (fileType === 'task') {
        fileUrl = `http://localhost:3000/api/tugas-guru/${task.id}/view-task`;
      } else {
        // Find the submission that matches the filename
        const submission = task.penerima_tugas.find(sub => sub.file_jawaban === fileName);
        if (!submission) {
          throw new Error('Submission tidak ditemukan');
        }
        fileUrl = `http://localhost:3000/api/tugas-guru/${task.id}/view-submission/${submission.siswa_id}`;
      }

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
            type: fileType,
            studentName: studentName
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
        {/* Task Information - Multiple Boxes in One Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Box 1: Task Title and Priority */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{task.judul}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Deskripsi:</span>
                <p className="text-white mt-1 text-sm">{task.deskripsi}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Mentor:</span>
                <p className="text-white mt-1 text-sm">{task.mentor_nama}</p>
              </div>
            </div>
          </div>

          {/* Box 2: File and Time Information */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">File & Waktu</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">File Tugas:</span>
                <div className="flex items-center justify-between mt-1">
                  <button
                    onClick={() => handleViewFile(task.file_tugas, 'task')}
                    className="text-white text-sm hover:text-blue-400 transition-colors cursor-pointer text-left"
                    title="Click to view file content"
                  >
                    {task.file_tugas}
                  </button>
                  <button
                    onClick={() => handleDownload(task.file_tugas, 'task')}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs transition-colors"
                    title="Download file tugas"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Waktu Diberikan:</span>
                <p className="text-white mt-1 text-sm">{formatDate(task.waktu_diberikan)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Batas Waktu:</span>
                <p className="text-white mt-1 text-sm">{formatDate(task.batas_waktu)}</p>
              </div>
            </div>
          </div>

          {/* Box 3: Progress and Status */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Progress</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Total Submissions:</span>
                <p className="text-white mt-1 text-sm">{task.total_submissions}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Sudah Dinilai:</span>
                <p className="text-white mt-1 text-sm">{task.total_graded}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Progress:</span>
                <p className="text-white mt-1 text-sm">{task.total_graded}/{task.total_submissions} dinilai</p>
              </div>
            </div>
          </div>

          {/* Box 4: Created Date */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Info Tambahan</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Created:</span>
                <p className="text-white mt-1 text-sm">{formatDate(task.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Updated:</span>
                <p className="text-white mt-1 text-sm">{formatDate(task.updated_at)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Task ID:</span>
                <p className="text-white mt-1 text-sm">#{task.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Section */}
        {task.penerima_tugas.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-400">
              Submissions ({task.penerima_tugas.length})
            </h3>
            <div className="space-y-4">
              {task.penerima_tugas.map((submission, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
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
                      <div className="flex items-center justify-between mt-1">
                        {submission.file_jawaban ? (
                          <button
                            onClick={() => handleViewFile(submission.file_jawaban, 'submission', submission.siswa_nama)}
                            className="text-white hover:text-green-400 transition-colors cursor-pointer text-left"
                            title="Click to view file content"
                          >
                            {submission.file_jawaban}
                          </button>
                        ) : (
                          <p className="text-white">Belum ada file</p>
                        )}
                        {submission.file_jawaban && (
                          <button
                            onClick={() => handleDownload(submission.file_jawaban, 'submission')}
                            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors"
                            title="Download file jawaban"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        )}
                      </div>
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
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">Submissions</h3>
            <p className="text-gray-400">Belum ada siswa yang mengumpulkan tugas ini.</p>
          </div>
        )}
      </div>

      {/* File Viewer Modal */}
      {fileViewerOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 rounded-t-2xl p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedFile!.name}</h2>
                    <p className="text-gray-400">
                      {selectedFile!.type === 'task' ? 'Task File Content' : `Submission by ${selectedFile!.studentName}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleDownload(selectedFile!.name, selectedFile!.type)}
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
                  <span className="ml-3 text-gray-400">Loading file content...</span>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-6 max-h-[65vh] overflow-y-auto border border-gray-700/50">
                  
                  {/* File Information */}
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">File Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">File Name:</span>
                        <span className="text-white ml-2">{selectedFile!.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">File Type:</span>
                        <span className="text-white ml-2">
                          {selectedFile!.type === 'task' ? 'Task File' : 'Submission File'}
                        </span>
                      </div>
                      {selectedFile!.studentName && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Student:</span>
                          <span className="text-white ml-2">{selectedFile!.studentName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* File Content */}
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">File Content</h3>
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                        {selectedFile!.content}
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
