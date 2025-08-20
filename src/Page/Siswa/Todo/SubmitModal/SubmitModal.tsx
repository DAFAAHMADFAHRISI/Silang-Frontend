import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, FileText, Upload, Send } from 'lucide-react';

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

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  selectedTask: Task | null;
}

const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose, onSubmitSuccess, selectedTask }) => {
  const [task, setTask] = useState<Task | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [catatanSiswa, setCatatanSiswa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Set selected task when prop changes
  useEffect(() => {
    if (selectedTask) {
      setTask(selectedTask);
    }
  }, [selectedTask]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task || !file) {
      setError('Please select a task and upload a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file_jawaban', file);
      formData.append('catatan_siswa', catatanSiswa);

      const response = await fetch(`http://localhost:3000/api/tugas-siswa/${task.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onSubmitSuccess();
          setSuccess(false);
          setTask(null);
          setFile(null);
          setCatatanSiswa('');
        }, 2000);
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

  const handleClose = () => {
    if (!loading) {
      onClose();
      setTask(null);
      setFile(null);
      setCatatanSiswa('');
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 rounded-t-2xl p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 rounded-xl p-3">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {task ? `Submit Task: ${task.judul}` : 'Submit Task'}
                </h2>
                <p className="text-gray-400">
                  {task ? 'Upload your answer and submit task' : 'Select a task to submit'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Task Submitted Successfully!
              </h3>
              <p className="text-gray-400">
                Your task has been submitted and is being reviewed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Display */}
              {task && (
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
              )}

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
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-white font-medium mb-2">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      PDF, DOC, DOCX, or TXT files (max 10MB)
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
                  Student Notes (Optional)
                </h3>
                <textarea
                  value={catatanSiswa}
                  onChange={(e) => setCatatanSiswa(e.target.value)}
                  placeholder={`Add any notes or comments about your submission...`}
                  className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-base resize-none"
                  rows={4}
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

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !task || !file}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitModal; 