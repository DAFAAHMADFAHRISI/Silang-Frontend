import React, { useState, useEffect } from "react";

import { FileText, Calendar, Clock, AlertCircle, CheckCircle, Download, Plus, RefreshCw, Edit as EditIcon, Trash2, Filter, Search, Users, Star, MessageSquare } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface Tugas {
  id: number;
  mentor_id?: number;
  judul: string;
  deskripsi: string;
  priority: string;
  file_tugas: string;
  waktu_diberikan: string;
  batas_waktu: string;
  created_at: string;
  updated_at: string;
  total_submissions: number;
  total_graded: number;
}

interface Submission {
  id: number;
  file_jawaban: string;
  tanggal_mengumpulkan: string;
  nilai: number;
  catatan_siswa: string;
  catatan_guru: string;
  created_at: string;
  siswa_id: number;
  siswa_nama: string;
}

interface Student {
  id: number;
  nama: string;
  email: string;
  nama_institusi: string;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(priority)}`}>
      {priority}
    </span>
  );
};

const TaskCard = ({ task, onView, onEdit, onDelete }: { 
  task: Tugas; 
  onView: (task: Tugas) => void;
  onEdit: (task: Tugas) => void;
  onDelete: (task: Tugas) => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = new Date(task.batas_waktu) < new Date();

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 
              className="text-xl font-semibold text-white cursor-pointer hover:text-blue-400 transition-colors"
              onClick={() => onView(task)}
            >
              {task.judul}
            </h3>
            <PriorityBadge priority={task.priority} />
            {isOverdue && (
              <div className="flex items-center text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-1" />
                Terlambat
              </div>
            )}
          </div>
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{task.deskripsi}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Diberikan: {formatDate(task.waktu_diberikan)}</span>
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>Batas Waktu: {formatDate(task.batas_waktu)}</span>
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <FileText className="w-4 h-4 mr-2" />
          <span>File: {task.file_tugas}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center text-blue-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>{task.total_submissions} Submission</span>
          </div>
          <div className="flex items-center text-green-400">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>{task.total_graded} Graded</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <EditIcon className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(task)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );
};

const TugasMentor: React.FC = () => {
  const [tasks, setTasks] = useState<Tugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Tugas | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Tugas | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/api/tugas-mentor', {
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
      
      const data: Tugas[] = await response.json();
      console.log('Debug - API Response data:', data);
      
      setTasks(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data tugas.';
      setError(errorMessage);
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'mentor') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchTasks();
    fetchStudents();
  }, []);

  const fetchTaskDetail = async (taskId: number) => {
    try {
      setLoadingDetail(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch(`http://localhost:3000/api/tugas-mentor/${taskId}`, {
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
      
      const data: Tugas = await response.json();
      console.log('Debug - Task Detail API Response:', data);
      
      setSelectedTaskDetail(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat detail tugas.';
      setError(errorMessage);
      console.error('Error fetching task detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchSubmissions = async (taskId: number) => {
    try {
      setLoadingSubmissions(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch(`http://localhost:3000/api/tugas-mentor/${taskId}/submissions`, {
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
      
      const data: Submission[] = await response.json();
      console.log('Debug - Submissions API Response:', data);
      
      setSubmissions(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data submissions.';
      setError(errorMessage);
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true); // Use setLoading for students as well
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
             const response = await fetch('http://localhost:3000/api/siswa-mentor', {
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
      
      const data: Student[] = await response.json();
      console.log('Debug - Students API Response:', data);
      
      setStudents(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data siswa.';
      setError(errorMessage);
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewTask = async (task: Tugas) => {
    setSelectedTask(task);
    
    // Fetch detailed task information
    await fetchTaskDetail(task.id);
    // Fetch submissions for this task
    await fetchSubmissions(task.id);
  };

  const handleEditTask = async (task: Tugas) => {
    // Navigate to edit page with task ID
    navigate(`/mentor/tugas/edit/${task.id}`);
  };

  const handleDeleteTask = async (task: Tugas) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tugas "${task.judul}"?`)) {
      return;
    }

    try {
      setLoadingAction(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch(`http://localhost:3000/api/tugas-mentor/${task.id}`, {
        method: 'DELETE',
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
      
      console.log('Task deleted successfully');
      await fetchTasks(); // Refresh the list
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus tugas.';
      setError(errorMessage);
      console.error('Error deleting task:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCreateTask = async () => {
    // Navigate to add page
    navigate('/mentor/tugas/tambah');
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.nama : `Siswa ID: ${studentId}`;
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority.toLowerCase() === priorityFilter.toLowerCase();
    return matchesSearch && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data tugas...</p>
          </div>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
              <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
              <div className="space-y-2">
                <button 
                  onClick={fetchTasks} 
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Coba Lagi
                </button>
                <button 
                  onClick={() => navigate('/Login')} 
                  className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors font-semibold ml-2"
                >
                  Login Ulang
                </button>
              </div>
            </div>
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-6 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Tugas Mentor
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchTasks}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button 
                onClick={handleCreateTask}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas</span>
              </button>
            </div>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Kelola dan pantau tugas yang diberikan kepada siswa.</p>
        </div>

        <div className="border-t border-gray-700/50 my-8 w-full" />

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari tugas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Semua Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Tugas</p>
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Submission</p>
                <p className="text-2xl font-bold text-white">
                  {tasks.reduce((sum, task) => sum + task.total_submissions, 0)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Graded</p>
                <p className="text-2xl font-bold text-white">
                  {tasks.reduce((sum, task) => sum + task.total_graded, 0)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Overdue</p>
                <p className="text-2xl font-bold text-red-400">
                  {tasks.filter(task => new Date(task.batas_waktu) < new Date()).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>Daftar Tugas ({filteredTasks.length})</span>
          </h2>
          
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Tidak ada tugas ditemukan.</p>
              <p className="text-gray-500 text-sm">Coba ubah filter atau tambah tugas baru.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onView={handleViewTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        {/* This modal is now handled by navigation */}

        {/* Edit Task Modal */}
        {/* This modal is now handled by navigation */}

        {/* Task Detail Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-white">Detail Tugas</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {loadingDetail ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Memuat detail tugas...</span>
                </div>
              ) : selectedTaskDetail ? (
                <div className="space-y-6">
                  {/* Task Information */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-400" />
                      Informasi Tugas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Judul</label>
                        <p className="text-white font-semibold text-lg">{selectedTaskDetail.judul}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Priority</label>
                        <div className="mt-1">
                          <PriorityBadge priority={selectedTaskDetail.priority} />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-400 text-sm">Deskripsi</label>
                        <p className="text-white">{selectedTaskDetail.deskripsi}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">File Tugas</label>
                        <p className="text-white text-sm">{selectedTaskDetail.file_tugas}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Mentor ID</label>
                        <p className="text-white text-sm">{selectedTaskDetail.mentor_id}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Waktu Diberikan</label>
                        <p className="text-white text-sm">{formatDate(selectedTaskDetail.waktu_diberikan)}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Batas Waktu</label>
                        <p className="text-white text-sm">{formatDate(selectedTaskDetail.batas_waktu)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Students Section */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-400" />
                      Siswa yang Ditugaskan
                    </h4>
                    
                    {loadingDetail ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-400">Memuat data siswa...</span>
                      </div>
                    ) : selectedTaskDetail ? (
                      <div className="space-y-3">
                        {(() => {
                          const assignedStudents = students.filter(student => 
                            selectedTaskDetail.total_submissions > 0 || 
                            submissions.some(sub => sub.siswa_id === student.id)
                          );
                          
                          if (assignedStudents.length === 0) {
                            return (
                              <div className="text-center py-4">
                                <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-gray-400">Belum ada siswa yang ditugaskan</p>
                              </div>
                            );
                          }
                          
                          return assignedStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between bg-gray-600 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {student.nama.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-semibold">{student.nama}</p>
                                  <p className="text-gray-400 text-xs">{student.email}</p>
                                  <p className="text-gray-400 text-xs">{student.nama_institusi}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {submissions.some(sub => sub.siswa_id === student.id) ? (
                                  <div className="flex items-center text-green-400">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Submitted</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-yellow-400">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Pending</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-red-400">Gagal memuat data siswa</p>
                      </div>
                    )}
                  </div>

                  {/* Submissions Section */}
                  <div className="bg-gray-700 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-green-400" />
                      Submissions Siswa ({submissions.length})
                    </h4>
                    
                    {loadingSubmissions ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                        <span className="ml-3 text-gray-400">Memuat submissions...</span>
                      </div>
                    ) : submissions.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400">Belum ada submissions</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {submissions.map((submission) => (
                          <div key={submission.id} className="bg-gray-600 rounded-lg p-4 border border-gray-500">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {submission.siswa_nama.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-semibold">{submission.siswa_nama}</p>
                                  <p className="text-gray-400 text-sm">ID: {submission.siswa_id}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center text-yellow-400">
                                  <Star className="w-4 h-4 mr-1" />
                                  <span className="font-semibold">{submission.nilai}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <label className="text-gray-400 text-xs">File Jawaban</label>
                                <p className="text-white">{submission.file_jawaban}</p>
                              </div>
                              <div>
                                <label className="text-gray-400 text-xs">Tanggal Submit</label>
                                <p className="text-white">{formatDate(submission.tanggal_mengumpulkan)}</p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-gray-400 text-xs">Catatan Siswa</label>
                                <p className="text-white bg-gray-500 p-2 rounded">{submission.catatan_siswa}</p>
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-gray-400 text-xs">Catatan Guru</label>
                                <p className="text-white bg-gray-500 p-2 rounded">{submission.catatan_guru}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-400">Gagal memuat detail tugas</p>
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download File
                </button>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default TugasMentor;
