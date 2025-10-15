import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Download,
  Eye
} from 'lucide-react';

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  file_tugas: string;
  priority: string;
  nama_mentor: string;
  nama_siswa: string;
  waktu_diberikan: string;
  batas_waktu: string;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      setError('Anda harus login terlebih dahulu.');
      setLoading(false);
      return;
    }

    if (role !== 'superadmin') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    if (id) {
      fetchTaskDetail(parseInt(id));
    }
  }, [id]);

  const fetchTaskDetail = async (taskId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching task detail for ID:', taskId);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      console.log('Making API call to:', `http://localhost:3000/api/superadmin/tugas/${taskId}`);
      
      const response = await fetch(`http://localhost:3000/api/superadmin/tugas/${taskId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (response.status === 403) {
        throw new Error('Anda tidak memiliki izin untuk mengakses data ini.');
      }
      
      if (response.status === 404) {
        throw new Error('Tugas tidak ditemukan.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      setTask(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengambil detail tugas.';
      setError(errorMessage);
      console.error('Error fetching task detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nama');
    localStorage.removeItem('role');
    navigate('/Login');
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return {
          bg: "bg-gradient-to-br from-red-500 to-pink-600",
          icon: <AlertCircle className="w-5 h-5" />,
          text: "High Priority",
          color: "text-red-400"
        };
      case 'medium':
        return {
          bg: "bg-gradient-to-br from-yellow-500 to-orange-500",
          icon: <Clock className="w-5 h-5" />,
          text: "Medium Priority",
          color: "text-yellow-400"
        };
      case 'low':
        return {
          bg: "bg-gradient-to-br from-green-500 to-emerald-600",
          icon: <CheckCircle className="w-5 h-5" />,
          text: "Low Priority",
          color: "text-green-400"
        };
      default:
        return {
          bg: "bg-gradient-to-br from-gray-500 to-gray-600",
          icon: <FileText className="w-5 h-5" />,
          text: "Normal Priority",
          color: "text-gray-400"
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePreviewFile = async () => {
    if (!task) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const res = await fetch(`http://localhost:3000/api/superadmin/tugas/${task.id}/view-task`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal memuat file');

      const blob = await res.blob();
      const fileName = task.file_tugas.toLowerCase();
      const isPdf = fileName.endsWith('.pdf');
      const isImage = /(\.png|\.jpe?g|\.gif|\.webp)$/i.test(fileName);
      const mime = isPdf ? 'application/pdf' : (isImage ? blob.type || 'image/*' : (res.headers.get('Content-Type') || 'application/octet-stream'));
      const url = URL.createObjectURL(new Blob([blob], { type: mime }));
      window.open(url, '_blank');
      // optional: revoke later
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      console.error(e);
      alert('Tidak dapat menampilkan file.');
    }
  };

  const handleDownloadFile = async () => {
    if (!task) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan.');

      const res = await fetch(`http://localhost:3000/api/superadmin/tugas/${task.id}/download-task`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal mengunduh file');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = task.file_tugas;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Tidak dapat mengunduh file.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
          <div className="flex space-x-3">
            {error.includes('login') || error.includes('sesi') ? (
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                <i className="fa fa-sign-in mr-2"></i>
                Login Ulang
              </button>
            ) : (
              <button
                onClick={() => id && fetchTaskDetail(parseInt(id))}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                <i className="fa fa-refresh mr-2"></i>
                Coba Lagi
              </button>
            )}
            <button
              onClick={() => navigate('/SuperAdmin/Tugas')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" />
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Tugas Tidak Ditemukan</h3>
          <p className="text-gray-500 mb-4">Tugas yang Anda cari tidak tersedia.</p>
          <button
            onClick={() => navigate('/SuperAdmin/Tugas')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Kembali ke Daftar Tugas
          </button>
        </div>
      </div>
    );
  }

  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div className="p-6 pl-0">
      <div className="max-w-6xl mx-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/DataTugas')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Kembali ke Data Tugas"
              title="Kembali"
            >
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Detail Tugas</h1>
              <p className="text-gray-400">Informasi lengkap tentang tugas yang dipilih</p>
            </div>
          </div>
        </div>

        {/* Task Detail Card */}
        <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
          {/* Title and Priority */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-white pr-4 flex-1">{task.judul}</h2>
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${priorityConfig.bg} text-white`}>
              {priorityConfig.icon}
              <span className="font-medium">{priorityConfig.text}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Deskripsi
            </h3>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-300 leading-relaxed">{task.deskripsi}</p>
            </div>
          </div>

          {/* File Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              File Tugas
            </h3>
            <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <button
                  onClick={handlePreviewFile}
                  className="text-blue-300 hover:text-blue-200 underline underline-offset-2"
                  title="Lihat file"
                >
                  {task.file_tugas}
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePreviewFile}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleDownloadFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>

          {/* Task Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mentor Information */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-400" />
                Mentor
              </h4>
              <p className="text-gray-300 text-lg">{task.nama_mentor}</p>
            </div>

            {/* Student Information */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-400" />
                Siswa
              </h4>
              {task.nama_siswa ? (
                <div className="flex flex-wrap gap-2">
                  {task.nama_siswa.split(',').map((name) => (
                    <span
                      key={name.trim()}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-sm"
                    >
                      {name.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Tidak ada data siswa</p>
              )}
            </div>

            {/* Assignment Date */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Waktu Diberikan
              </h4>
              <p className="text-gray-300">{formatDate(task.waktu_diberikan)}</p>
            </div>

            {/* Deadline */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-400" />
                Batas Waktu
              </h4>
              <p className="text-gray-300">{formatDate(task.batas_waktu)}</p>
            </div>
          </div>

          {/* Priority Information */}
          <div className="mt-6 bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
              <div className={`w-5 h-5 mr-2 ${priorityConfig.color}`}>
                {priorityConfig.icon}
              </div>
              Tingkat Prioritas
            </h4>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full ${priorityConfig.bg} text-white font-medium`}>
                {priorityConfig.text}
              </div>
              <span className="text-gray-400 text-sm">
                {task.priority.toLowerCase() === 'high' && 'Tugas ini memerlukan perhatian segera'}
                {task.priority.toLowerCase() === 'medium' && 'Tugas ini memiliki prioritas sedang'}
                {task.priority.toLowerCase() === 'low' && 'Tugas ini dapat dikerjakan dengan fleksibilitas waktu'}
                {!['high', 'medium', 'low'].includes(task.priority.toLowerCase()) && 'Tugas dengan prioritas normal'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
