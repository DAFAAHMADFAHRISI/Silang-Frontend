import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, CheckCircle, AlertCircle, Award, Users, Clock, Search, Filter, RefreshCw, X, FileText, Download, Eye, Plus, Upload, Send } from 'lucide-react';
import SubmitModal from './SubmitModal/SubmitModal';
import { getDeadlineStatus, isDeadlineLate } from '../../../utils/deadlineStatus';

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
  navigate: (path: string) => void;
}

const TaskCard = ({ task, onTaskClick, navigate }: TaskCardProps) => {
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

  const deadlineStatus = getDeadlineStatus(task.batas_waktu, task.tanggal_mengumpulkan);

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
          isDeadlineLate(task.batas_waktu, task.tanggal_mengumpulkan)
            ? 'text-red-400 bg-red-500/10 border border-red-500/20' 
            : 'text-green-400 bg-green-500/10 border border-green-500/20'
        }`}>
          {deadlineStatus}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => onTaskClick(task)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
        
        {task.tanggal_mengumpulkan && (
          <button
            onClick={() => navigate(`/siswa/todo/edit/${task.id}`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            <span>Edit</span>
          </button>
        )}
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
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const navigate = useNavigate();

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
    navigate(`/siswa/todo/detail/${task.id}`);
  };

  const handleSubmitSuccess = () => {
    // Refresh tasks after successful submission
    fetchTasks();
  };

  const handleOpenSubmitModal = (task: Task) => {
    // Only allow submission for tasks that haven't been submitted yet
    if (!task.tanggal_mengumpulkan) {
    setSelectedTask(task);
    setIsSubmitModalOpen(true);
    }
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
            

          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onTaskClick={handleTaskClick} 
              navigate={navigate}
            />
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
      {/* Removed Detail component usage */}

      {/* Submit Task Modal */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
        selectedTask={selectedTask}
      />
    </div>
  );
};

export default Todo;

