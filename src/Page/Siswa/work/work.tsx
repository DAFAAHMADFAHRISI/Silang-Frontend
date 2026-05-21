import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  Plus, RefreshCw, Edit, Trash2, User, 
  Map, Navigation, Send, MessageSquare
} from 'lucide-react';
import api from '../../../services/api';
import LocationSearch from '../../../components/LocationSearch';
import { SiswaLoading, SiswaSearchFilter, SISWA_PAGE_CLASS } from '../components/SiswaLayout';

interface WorkAssignment {
  id: number;
  siswa_id: number;
  mentor_id: number;
  nama_lokasi: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meter: number | null;
  mulai: string | null;
  selesai: string | null;
  status: 'pending' | 'aktif' | 'selesai';
  request_type: 'siswa' | 'mentor';
  status_request: 'pending' | 'approved' | 'rejected' | null;
  alasan: string | null;
  created_at: string;
  mentor_nama: string | null;
  mentor_email: string | null;
  mentor_foto: string | null;
}

interface Mentor {
  id: number;
  nama: string;
  email: string;
}

const Work: React.FC = () => {
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'aktif' | 'selesai'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<WorkAssignment | null>(null);

  // Form state untuk request
  const [formData, setFormData] = useState({
    mentor_id: '',
    nama_lokasi: '',
    latitude: null as number | null,
    longitude: null as number | null,
    mulai: '',
    selesai: '',
    alasan: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchMentors();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/siswa/work-assignments');
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data penugasan');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      // Ambil mentor dari localStorage atau dari API jika ada endpoint
      // Untuk sementara, kita akan menggunakan mentor_id dari assignment yang sudah ada
      // Atau bisa membuat endpoint baru untuk get mentors
    } catch (err: any) {
      console.error('Gagal memuat daftar mentor:', err);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/siswa/work-assignments/request', {
        mentor_id: parseInt(formData.mentor_id),
        nama_lokasi: formData.nama_lokasi,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius_meter: null, // Siswa tidak bisa mengatur radius, hanya mentor
        mulai: formData.mulai || null,
        selesai: formData.selesai || null,
        alasan: formData.alasan || null
      });

      if (response.data.success) {
        alert('Request penugasan berhasil diajukan');
        setShowRequestModal(false);
        setFormData({
          mentor_id: '',
          nama_lokasi: '',
          latitude: null,
          longitude: null,
          mulai: '',
          selesai: '',
          alasan: ''
        });
        fetchAssignments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengajukan request');
    }
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;

    try {
      const response = await api.put(`/api/siswa/work-assignments/${selectedAssignment.id}`, {
        nama_lokasi: formData.nama_lokasi,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius_meter: null, // Siswa tidak bisa mengatur radius, hanya mentor
        mulai: formData.mulai || null,
        selesai: formData.selesai || null,
        alasan: formData.alasan || null
      });

      if (response.data.success) {
        alert('Request berhasil diupdate');
        setShowEditModal(false);
        setSelectedAssignment(null);
        fetchAssignments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengupdate request');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus request ini?')) return;
    
    try {
      const response = await api.delete(`/api/siswa/work-assignments/${id}`);
      if (response.data.success) {
        alert('Request berhasil dihapus');
        fetchAssignments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus request');
    }
  };

  const handleEdit = (assignment: WorkAssignment) => {
    if (assignment.status_request !== 'pending') {
      alert('Hanya request yang masih pending yang dapat diupdate');
      return;
    }
    setSelectedAssignment(assignment);
    setFormData({
      mentor_id: assignment.mentor_id.toString(),
      nama_lokasi: assignment.nama_lokasi || '',
      latitude: assignment.latitude,
      longitude: assignment.longitude,
      mulai: assignment.mulai || '',
      selesai: assignment.selesai || '',
      alasan: assignment.alasan || ''
    });
    setShowEditModal(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Tidak ditentukan';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (assignment: WorkAssignment) => {
    if (assignment.status_request === 'pending') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Pending</span>
        </span>
      );
    }
    if (assignment.status_request === 'approved') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>Approved</span>
        </span>
      );
    }
    if (assignment.status_request === 'rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white flex items-center space-x-1">
          <XCircle className="w-3 h-3" />
          <span>Rejected</span>
        </span>
      );
    }
    if (assignment.status === 'aktif') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white flex items-center space-x-1">
          <CheckCircle className="w-3 h-3" />
          <span>Aktif</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
        Selesai
      </span>
    );
  };

  // Extract unique mentors from assignments
  const uniqueMentors: Mentor[] = [];
  const seenMentorIds = new Set<number>();
  assignments.forEach(a => {
    if (!seenMentorIds.has(a.mentor_id)) {
      seenMentorIds.add(a.mentor_id);
      uniqueMentors.push({ id: a.mentor_id, nama: a.mentor_nama || 'Mentor', email: a.mentor_email || '' });
    }
  });

  const filteredAssignments = assignments.filter(assignment => {
    const namaLokasi = assignment.nama_lokasi || '';
    const mentorNama = assignment.mentor_nama || '';
    const matchesSearch = namaLokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentorNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <SiswaLoading message="Memuat data penugasan..." />;
  }

  return (
    <div className={SISWA_PAGE_CLASS}>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Penugasan Lokasi Luar
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              // Set mentor_id dari assignment pertama jika ada, atau kosongkan
              const firstMentor = uniqueMentors[0];
              setFormData({
                mentor_id: firstMentor ? firstMentor.id.toString() : '',
                nama_lokasi: '',
                latitude: null,
                longitude: null,
                mulai: '',
                selesai: '',
                alasan: ''
              });
              setShowRequestModal(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Ajukan Penugasan</span>
          </button>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Lihat dan kelola penugasan lokasi luar Anda.</p>
      </div>

      <hr className="border-gray-700 mb-4 sm:mb-6" />

      <SiswaSearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Cari nama lokasi atau mentor..."
        filterValue={statusFilter}
        onFilterChange={(v) => setStatusFilter(v as typeof statusFilter)}
        filterOptions={[
          { value: 'all', label: 'Semua Status' },
          { value: 'pending', label: 'Menunggu Approve' },
          { value: 'aktif', label: 'Aktif' },
          { value: 'selesai', label: 'Selesai' },
        ]}
      >
        <button
          type="button"
          onClick={fetchAssignments}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm w-full sm:w-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </SiswaSearchFilter>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 xl:gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-gray-800/70 rounded-xl p-4 sm:p-5 border border-gray-700/60 hover:border-gray-600/80 transition-colors">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 truncate">{assignment.nama_lokasi || 'Lokasi Luar Instansi'}</h3>
                {/* Lokasi akan diambil langsung dari GPS/Maps */}
              </div>
              <div className="ml-2 flex-shrink-0">
                {getStatusBadge(assignment)}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{assignment.mentor_nama || 'Mentor'}</span>
              </div>
              <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Mulai: {formatDate(assignment.mulai)}</span>
              </div>
              <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Selesai: {formatDate(assignment.selesai)}</span>
              </div>
              {assignment.radius_meter && (
                <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                  <Navigation className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Radius: {assignment.radius_meter}m</span>
                </div>
              )}
              {assignment.request_type === 'siswa' && assignment.alasan && (
                <div className="flex items-start text-gray-400 text-xs sm:text-sm mt-2">
                  <MessageSquare className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <span className="flex-1 line-clamp-2">{assignment.alasan}</span>
                </div>
              )}
              {assignment.status_request === 'rejected' && assignment.alasan && (
                <div className="flex items-start text-red-400 text-xs sm:text-sm mt-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                  <XCircle className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <span className="flex-1">{assignment.alasan}</span>
                </div>
              )}
            </div>

            {assignment.request_type === 'siswa' && assignment.status_request === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(assignment)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Tidak ada penugasan ditemukan</p>
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Ajukan Penugasan Lokasi Luar</h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm sm:text-base">Mentor</label>
                <select
                  required
                  value={formData.mentor_id}
                  onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="">Pilih Mentor</option>
                  {uniqueMentors.map((mentor: Mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm sm:text-base">Cari Lokasi</label>
                <LocationSearch
                  value={formData.nama_lokasi}
                  onChange={(location) => {
                    setFormData({
                      ...formData,
                      nama_lokasi: location.nama,
                      latitude: location.latitude,
                      longitude: location.longitude
                    });
                  }}
                  placeholder="Cari lokasi (contoh: Kejaksaan Kabupaten Sampang)"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Ketik nama lokasi untuk mencari dan otomatis mengambil koordinat GPS
                </p>
              </div>
              {/* Radius hanya bisa diatur oleh mentor, bukan siswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.mulai}
                    onChange={(e) => setFormData({ ...formData, mulai: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.selesai}
                    onChange={(e) => setFormData({ ...formData, selesai: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm sm:text-base">Alasan (Opsional)</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  rows={3}
                  placeholder="Jelaskan alasan mengapa Anda perlu penugasan di lokasi ini..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Edit Request Penugasan</h2>
            <form onSubmit={handleUpdateRequest} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2 text-sm sm:text-base">Nama Lokasi</label>
                <input
                  type="text"
                  required
                  value={formData.nama_lokasi}
                  onChange={(e) => setFormData({ ...formData, nama_lokasi: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                />
              </div>
              {/* Lokasi akan diambil langsung dari GPS/Maps */}
              {/* Radius hanya bisa diatur oleh mentor, bukan siswa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.mulai}
                    onChange={(e) => setFormData({ ...formData, mulai: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.selesai}
                    onChange={(e) => setFormData({ ...formData, selesai: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm sm:text-base">Alasan</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Work;

