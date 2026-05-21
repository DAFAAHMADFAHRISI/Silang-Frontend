import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, X, FileText, Upload, Send, ArrowLeft } from 'lucide-react';
import { SiswaLoading, SiswaError, SISWA_PAGE_CLASS } from '../../components/SiswaLayout';

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

const SubmitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [catatanSiswa, setCatatanSiswa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    // For initial submission, require both file and comment
    if (!file) {
      setError('Please upload a file');
      return;
    }

    if (!catatanSiswa.trim()) {
      setError('Please add a comment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Add file_jawaban (required)
      formData.append('file_jawaban', file);
      
      // Add catatan_siswa (required)
      formData.append('catatan_siswa', catatanSiswa);

      // Debug logging
      console.log('Submitting form data:');
      console.log('File:', file.name);
      console.log('Catatan Siswa:', catatanSiswa);
      console.log('Task ID:', task.id);
      
      // Log FormData entries
      console.log('FormData entries:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`${key}:`, value);
      });

      const response = await fetch(`http://localhost:3000/api/tugas-siswa/${task.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok && data.success) {
        // Redirect immediately to detail page
        navigate(`/siswa/todo/detail/${task.id}`);
      } else {
        setError(data.message || 'Failed to submit task');
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SiswaLoading message="Memuat tugas..." />;
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

  return (
    <div className={SISWA_PAGE_CLASS}>
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
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Submit Task: {task.judul}
              </h1>
              <p className="text-gray-400">Upload your answer and submit task</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Display */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Selected Task to Submit
            </h3>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{task.judul}</p>
                  <p className="text-blue-300 text-sm">Mentor: {task.mentor_nama}</p>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-400" />
              Upload Answer File <span className="text-red-400 ml-1">*</span>
            </h3>
            <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                id="file-upload"
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-2">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-gray-400 text-sm">
                  PDF, DOC, DOCX, or TXT files (max 10MB) - Required
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
            {!file && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400">File upload is required</p>
              </div>
            )}
          </div>

          {/* Student Notes */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Student Notes <span className="text-red-400 ml-1">*</span>
            </h3>
            <textarea
              value={catatanSiswa}
              onChange={(e) => {
                console.log('Textarea changed:', e.target.value);
                setCatatanSiswa(e.target.value);
              }}
              placeholder="Add any notes or comments about your submission... (Required)"
              className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-base resize-none"
              rows={4}
              required
            />
            {/* Debug: Show current value */}
            {catatanSiswa && (
              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-400">Current value: "{catatanSiswa}"</p>
              </div>
            )}
            {!catatanSiswa.trim() && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-red-400">Comment is required</p>
              </div>
            )}
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

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/siswa/todo/detail/${task.id}`)}
              disabled={loading}
              className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file || !catatanSiswa.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitPage; 