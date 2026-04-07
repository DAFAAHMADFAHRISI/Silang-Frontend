import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Lock, Unlock,
  FileSpreadsheet, Download, Upload, RefreshCw, ChevronLeft,
  Calendar, User, MapPin, Clock, Trash2, Eye, EyeOff,
  FileCheck, AlertCircle, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../../services/api';

// ===== INTERFACES =====
interface Schedule {
  id: number;
  mentor_id: number;
  period_start: string;
  period_end: string;
  status: 'draft' | 'validated' | 'locked' | 'applied' | 'rejected';
  validated_by_nama?: string;
  locked_by_nama?: string;
  validated_at?: string;
  locked_at?: string;
  rejection_reason?: string;
  export_filename?: string;
  total_entries: number;
  conflict_entries: number;
  created_at: string;
}

interface ScheduleEntry {
  id: number;
  schedule_id: number;
  siswa_id: number;
  mentor_id: number;
  tanggal: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  lokasi_nama: string | null;
  latitude: number | null;
  longitude: number | null;
  radius_meter: number | null;
  catatan: string | null;
  conflict_flag: number;
  conflict_detail: string | null;
  siswa_nama: string;
  siswa_status: string;
}

interface ConflictDetail {
  entry_id: number;
  siswa_id: number;
  siswa_nama: string;
  tanggal: string;
  lokasi: string | null;
  detail: string[];
}

// ===== STATUS BADGE COMPONENT =====
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    draft: { bg: 'bg-gray-600', text: 'Draft', icon: <AlertCircle className="w-3 h-3" /> },
    validated: { bg: 'bg-emerald-600', text: 'Validated', icon: <CheckCircle className="w-3 h-3" /> },
    locked: { bg: 'bg-amber-600', text: 'Locked', icon: <Lock className="w-3 h-3" /> },
    applied: { bg: 'bg-blue-600', text: 'Applied', icon: <FileCheck className="w-3 h-3" /> },
    rejected: { bg: 'bg-red-600', text: 'Rejected', icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[status] || config.draft;
  return (
    <span className={`${c.bg} text-white px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5`}>
      {c.icon} {c.text}
    </span>
  );
};

// ===== MAIN COMPONENT =====
const ScheduleValidation: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([]);
  const [showEntries, setShowEntries] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [expandedSchedule, setExpandedSchedule] = useState<number | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPeriod, setUploadPeriod] = useState({ period_start: '', period_end: '' });

  const navigate = useNavigate();

  // ===== FETCH SCHEDULES =====
  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/mentor/schedule/schedules');
      if (res.data.success) {
        setSchedules(res.data.data);
      }
    } catch (err: any) {
      showNotif('error', err.response?.data?.message || 'Gagal memuat data jadwal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // ===== NOTIFICATION HELPER =====
  const showNotif = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // ===== VALIDATE =====
  const handleValidate = async (scheduleId: number) => {
    try {
      setActionLoading(`validate-${scheduleId}`);
      const res = await api.post(`/api/mentor/schedule/validate/${scheduleId}`);
      if (res.data.success) {
        const data = res.data.data;
        if (data.has_conflict) {
          showNotif('error', `Ditemukan ${data.conflict_count} konflik. Perbaiki sebelum lanjut.`);
          // Auto-load conflicts
          await loadConflicts(scheduleId);
        } else {
          showNotif('success', 'Validasi berhasil! Tidak ada konflik. Jadwal siap di-lock.');
        }
        fetchSchedules();
      }
    } catch (err: any) {
      showNotif('error', err.response?.data?.message || 'Gagal memvalidasi jadwal');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== LOCK =====
  const handleLock = async (scheduleId: number) => {
    if (!window.confirm('Yakin ingin mengunci jadwal ini? Setelah di-lock, jadwal siap di-export dan di-apply.')) return;
    try {
      setActionLoading(`lock-${scheduleId}`);
      const res = await api.post(`/api/mentor/schedule/lock/${scheduleId}`);
      if (res.data.success) {
        showNotif('success', 'Jadwal berhasil di-lock! Siap untuk di-export atau di-apply.');
        fetchSchedules();
      }
    } catch (err: any) {
      showNotif('error', err.response?.data?.message || 'Gagal mengunci jadwal');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== REJECT =====
  const handleReject = async (scheduleId: number) => {
    if (!rejectReason.trim()) {
      showNotif('error', 'Masukkan alasan penolakan');
      return;
    }
    try {
      setActionLoading(`reject-${scheduleId}`);
      const res = await api.post(`/api/mentor/schedule/reject/${scheduleId}`, { reason: rejectReason });
      if (res.data.success) {
        showNotif('success', 'Jadwal berhasil di-reject.');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedSchedule(null);
        fetchSchedules();
      }
    } catch (err: any) {
      showNotif('error', err.response?.data?.message || 'Gagal menolak jadwal');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== EXPORT EXCEL =====
  const handleExport = async (scheduleId: number) => {
    try {
      setActionLoading(`export-${scheduleId}`);
      const res = await api.post(`/api/mentor/schedule/export/${scheduleId}`);
      if (res.data.success) {
        const { filename, download_url } = res.data.data;
        showNotif('success', `Excel berhasil dibuat: ${filename}`);
        // Auto-download
        window.open(`http://localhost:3000${download_url}`, '_blank');
        fetchSchedules();
      }
    } catch (err: any) {
      showNotif('error', err.response?.data?.message || 'Gagal export Excel');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== APPLY =====
  const handleApply = async (scheduleId: number) => {
    if (!window.confirm('Yakin ingin menerapkan jadwal ini ke penugasan aktif (work_assignments)?')) return;
    try {
      setActionLoading(`apply-${scheduleId}`);
      const res = await api.post(`/api/mentor/work-assignments/auto-apply/${scheduleId}`);
      if (res.data.success) {
        const data = res.data.data;
        showNotif('success', `Berhasil! ${data.applied_count} penugasan diterapkan.`);
        fetchSchedules();
      }
    } catch (err: any) {
      showNotif('error', err.response?.data?.message || 'Gagal menerapkan jadwal');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== LOAD ENTRIES =====
  const loadEntries = async (scheduleId: number) => {
    try {
      const res = await api.get(`/api/mentor/schedule/entries/${scheduleId}`);
      if (res.data.success) {
        setEntries(res.data.data);
        setShowEntries(true);
        setShowConflicts(false);
      }
    } catch (err: any) {
      showNotif('error', 'Gagal memuat detail entri');
    }
  };

  // ===== LOAD CONFLICTS =====
  const loadConflicts = async (scheduleId: number) => {
    try {
      const res = await api.get(`/api/mentor/schedule/conflicts/${scheduleId}`);
      if (res.data.success) {
        setConflicts(res.data.data.entries || []);
        setShowConflicts(true);
        setShowEntries(false);
      }
    } catch (err: any) {
      showNotif('error', 'Gagal memuat data konflik');
    }
  };

  // ===== DELETE ENTRY =====
  const handleDeleteEntry = async (scheduleId: number, entryId: number) => {
    if (!window.confirm('Hapus entri ini? Entri yang dihapus tidak bisa dikembalikan.')) return;
    try {
      await api.delete(`/api/mentor/schedule/entries/${scheduleId}/${entryId}`);
      showNotif('success', 'Entri berhasil dihapus');
      loadEntries(scheduleId);
    } catch (err: any) {
      showNotif('error', 'Gagal menghapus entri');
    }
  };

  // ===== UPLOAD EXCEL =====
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadPeriod.period_start || !uploadPeriod.period_end) {
      showNotif('error', 'Pilih file dan isi periode');
      return;
    }
    try {
      setActionLoading('upload');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('period_start', uploadPeriod.period_start);
      formData.append('period_end', uploadPeriod.period_end);

      const res = await api.post('/api/mentor/schedule/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showNotif(
          res.data.data.has_conflict ? 'error' : 'success',
          res.data.message
        );
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadPeriod({ period_start: '', period_end: '' });
        fetchSchedules();
      }
    } catch (err: any) {
      showNotif('error', err.response?.data?.message || 'Gagal upload Excel');
    } finally {
      setActionLoading(null);
    }
  };

  // ===== FORMAT HELPERS =====
  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateTime = (d: string | null | undefined) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ===== FILTER =====
  const filteredSchedules = schedules.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      s.id.toString().includes(term) ||
      s.status.includes(term) ||
      (s.period_start || '').includes(term) ||
      (s.period_end || '').includes(term)
    );
  });

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Memuat data jadwal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6 min-h-screen">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] max-w-md px-4 py-3 rounded-lg shadow-2xl border transition-all duration-300 ${notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-600 text-emerald-200' :
          notification.type === 'error' ? 'bg-red-900/90 border-red-600 text-red-200' :
            'bg-blue-900/90 border-blue-600 text-blue-200'
          }`}>
          <div className="flex items-start gap-2">
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> :
              notification.type === 'error' ? <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" /> :
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
            <p className="text-sm">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/mentor/work-assignments')} className="text-gray-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Hybrid Validation
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">Validasi · Lock · Export Excel</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-all duration-200 hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Upload Excel
            </button> */}
            <button
              onClick={fetchSchedules}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-700 mb-6" />

      {/* Flow Explanation */}
      <div className="mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" /> Alur Validasi Jadwal
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg">1️⃣ AI Generate / Upload</span>
          <span className="text-gray-600">→</span>
          <span className="bg-gray-600 text-white px-3 py-1.5 rounded-lg font-medium">Draft</span>
          <span className="text-gray-600">→</span>
          <span className="bg-emerald-700 text-white px-3 py-1.5 rounded-lg font-medium">2️⃣ Validate</span>
          <span className="text-gray-600">→</span>
          <span className="bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium">3️⃣ Lock 🔒</span>
          <span className="text-gray-600">→</span>
          <span className="bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium">4️⃣ Apply / Export</span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Cari jadwal (ID, status, periode)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
        />
      </div>

      {/* Schedule List */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">Belum ada jadwal untuk divalidasi</p>
          <p className="text-gray-600 text-sm mt-1">Generate jadwal via AI atau upload Excel untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => (
            <div key={schedule.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all duration-200">
              {/* Schedule Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedSchedule(expandedSchedule === schedule.id ? null : schedule.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-gray-700 rounded-lg p-2 shrink-0">
                      <Calendar className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white text-sm">Jadwal #{schedule.id}</span>
                        <StatusBadge status={schedule.status} />
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {formatDate(schedule.period_start)} — {formatDate(schedule.period_end)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {schedule.total_entries} entri
                    </span>
                    {schedule.conflict_entries > 0 && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> {schedule.conflict_entries} konflik
                      </span>
                    )}
                    {expandedSchedule === schedule.id ? (
                      <ChevronUp className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedSchedule === schedule.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-850">
                  {/* Meta info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-xs">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-gray-500">Dibuat</p>
                      <p className="text-gray-300 mt-0.5">{formatDateTime(schedule.created_at)}</p>
                    </div>
                    {schedule.validated_at && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-gray-500">Divalidasi oleh</p>
                        <p className="text-gray-300 mt-0.5">{schedule.validated_by_nama || '-'}</p>
                      </div>
                    )}
                    {schedule.locked_at && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-gray-500">Di-lock oleh</p>
                        <p className="text-gray-300 mt-0.5">{schedule.locked_by_nama || '-'}</p>
                      </div>
                    )}
                    {schedule.export_filename && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-gray-500">File Export</p>
                        <p className="text-emerald-400 mt-0.5 truncate">{schedule.export_filename}</p>
                      </div>
                    )}
                    {schedule.rejection_reason && (
                      <div className="bg-red-900/20 rounded-lg p-3 col-span-2">
                        <p className="text-red-400">Alasan Reject</p>
                        <p className="text-gray-300 mt-0.5">{schedule.rejection_reason}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    {/* Validate - only for draft */}
                    {schedule.status === 'draft' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleValidate(schedule.id); }}
                        disabled={actionLoading === `validate-${schedule.id}`}
                        className="w-full sm:w-auto justify-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        {actionLoading === `validate-${schedule.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        Validasi
                      </button>
                    )}

                    {/* Lock - only for validated */}
                    {schedule.status === 'validated' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLock(schedule.id); }}
                        disabled={actionLoading === `lock-${schedule.id}`}
                        className="w-full sm:w-auto justify-center bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        {actionLoading === `lock-${schedule.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Lock Jadwal
                      </button>
                    )}

                    {/* Export - only for locked or applied */}
                    {['locked', 'applied'].includes(schedule.status) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleExport(schedule.id); }}
                        disabled={actionLoading === `export-${schedule.id}`}
                        className="w-full sm:w-auto justify-center bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        {actionLoading === `export-${schedule.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        Export Excel
                      </button>
                    )}

                    {/* Apply - only for locked */}
                    {schedule.status === 'locked' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApply(schedule.id); }}
                        disabled={actionLoading === `apply-${schedule.id}`}
                        className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        {actionLoading === `apply-${schedule.id}` ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Terapkan
                      </button>
                    )}

                    {/* Download existing export */}
                    {schedule.export_filename && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`http://localhost:3000/exports/${schedule.export_filename}`, '_blank');
                        }}
                        className="w-full sm:w-auto justify-center bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    )}

                    {/* View entries */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSchedule(schedule);
                        loadEntries(schedule.id);
                      }}
                      className="w-full sm:w-auto justify-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" /> Lihat Detail
                    </button>

                    {/* View conflicts */}
                    {schedule.conflict_entries > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchedule(schedule);
                          loadConflicts(schedule.id);
                        }}
                        className="w-full sm:w-auto justify-center bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" /> Lihat Konflik
                      </button>
                    )}

                    {/* Reject - for draft or validated */}
                    {['draft', 'validated'].includes(schedule.status) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchedule(schedule);
                          setShowRejectModal(true);
                        }}
                        className="w-full sm:w-auto justify-center bg-red-900 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ===== ENTRIES MODAL ===== */}
      {showEntries && selectedSchedule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Detail Entri — Jadwal #{selectedSchedule.id}
              </h2>
              <button onClick={() => { setShowEntries(false); setSelectedSchedule(null); }} className="text-gray-400 hover:text-white p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto flex-1 p-4">
              {entries.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada entri. Validasi jadwal untuk expand data.</p>
              ) : (
                <table className="w-full min-w-max md:min-w-0 text-xs md:text-sm whitespace-nowrap md:whitespace-normal">
                  <thead className="bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-400">Tanggal</th>
                      <th className="px-3 py-2 text-left text-gray-400">Siswa</th>
                      <th className="px-3 py-2 text-left text-gray-400">Lokasi</th>
                      <th className="px-3 py-2 text-center text-gray-400">Jam</th>
                      <th className="px-3 py-2 text-center text-gray-400">Status</th>
                      <th className="px-3 py-2 text-center text-gray-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => (
                      <tr key={entry.id} className={`border-t border-gray-700 ${entry.conflict_flag ? 'bg-red-900/20' : 'hover:bg-gray-700/30'}`}>
                        <td className="px-3 py-2 text-gray-300">{formatDate(entry.tanggal)}</td>
                        <td className="px-3 py-2 text-white font-medium">{entry.siswa_nama}</td>
                        <td className="px-3 py-2 text-gray-300">{entry.lokasi_nama || '-'}</td>
                        <td className="px-3 py-2 text-center text-gray-400">
                          {entry.jam_mulai ? `${entry.jam_mulai} - ${entry.jam_selesai || '?'}` : '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {entry.conflict_flag ? (
                            <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs">Konflik</span>
                          ) : (
                            <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-xs">OK</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {selectedSchedule.status === 'draft' && (
                            <button
                              onClick={() => handleDeleteEntry(selectedSchedule.id, entry.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                              title="Hapus entri"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CONFLICTS MODAL ===== */}
      {showConflicts && selectedSchedule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Konflik — Jadwal #{selectedSchedule.id}
              </h2>
              <button onClick={() => { setShowConflicts(false); setSelectedSchedule(null); }} className="text-gray-400 hover:text-white p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto flex-1 p-4 space-y-3">
              {conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                  <p className="text-gray-400">Tidak ada konflik!</p>
                </div>
              ) : (
                conflicts.map((c, idx) => (
                  <div key={idx} className="bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-red-400" />
                      <span className="text-white font-medium text-sm">{c.siswa_nama}</span>
                      <span className="text-gray-500 text-xs">• {formatDate(c.tanggal)}</span>
                      {c.lokasi && <span className="text-gray-500 text-xs">• {c.lokasi}</span>}
                    </div>
                    <ul className="space-y-1 ml-6">
                      {c.detail.map((d, i) => (
                        <li key={i} className="text-red-300 text-xs flex items-start gap-1.5">
                          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== REJECT MODAL ===== */}
      {showRejectModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Reject Jadwal #{selectedSchedule.id}
            </h2>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">Alasan Penolakan</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Masukkan alasan mengapa jadwal ini ditolak..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(selectedSchedule.id)}
                disabled={actionLoading === `reject-${selectedSchedule.id}`}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => { setShowRejectModal(false); setSelectedSchedule(null); setRejectReason(''); }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== UPLOAD MODAL ===== */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload Jadwal dari Excel
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">File Excel (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm file:mr-3 file:bg-purple-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:text-xs file:cursor-pointer"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Kolom yang dibutuhkan: Tanggal, Nama Siswa / Siswa_ID (opsional: Lokasi, Latitude, Longitude, Radius, Jam Mulai, Jam Selesai, Catatan)
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Periode Mulai</label>
                  <input
                    type="date"
                    value={uploadPeriod.period_start}
                    onChange={(e) => setUploadPeriod({ ...uploadPeriod, period_start: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Periode Selesai</label>
                  <input
                    type="date"
                    value={uploadPeriod.period_end}
                    onChange={(e) => setUploadPeriod({ ...uploadPeriod, period_end: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={actionLoading === 'upload'}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {actionLoading === 'upload' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload & Validasi
                </button>
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setUploadFile(null); }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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

export default ScheduleValidation;
