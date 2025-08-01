import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, CheckCircle, AlertCircle, Award, Users, Clock, Search, Filter, RefreshCw, X, FileText, Download, Eye, Plus, Upload, Send } from 'lucide-react';

const Divider = () => <div className="border-t border-gray-700/50 my-6 sm:my-8 w-full" />;

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

interface TaskCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
}

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSubmitModal: (task: Task) => void;
}

const TaskModal = ({ task, isOpen, onClose, onOpenSubmitModal }: TaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);

  // Fetch detailed task data when modal opens
  useEffect(() => {
    if (isOpen && task) {
      fetchDetailedTask();
    }
  }, [isOpen, task]);

  const fetchDetailedTask = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/tugas-siswa/${task.id}`, {
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
        setDetailedTask(data.data);
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      // Fallback to original task data
      setDetailedTask(task);
    } finally {
      setLoading(false);
    }
  };

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
    const configs: Record<string, { bg: string; icon: React.ReactElement; statusText: string; color: string }> = {
      'In Progress': {
        bg: 'bg-gradient-to-br from-orange-500 to-red-500',
        icon: <AlertCircle className="w-5 h-5" />,
        statusText: 'In Progress',
        color: 'text-orange-400'
      },
      'Sudah Dinilai': {
        bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
        icon: <CheckCircle className="w-5 h-5" />,
        statusText: 'Completed',
        color: 'text-blue-400'
      },
      'Belum Dinilai': {
        bg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
        icon: <Clock className="w-5 h-5" />,
        statusText: 'Submitted',
        color: 'text-yellow-400'
      },
    };
    return configs[status] || configs['In Progress'];
  };

  if (!isOpen || !task) return null;

  const currentTask = detailedTask || task;
  const statusConfig = getStatusConfig(currentTask.status_tugas);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 rounded-t-2xl p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`${statusConfig.bg} rounded-xl p-3`}>
                {statusConfig.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{currentTask.judul}</h2>
                <p className="text-gray-400">{statusConfig.statusText}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-400">Loading task details...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">{currentTask.deskripsi}</p>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Task Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Priority</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(currentTask.priority)}`}>
                        {currentTask.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mentor</span>
                      <span className="text-white font-medium">{currentTask.mentor_nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score</span>
                      <span className="text-white font-bold">{currentTask.nilai || 0}/100</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-400 text-sm">Assigned</span>
                      <p className="text-white">{formatDate(currentTask.waktu_diberikan)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Deadline</span>
                      <p className="text-white">{formatDate(currentTask.batas_waktu)}</p>
                    </div>
                    {currentTask.tanggal_mengumpulkan && (
                      <div>
                        <span className="text-gray-400 text-sm">Submitted</span>
                        <p className="text-blue-400">{formatDate(currentTask.tanggal_mengumpulkan)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Files Section */}
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Task File</p>
                        <p className="text-gray-400 text-sm">{currentTask.file_tugas}</p>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {currentTask.file_jawaban && (
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Answer File</p>
                          <p className="text-gray-400 text-sm">{currentTask.file_jawaban}</p>
                        </div>
                      </div>
                      <button className="text-green-400 hover:text-green-300">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Task Section - Show for tasks that haven't been submitted yet */}
              {!currentTask.tanggal_mengumpulkan && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Submit Your Answer
                  </h3>
                  
                  {/* Deadline Status */}
                  {(() => {
                    const now = new Date();
                    const deadline = new Date(currentTask.batas_waktu);
                    const isLate = now > deadline;
                    
                    return (
                      <div className={`mb-4 p-3 rounded-lg ${
                        isLate 
                          ? 'bg-red-500/10 border border-red-500/20' 
                          : 'bg-green-500/10 border border-green-500/20'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {isLate ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            isLate ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {isLate ? 'Deadline has passed' : 'Within deadline'}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${
                          isLate ? 'text-red-300' : 'text-green-300'
                        }`}>
                          Deadline: {formatDate(currentTask.batas_waktu)}
                        </p>
                      </div>
                    );
                  })()}
                  
                  <p className="text-blue-300 mb-4">
                    {(() => {
                      const now = new Date();
                      const deadline = new Date(currentTask.batas_waktu);
                      const isLate = now > deadline;
                      
                      return isLate 
                        ? 'Upload your answer file and submit this task. Note: This submission will be marked as late.'
                        : 'Upload your answer file and submit this task for review.';
                    })()}
                  </p>
                  
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSubmitModal(currentTask);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Submit Answer</span>
                  </button>
                </div>
              )}

              {/* Show message if task is already submitted */}
              {currentTask.tanggal_mengumpulkan && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Task Submitted
                  </h3>
                  <p className="text-green-300 mb-2">This task has been submitted and is being reviewed.</p>
                  <p className="text-green-300 text-sm">Submitted on: {formatDate(currentTask.tanggal_mengumpulkan)}</p>
                </div>
              )}

              {/* Show message if task is completed */}
              {currentTask.status_tugas === 'Sudah Dinilai' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Task Completed
                  </h3>
                  <p className="text-purple-300 mb-2">This task has been completed and graded.</p>
                  <p className="text-purple-300 text-sm">Score: {currentTask.nilai || 0}/100</p>
                </div>
              )}

              {/* Notes Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentTask.catatan_siswa && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Student Notes
                    </h3>
                    <p className="text-blue-300 leading-relaxed">{currentTask.catatan_siswa}</p>
                  </div>
                )}
                
                {currentTask.catatan_guru && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Teacher Notes
                    </h3>
                    <p className="text-green-300 leading-relaxed">{currentTask.catatan_guru}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SubmitTaskModal = ({ isOpen, onClose, onSubmitSuccess, selectedTask }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  selectedTask: Task | null;
}) => {
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
                  {task ? `Submit: ${task.judul}` : 'Submit Task'}
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
              <h3 className="text-xl font-semibold text-white mb-2">Task Submitted Successfully!</h3>
              <p className="text-gray-400">Your task has been submitted and is being reviewed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Display */}
              {task && (
                <div className="bg-gray-800/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-400" />
                    Selected Task
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
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Student Notes (Optional)
                </h3>
                <textarea
                  value={catatanSiswa}
                  onChange={(e) => setCatatanSiswa(e.target.value)}
                  placeholder="Add any notes or comments about your submission..."
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

const TaskCard = ({ task, onTaskClick }: TaskCardProps) => {
  const statusConfig: Record<string, { bg: string; icon: React.ReactElement; statusText: string; color: string }> = {
    'In Progress': {
      bg: 'bg-gradient-to-br from-orange-500 to-red-500',
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      statusText: 'In Progress',
      color: 'text-orange-400'
    },
    'Sudah Dinilai': {
      bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
      icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />,
      statusText: 'Completed',
      color: 'text-blue-400'
    },
    'Belum Dinilai': {
      bg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
      statusText: 'Submitted',
      color: 'text-yellow-400'
    },
  };

  const config = statusConfig[task.status_tugas] || statusConfig['In Progress'];

  // Format date functions
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

  const getTimeDifference = (dueDate: string) => {
    if (!dueDate) return "Tidak ada deadline";
    try {
      const now = new Date();
      const due = new Date(dueDate);
      if (isNaN(due.getTime())) {
        return "Format deadline tidak valid";
      }
      const diff = due.getTime() - now.getTime();
      
      if (diff < 0) {
        return 'Terlambat';
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) {
        return `dalam ${days} hari`;
      } else if (hours > 0) {
        return `dalam ${hours} jam`;
      } else {
        return 'dalam beberapa menit';
      }
    } catch (error) {
      return "Error menghitung deadline";
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

  return (
    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02]">
      {/* Header with Status Badge */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <button 
            onClick={() => onTaskClick(task)}
            className="text-left w-full group"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors cursor-pointer flex items-center">
              {task.judul}
              <Eye className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
          </button>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{task.deskripsi}</p>
        </div>
        <div className={`${config.bg} rounded-xl p-3 ml-4 flex-shrink-0 flex items-center space-x-2 shadow-lg`}>
          {config.icon}
          <span className="text-sm font-semibold text-white">{config.statusText}</span>
        </div>
      </div>
      
      {/* Key Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
          <Calendar className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xs text-gray-400">Due Date</p>
            <p className="text-sm font-semibold text-white">{formatDate(task.batas_waktu)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
          <Award className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-xs text-gray-400">Score</p>
            <p className="text-sm font-semibold text-white">{task.nilai || 0}/100</p>
          </div>
        </div>
      </div>
      
      {/* Priority and Mentor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <span className="text-sm text-gray-400">Priority</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <span className="text-sm text-gray-400">Mentor</span>
          <span className="text-sm font-medium text-white">{task.mentor_nama}</span>
        </div>
      </div>
      
      {/* Submission Date */}
      {task.tanggal_mengumpulkan && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Submitted</span>
          </div>
          <p className="text-sm text-blue-300">{formatDate(task.tanggal_mengumpulkan)}</p>
        </div>
      )}
      
      {/* Notes Sections */}
      <div className="space-y-4 mb-6">
        {task.catatan_siswa && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Student Notes</span>
            </div>
            <p className="text-sm text-blue-300 leading-relaxed">{task.catatan_siswa}</p>
          </div>
        )}
        
        {task.catatan_guru && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Teacher Notes</span>
            </div>
            <p className="text-sm text-green-300 leading-relaxed">{task.catatan_guru}</p>
          </div>
        )}
      </div>
      
      {/* Deadline Status */}
      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
        <span className="text-sm text-gray-400">Deadline Status</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          getTimeDifference(task.batas_waktu).includes('Terlambat') 
            ? 'text-red-400 bg-red-500/10 border border-red-500/20' 
            : 'text-green-400 bg-green-500/10 border border-green-500/20'
        }`}>
          {getTimeDifference(task.batas_waktu)}
        </span>
      </div>
    </div>
  );
};

const Todo: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access tasks');
        return;
      }

      const response = await fetch('http://localhost:3000/api/tugas-siswa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Unauthorized access. Please login again.');
        }
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setTasks(data.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Filter tasks based on search term and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.mentor_nama.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status_tugas === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleSubmitSuccess = () => {
    // Refresh tasks after successful submission
    fetchTasks();
  };

  const handleOpenSubmitModal = (task: Task) => {
    setSelectedTask(task);
    setIsSubmitModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 mb-6 text-lg">{error}</p>
          <button 
            onClick={fetchTasks}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg transition-colors text-base font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-2 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            To Do List
          </h1>
        </div>
        <p className="text-gray-400 text-lg ml-5">Kelola tugas dan aktivitas Anda.</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-base"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700/50 text-white pl-10 pr-8 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600 text-base appearance-none"
              >
                <option value="all">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Belum Dinilai">Submitted</option>
                <option value="Sudah Dinilai">Completed</option>
              </select>
            </div>
            
            <button 
              onClick={fetchTasks}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskClick={handleTaskClick} />
          ))
        ) : (
          <div className="col-span-1 xl:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/50">
            <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No tasks found' : 'No tasks available'}
            </h3>
            <p className="text-gray-400 text-lg">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'You don\'t have any tasks assigned yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskModal 
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOpenSubmitModal={handleOpenSubmitModal}
      />

      {/* Submit Task Modal */}
      <SubmitTaskModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
        selectedTask={selectedTask}
      />
    </div>
  );
};

export default Todo;

