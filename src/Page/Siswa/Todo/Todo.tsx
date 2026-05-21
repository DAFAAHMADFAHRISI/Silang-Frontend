import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Award,
  Users,
  Clock,
  Search,
  Eye,
  Send,
  FileText,
  ListTodo,
} from 'lucide-react';
import SubmitModal from './SubmitModal/SubmitModal';
import { getDeadlineStatus, isDeadlineLate } from '../../../utils/deadlineStatus';
import {
  SiswaPageHeader,
  SiswaDivider,
  SiswaLoading,
  SiswaError,
  SiswaSearchFilter,
  SISWA_PAGE_CLASS,
} from '../components/SiswaLayout';

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
  const statusConfig: Record<string, { bg: string; icon: React.ReactElement; statusText: string }> = {
    'In Progress': {
      bg: 'bg-gradient-to-br from-orange-500 to-red-500',
      icon: <AlertCircle className="w-4 h-4" />,
      statusText: 'In Progress',
    },
    'Sudah Dinilai': {
      bg: 'bg-gradient-to-br from-blue-500 to-purple-600',
      icon: <CheckCircle className="w-4 h-4" />,
      statusText: 'Completed',
    },
    'Belum Dinilai': {
      bg: 'bg-gradient-to-br from-yellow-500 to-orange-500',
      icon: <Clock className="w-4 h-4" />,
      statusText: 'Submitted',
    },
  };

  const config = statusConfig[task.status_tugas] || statusConfig['In Progress'];
  const late = isDeadlineLate(task.batas_waktu, task.tanggal_mengumpulkan);
  const deadlineStatus = getDeadlineStatus(task.batas_waktu, task.tanggal_mengumpulkan);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tidak ada tanggal';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Format tanggal tidak valid';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Low':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="bg-gray-800/70 rounded-xl border border-gray-700/60 p-4 sm:p-5 space-y-3 sm:space-y-4 transition-colors hover:border-gray-600/80">
      {/* Card header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onTaskClick(task)}
            className="text-left w-full group"
          >
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
              {task.judul}
            </h3>
          </button>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2 sm:line-clamp-3">
            {task.deskripsi}
          </p>
        </div>
        <span
          className={`${config.bg} self-start flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-semibold text-white shadow-md`}
        >
          {config.icon}
          <span>{config.statusText}</span>
        </span>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-gray-900/50 rounded-lg p-2.5 sm:p-3 border border-gray-700/40">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-400" />
            Deadline
          </p>
          <p className="text-white font-medium text-xs sm:text-sm break-words">
            {formatDate(task.batas_waktu)}
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2.5 sm:p-3 border border-gray-700/40">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold flex items-center gap-1">
            <Award className="w-3 h-3 text-yellow-400" />
            Nilai
          </p>
          <p className="text-white font-bold text-sm sm:text-base">{task.nilai || 0}/100</p>
        </div>
      </div>

      {/* Priority, mentor, deadline status */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className={`px-2 py-0.5 rounded-full font-medium border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className="text-gray-500 hidden xs:inline">•</span>
        <span className="text-gray-400 truncate max-w-[140px] sm:max-w-none">
          Mentor: <span className="text-white">{task.mentor_nama}</span>
        </span>
        <span
          className={`ml-auto flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${
            late
              ? 'bg-red-900/50 text-red-400 border-red-600/40'
              : 'bg-green-900/50 text-green-400 border-green-600/40'
          }`}
        >
          {deadlineStatus}
        </span>
      </div>

      {task.tanggal_mengumpulkan && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
          <span>
            Dikumpulkan: <span className="font-medium">{formatDate(task.tanggal_mengumpulkan)}</span>
          </span>
        </div>
      )}

      {(task.catatan_siswa || task.catatan_guru) && (
        <div className="space-y-2">
          {task.catatan_siswa && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 sm:p-3">
              <p className="text-[10px] uppercase tracking-wider text-blue-400 mb-1 font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                Catatan Siswa
              </p>
              <p className="text-xs sm:text-sm text-blue-200 line-clamp-3">{task.catatan_siswa}</p>
            </div>
          )}
          {task.catatan_guru && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 sm:p-3">
              <p className="text-[10px] uppercase tracking-wider text-green-400 mb-1 font-semibold flex items-center gap-1">
                <Award className="w-3 h-3" />
                Catatan Guru
              </p>
              <p className="text-xs sm:text-sm text-green-200 line-clamp-3">{task.catatan_guru}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col xs:flex-row gap-2 pt-1 sm:pt-2">
        <button
          type="button"
          onClick={() => onTaskClick(task)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          <span>Detail</span>
        </button>
        {task.tanggal_mengumpulkan && (
          <button
            type="button"
            onClick={() => navigate(`/siswa/todo/edit/${task.id}`)}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2.5 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login untuk mengakses tugas');
        return;
      }

      const response = await fetch('http://localhost:3000/api/tugas-siswa', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Akses ditolak. Silakan login kembali.');
        }
        throw new Error(`Gagal memuat tugas: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setTasks(data.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat tugas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.mentor_nama.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || task.status_tugas === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status_tugas === 'In Progress').length,
    submitted: tasks.filter((t) => t.status_tugas === 'Belum Dinilai').length,
    completed: tasks.filter((t) => t.status_tugas === 'Sudah Dinilai').length,
    onTime: tasks.filter(
      (t) => t.tanggal_mengumpulkan && !isDeadlineLate(t.batas_waktu, t.tanggal_mengumpulkan)
    ).length,
    late: tasks.filter(
      (t) => t.tanggal_mengumpulkan && isDeadlineLate(t.batas_waktu, t.tanggal_mengumpulkan)
    ).length,
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/siswa/todo/detail/${task.id}`);
  };

  const handleSubmitSuccess = () => {
    fetchTasks();
  };

  if (loading) {
    return <SiswaLoading message="Memuat data tugas..." />;
  }

  if (error) {
    return <SiswaError error={error} onRetry={fetchTasks} />;
  }

  return (
    <div className={SISWA_PAGE_CLASS}>
      <SiswaPageHeader title="To Do List" subtitle="Kelola tugas dan aktivitas Anda." />

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm truncate">Total Tugas</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <ListTodo className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm truncate">Berjalan</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-400">{stats.inProgress}</p>
            </div>
            <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm truncate">Dikumpulkan</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.submitted}</p>
            </div>
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm truncate">Selesai</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.completed}</p>
            </div>
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm truncate">Tepat Waktu</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.onTime}</p>
            </div>
            <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-400 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-700 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm truncate">Terlambat</p>
              <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.late}</p>
            </div>
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-red-400 flex-shrink-0" />
          </div>
        </div>
      </div>

      <SiswaSearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Cari judul, deskripsi, atau mentor..."
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: 'all', label: 'Semua Status' },
          { value: 'In Progress', label: 'Berjalan' },
          { value: 'Belum Dinilai', label: 'Dikumpulkan' },
          { value: 'Sudah Dinilai', label: 'Selesai' },
        ]}
      />

      <SiswaDivider />

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4">
          <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
          {tasks.length === 0 ? (
            <>
              <p className="text-gray-400 text-base sm:text-lg">Belum ada tugas</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Tugas dari mentor akan muncul di sini
              </p>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-base sm:text-lg">Tidak ada data yang sesuai</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">
                Coba ubah filter atau kata kunci pencarian
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-4 xl:gap-6">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskClick={handleTaskClick}
              navigate={navigate}
            />
          ))}
        </div>
      )}

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
