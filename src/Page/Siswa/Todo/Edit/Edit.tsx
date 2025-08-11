import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, X, FileText, Upload, Send, ArrowLeft, Save, Download } from 'lucide-react';

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
}

const Edit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [task, setTask] = useState<Task | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [catatanSiswa, setCatatanSiswa] = useState('');
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string; type: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // Fetch task data when component mounts
  useEffect(() => {
    if (id) {
      fetchTaskDetails();
    }
  }, [id]);

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
        setCatatanSiswa(data.data.catatan_siswa || '');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) {
      setError('Task not found');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (file) {
        formData.append('file_jawaban', file);
      }
      formData.append('catatan_siswa', catatanSiswa);

      const response = await fetch(`http://localhost:3000/api/tugas-siswa/${task.id}/submit`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/siswa/todo/detail/${task.id}`);
        }, 2000);
      } else {
        setError(data.message || `Failed to update task`);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-6 text-lg">{error || 'Task not found'}</p>
          <button 
            onClick={() => navigate('/todo')}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg transition-colors text-base font-medium"
          >
            Back to Todo List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate(`/siswa/todo/detail/${task.id}`)}
            className="bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white p-3 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500 rounded-xl p-3">
              <Save className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Edit Task</h1>
              <p className="text-gray-400">Update your answer and notes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-green-400">Task Updated Successfully!</h3>
              <p className="text-green-300">Your task has been updated and is being reviewed.</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Information */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Task Information
            </h3>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-white font-medium">{task.judul}</p>
                  <p className="text-blue-300 text-sm">Mentor: {task.mentor_nama}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <p className="text-white font-medium">{task.status_tugas}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Files */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Existing Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <button 
                      onClick={() => handleViewFile(task.file_tugas, 'task')}
                      className="text-white font-medium hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      Task File
                    </button>
                    <p className="text-gray-400 text-sm">{task.file_tugas}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDownloadFile(task.file_tugas, 'task')}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  title="Download file"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
              
              {task.file_jawaban && (
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-green-400" />
                    <div>
                      <button 
                        onClick={() => handleViewFile(task.file_jawaban, 'answer')}
                        className="text-white font-medium hover:text-green-400 transition-colors cursor-pointer"
                      >
                        Answer File
                      </button>
                      <p className="text-gray-400 text-sm">{task.file_jawaban}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownloadFile(task.file_jawaban, 'answer')}
                    className="text-green-400 hover:text-green-300 transition-colors"
                    title="Download file"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-400" />
              Upload Answer File
            </h3>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-gray-400 text-sm">
                  PDF, DOC, DOCX, or TXT files (max 10MB)
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  {task.file_jawaban ? 'Current file: ' + task.file_jawaban : 'No file uploaded yet'}
                </p>
              </label>
            </div>
            {file && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Student Notes */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Student Notes
            </h3>
            <textarea
              value={catatanSiswa}
              onChange={(e) => setCatatanSiswa(e.target.value)}
              placeholder="Add any notes or comments about your submission..."
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-base resize-none"
              rows={6}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/siswa/todo/detail/${task.id}`)}
              disabled={submitting}
              className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50 font-medium"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* File Viewer Modal */}
      {fileViewerOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-gray-900 rounded-t-2xl p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedFile.name}</h2>
                    <p className="text-gray-400">{selectedFile.type === 'task' ? 'Task File Content' : 'Answer File Content'}</p>
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

            {/* Content */}
            <div className="p-6">
              {fileLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Loading file content...</span>
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-xl p-6 max-h-[65vh] overflow-y-auto border border-gray-700/50">
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">File Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">File Name:</span>
                        <span className="text-white ml-2">{selectedFile.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">File Type:</span>
                        <span className="text-white ml-2">{selectedFile.type === 'task' ? 'Task File' : 'Answer File'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-3">File Content</h3>
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

export default Edit;
