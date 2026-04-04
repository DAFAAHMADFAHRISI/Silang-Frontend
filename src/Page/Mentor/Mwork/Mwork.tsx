import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Clock, CheckCircle, XCircle, AlertCircle, 
  Plus, Search, Filter, RefreshCw, Edit, Trash2, User, 
  Map, Navigation, Check, X, MessageSquare
} from 'lucide-react';
import api from '../../../services/api';
import LocationSearch from '../../../components/LocationSearch';

interface WorkAssignment {
  id: number;
  siswa_id: number;
  mentor_id: number;
  nama_lokasi: string;
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
  siswa_nama: string;
  siswa_email: string;
  siswa_foto: string | null;
}

interface Student {
  id: number;
  nama: string;
  email: string;
  foto_profile: string | null;
  no_hp: string | null;
}

const Mwork: React.FC = () => {
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [pendingRequests, setPendingRequests] = useState<WorkAssignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'aktif' | 'selesai'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'siswa' | 'mentor'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WorkAssignment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveRadius, setApproveRadius] = useState('');
  const navigate = useNavigate();

  // Form state untuk create assignment
  const [formData, setFormData] = useState({
    siswa_id: '',
    nama_lokasi: '',
    latitude: null as number | null,
    longitude: null as number | null,
    radius_meter: '',
    mulai: '',
    selesai: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchPendingRequests();
    fetchStudents();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mentor/work-assignments');
      if (response.data.success) {
        setAssignments(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data penugasan');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/api/mentor/work-assignments/pending');
      if (response.data.success) {
        setPendingRequests(response.data.data);
      }
    } catch (err: any) {
      console.error('Gagal memuat request pending:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      // Ambil semua siswa yang terhubung dengan mentor ini
      const response = await api.get('/api/mentor/work-assignments/siswa/list');
      if (response.data.success) {
        console.log('Siswa yang diambil:', response.data.data);
        setStudents(response.data.data || []);
      } else {
        console.error('Response tidak berhasil:', response.data);
        setStudents([]);
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar siswa:', err);
      console.error('Error details:', err.response?.data);
      setStudents([]);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/mentor/work-assignments/create', {
        siswa_id: parseInt(formData.siswa_id),
        nama_lokasi: formData.nama_lokasi,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius_meter: formData.radius_meter ? parseInt(formData.radius_meter) : null,
        mulai: formData.mulai || null,
        selesai: formData.selesai || null
      });

      if (response.data.success) {
        alert('Penugasan berhasil dibuat');
        setShowCreateModal(false);
        setFormData({
          siswa_id: '',
          nama_lokasi: '',
          latitude: null,
          longitude: null,
          radius_meter: '',
          mulai: '',
          selesai: ''
        });
        fetchAssignments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat penugasan');
    }
  };

  const handleApproveRequest = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menyetujui request ini?')) return;
    
    try {
      const response = await api.post(`/api/mentor/work-assignments/${id}/approve`, {
        radius_meter: approveRadius ? parseInt(approveRadius) : null
      });
      if (response.data.success) {
        alert('Request berhasil disetujui');
        fetchAssignments();
        fetchPendingRequests();
        setShowPendingModal(false);
        setSelectedRequest(null);
        setApproveRadius('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyetujui request');
    }
  };

  const handleRejectRequest = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('Harap masukkan alasan penolakan');
      return;
    }
    
    if (!window.confirm('Apakah Anda yakin ingin menolak request ini?')) return;
    
    try {
      const response = await api.post(`/api/mentor/work-assignments/${id}/reject`, {
        alasan: rejectReason
      });
      if (response.data.success) {
        alert('Request berhasil ditolak');
        fetchAssignments();
        fetchPendingRequests();
        setShowPendingModal(false);
        setSelectedRequest(null);
        setRejectReason('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menolak request');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus penugasan ini?')) return;
    
    try {
      const response = await api.delete(`/api/mentor/work-assignments/${id}`);
      if (response.data.success) {
        alert('Penugasan berhasil dihapus');
        fetchAssignments();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus penugasan');
    }
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
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
          Pending
        </span>
      );
    }
    if (assignment.status_request === 'approved') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white">
          Approved
        </span>
      );
    }
    if (assignment.status_request === 'rejected') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500 text-white">
          Rejected
        </span>
      );
    }
    if (assignment.status === 'aktif') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white">
          Aktif
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">
        Selesai
      </span>
    );
  };

  const filteredAssignments = assignments.filter(assignment => {
    const namaLokasi = assignment.nama_lokasi || '';
    const siswaNama = assignment.siswa_nama || '';
    const matchesSearch = namaLokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         siswaNama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesType = typeFilter === 'all' || assignment.request_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Penugasan Lokasi Luar
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => navigate('/mentor/work-assignments/auto')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
            >
              <Map className="w-4 h-4" />
              <span>Jadwal Otomatis</span>
            </button>
            <button
              onClick={() => navigate('/mentor/schedule-validation')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Lihat Hybrid Validation</span>
            </button>
            {pendingRequests.length > 0 && (
              <button
                onClick={() => setShowPendingModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 relative"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Request Pending</span>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Penugasan</span>
            </button>
          </div>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Kelola penugasan siswa di lokasi luar dan review request dari siswa.</p>
      </div>

      <hr className="border-gray-700 mb-6" />

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama lokasi atau siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu Approve</option>
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Tipe</option>
            <option value="mentor">Dari Mentor</option>
            <option value="siswa">Request Siswa</option>
          </select>
          <button
            onClick={fetchAssignments}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{assignment.nama_lokasi}</h3>
                {assignment.latitude && assignment.longitude && (
                  <p className="text-gray-400 text-xs mb-3">
                    GPS: {assignment.latitude.toFixed(6)}, {assignment.longitude.toFixed(6)}
                  </p>
                )}
              </div>
              {getStatusBadge(assignment)}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-400 text-sm">
                <User className="w-4 h-4 mr-2" />
                <span>{assignment.siswa_nama}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Mulai: {formatDate(assignment.mulai)}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <Clock className="w-4 h-4 mr-2" />
                <span>Selesai: {formatDate(assignment.selesai)}</span>
              </div>
              {assignment.radius_meter && (
                <div className="flex items-center text-gray-400 text-sm">
                  <Navigation className="w-4 h-4 mr-2" />
                  <span>Radius: {assignment.radius_meter}m</span>
                </div>
              )}
              {assignment.request_type === 'siswa' && assignment.alasan && (
                <div className="flex items-start text-gray-400 text-sm mt-2">
                  <MessageSquare className="w-4 h-4 mr-2 mt-1" />
                  <span className="flex-1">{assignment.alasan}</span>
                </div>
              )}
            </div>

            {assignment.status_request === 'pending' && (
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedRequest(assignment);
                    setShowPendingModal(true);
                  }}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Review</span>
                </button>
              </div>
            )}

            <div className="flex space-x-2">
              {assignment.request_type === 'mentor' || assignment.status_request === 'approved' ? (
                <>
                  <button
                    onClick={() => handleDelete(assignment.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Tidak ada penugasan ditemukan</p>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Tambah Penugasan Lokasi Luar</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Siswa</label>
                <select
                  required
                  value={formData.siswa_id}
                  onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Pilih Siswa</option>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.nama}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Tidak ada siswa tersedia</option>
                  )}
                </select>
                {students.length === 0 && (
                  <p className="text-yellow-400 text-xs mt-1">
                    Tidak ada siswa yang terhubung dengan mentor Anda. Hubungi admin untuk menambahkan siswa.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Cari Lokasi</label>
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
              <div>
                <label className="block text-gray-300 mb-2">Radius (meter)</label>
                <input
                  type="number"
                  value={formData.radius_meter}
                  onChange={(e) => setFormData({ ...formData, radius_meter: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.mulai}
                    onChange={(e) => setFormData({ ...formData, mulai: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.selesai}
                    onChange={(e) => setFormData({ ...formData, selesai: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Request Pending dari Siswa</h2>
            {selectedRequest ? (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">{selectedRequest.nama_lokasi}</h3>
                  {selectedRequest.latitude && selectedRequest.longitude && (
                    <p className="text-gray-400 text-xs mb-4">
                      GPS: {selectedRequest.latitude.toFixed(6)}, {selectedRequest.longitude.toFixed(6)}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-400">
                      <User className="w-4 h-4 mr-2" />
                      <span>{selectedRequest.siswa_nama}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(selectedRequest.mulai)} - {formatDate(selectedRequest.selesai)}</span>
                    </div>
                    {selectedRequest.alasan && (
                      <div className="flex items-start text-gray-400">
                        <MessageSquare className="w-4 h-4 mr-2 mt-1" />
                        <span className="flex-1">{selectedRequest.alasan}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Radius (meter) - Opsional</label>
                  <input
                    type="number"
                    value={approveRadius}
                    onChange={(e) => setApproveRadius(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan radius dalam meter (opsional)"
                  />
                  <p className="text-gray-400 text-xs mt-1">Hanya mentor yang dapat mengatur radius untuk penugasan di luar</p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Alasan Penolakan (jika ditolak)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Masukkan alasan penolakan..."
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleApproveRequest(selectedRequest.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui</span>
                  </button>
                  <button
                    onClick={() => handleRejectRequest(selectedRequest.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Tolak</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(null);
                      setRejectReason('');
                      setApproveRadius('');
                      setShowPendingModal(false);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Kembali
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{request.nama_lokasi}</h3>
                        {request.latitude && request.longitude && (
                          <p className="text-gray-400 text-xs">
                            GPS: {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
                        Pending
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      <div className="flex items-center mb-1">
                        <User className="w-4 h-4 mr-2" />
                        <span>{request.siswa_nama}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatDate(request.mulai)} - {formatDate(request.selesai)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Review Request
                    </button>
                  </div>
                ))}
                {pendingRequests.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-400">Tidak ada request pending</p>
                  </div>
                )}
                <button
                  onClick={() => setShowPendingModal(false)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors mt-4"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Mwork;


