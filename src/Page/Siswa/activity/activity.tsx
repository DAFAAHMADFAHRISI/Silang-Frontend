import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity as ActivityIcon,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  Award,
  RefreshCw,
  Search,
  UserCheck,
  AlertCircle,
  Grid3x3,
  List,
} from "lucide-react";
import api from "../../../services/api";
import Calendar from "../../../components/Calendar/Calendar";

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
  status: "pending" | "aktif" | "selesai";
  request_type: "siswa" | "mentor";
  status_request: "pending" | "approved" | "rejected" | null;
  alasan: string | null;
  created_at: string;
  mentor_nama: string;
  mentor_email: string;
  mentor_foto: string | null;
}

interface StreakData {
  current_streak: number;
  best_streak: number;
  last_activity_date: string | null;
}

interface PointsSummary {
  total_points: number;
  streak: StreakData;
}

interface PointsHistoryItem {
  id: number;
  source_type: "absensi" | "tugas";
  source_id: number;
  points: number;
  reason: string;
  event_date: string;
  created_at: string;
}

interface WorkActivity {
  id: number;
  work_assignment_id: number;
  siswa_id: number;
  activity_date: string;
  description: string | null;
  created_at: string;
  nama_lokasi: string;
  mulai: string | null;
  selesai: string | null;
}

type CalendarEvent = {
  id: number;
  date: string;
  title: string;
  description?: string;
  location?: string;
  time?: string;
  color?: string;
};

const ActivityPage: React.FC = () => {
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [pointsSummary, setPointsSummary] = useState<PointsSummary>({
    total_points: 0,
    streak: { current_streak: 0, best_streak: 0, last_activity_date: null },
  });
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryItem[]>([]);
  const [activities, setActivities] = useState<WorkActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityAssignmentId, setActivityAssignmentId] = useState<string>("");
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [activityDescription, setActivityDescription] = useState<string>("");
  const [savingActivity, setSavingActivity] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem("nama") || "Siswa";

  const toLocalYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayISO = toLocalYYYYMMDD(new Date());

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "siswa") {
      setError("Anda tidak memiliki akses ke halaman ini.");
      setLoading(false);
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [workRes, pointsRes, historyRes, activityRes] = await Promise.all([
        api.get("/api/siswa/work-assignments"),
        api.get("/api/siswa/points/me"),
        api.get("/api/siswa/points/history?today=true"),
        api.get("/api/siswa/work-activities?days=14"),
      ]);

      if (workRes.data?.success) {
        setAssignments(workRes.data.data || []);
      }

      if (pointsRes.data?.success && pointsRes.data.data) {
        setPointsSummary({
          total_points: pointsRes.data.data.total_points || 0,
          streak: pointsRes.data.data.streak || {
            current_streak: 0,
            best_streak: 0,
            last_activity_date: null,
          },
        });
      }

      if (historyRes.data?.success && historyRes.data.data) {
        setPointsHistory(historyRes.data.data || []);
      }

      if (activityRes.data?.success && activityRes.data.data) {
        setActivities(activityRes.data.data || []);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal memuat data aktivitas.";
      setError(msg);
      console.error("Error loading activity data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Tidak ditentukan";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Tanggal tidak valid";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeAssignments = assignments.filter(
    (a) =>
      a.status === "aktif" &&
      (a.request_type === "mentor" || a.status_request === "approved")
  );

  const filteredHistory = pointsHistory.filter((item) =>
    item.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Memuat data aktivitas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="w-10 h-10 text-red-500 mx-auto mb-4">⚠️</div>
            <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Aktivitas Magang
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">
          Rangkuman poin, streak, dan penugasan luar instansi untuk {userName}.
        </p>
      </div>

      <div className="border-t border-gray-700/50 my-4 sm:my-6 w-full" />

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs sm:text-sm font-medium">
              Total Poin
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {pointsSummary.total_points}
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs sm:text-sm font-medium">
              Streak Beruntun
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {pointsSummary.streak.current_streak} <span className="text-sm">hari</span>
            </p>
            {pointsSummary.streak.best_streak > 0 && (
              <p className="text-xs text-white/80 mt-1">
                Rekor: {pointsSummary.streak.best_streak} hari
              </p>
            )}
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <ActivityIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs sm:text-sm font-medium">
              Aktivitas Terakhir
            </p>
            <p className="text-sm sm:text-base font-semibold text-white">
              {pointsSummary.streak.last_activity_date
                ? formatDate(pointsSummary.streak.last_activity_date)
                : "Belum ada aktivitas"}
            </p>
          </div>
          <div className="p-3 bg-white/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Penugasan luar instansi aktif */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-3">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            <span>Penugasan Luar Instansi Aktif</span>
          </h2>
          {activeAssignments.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setActivityAssignmentId(activeAssignments[0].id.toString());
                setActivityDate(new Date().toISOString().split("T")[0]);
                setActivityDescription("");
                setShowActivityModal(true);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-2 text-xs sm:text-sm transition-all duration-300 transform hover:scale-105"
            >
              <ActivityIcon className="w-4 h-4" />
              <span>Isi Activity Hari Ini</span>
            </button>
          )}
        </div>
        {activeAssignments.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 text-center">
            <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-400 text-sm sm:text-base">
              Saat ini Anda tidak memiliki penugasan luar instansi yang aktif.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {activeAssignments.map((a) => (
              <div
                key={a.id}
                className="bg-gray-800/60 rounded-xl p-4 sm:p-5 border border-gray-700 hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-white mb-1 truncate">
                      {a.nama_lokasi || "Lokasi Luar Instansi"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Mentor: <span className="text-gray-200">{a.mentor_nama}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white flex items-center space-x-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Aktif</span>
                  </span>
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-gray-300">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0 text-blue-400" />
                    <span>
                      Periode: {formatDate(a.mulai)} - {formatDate(a.selesai)}
                    </span>
                  </div>
                  {a.radius_meter && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-cyan-400" />
                      <span>Radius absensi: {a.radius_meter} meter</span>
                    </div>
                  )}
                  {a.alasan && (
                    <div className="mt-1 text-xs text-gray-400">
                      <span className="font-medium text-gray-300">Catatan:</span>{" "}
                      {a.alasan}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-700/50 my-4 sm:my-6 w-full" />

      {/* Calendar View atau List View */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span>Aktivitas Harian</span>
          </h2>
          <div className="flex items-center space-x-2 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-1">
                <Grid3x3 className="w-4 h-4" />
                <span>Kalender</span>
              </div>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-1">
                <List className="w-4 h-4" />
                <span>Daftar</span>
              </div>
            </button>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <Calendar
            events={activities.map((activity) => ({
              id: activity.id,
              date: activity.activity_date,
              title: activity.nama_lokasi || "Aktivitas",
              description: activity.description || undefined,
              location: activity.nama_lokasi || undefined,
              color: "bg-green-600",
            }))}
            onDateClick={(date) => {
              const clickedISO = toLocalYYYYMMDD(new Date(date));
              setActivityDate(clickedISO);

              if (clickedISO !== todayISO) {
                alert("Pengisian aktivitas hanya bisa untuk hari ini.");
                return;
              }

              if (activeAssignments.length > 0) {
                setActivityAssignmentId(activeAssignments[0].id.toString());
                setActivityDescription("");
                setShowActivityModal(true);
              }
            }}
            onEventClick={(event) => {
              setSelectedEvent(event);
              setShowEventModal(true);
            }}
          />
        ) : (
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                <AlertCircle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">Belum ada aktivitas yang dicatat.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-gray-800/60 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <h3 className="font-semibold text-white">
                          {activity.nama_lokasi || "Lokasi Luar Instansi"}
                        </h3>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-300 mb-2">{activity.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{formatDate(activity.activity_date)}</span>
                        </div>
                        {activity.mulai && activity.selesai && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDate(activity.mulai)} - {formatDate(activity.selesai)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="border-t border-gray-700/50 my-4 sm:my-6 w-full" />

      {/* Riwayat poin hari ini */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center space-x-2">
            <ActivityIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span>Riwayat Aktivitas & Poin Hari Ini</span>
          </h2>
        </div>

        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari berdasarkan alasan poin (absensi, tugas, dll)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6 text-center">
            <AlertCircle className="w-8 h-8 sm:w-10 h-10 text-gray-500 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-400 text-sm sm:text-base">
              Belum ada poin yang didapat hari ini dari absensi atau tugas.
            </p>
          </div>
        ) : (
          <div className="bg-gray-900/60 border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs sm:text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-200">
                      Waktu
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-200">
                      Sumber
                    </th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-200">
                      Alasan
                    </th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-200">
                      Poin
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx % 2 === 0 ? "bg-gray-900" : "bg-gray-900/70"}
                    >
                      <td className="px-4 py-2 text-left text-gray-300">
                        {formatDateTime(item.event_date)}
                      </td>
                      <td className="px-4 py-2 text-left text-gray-300">
                        {item.source_type === "absensi" ? "Absensi" : "Tugas"}
                      </td>
                      <td className="px-4 py-2 text-left text-gray-200">
                        {item.reason}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={
                            item.points > 0
                              ? "text-green-400 font-semibold"
                              : "text-gray-400"
                          }
                        >
                          {item.points > 0 ? "+" : ""}
                          {item.points}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal tambah activity */}
      {showActivityModal && activeAssignments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center space-x-2">
              <ActivityIcon className="w-5 h-5 text-yellow-400" />
              <span>Catat Activity Penugasan Luar</span>
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!activityAssignmentId || !activityDate) return;
                if (activityDate !== todayISO) {
                  alert("Pengisian aktivitas hanya bisa untuk hari ini.");
                  return;
                }
                try {
                  setSavingActivity(true);
                  await api.post(
                    `/api/siswa/work-assignments/${activityAssignmentId}/activity`,
                    {
                      activity_date: activityDate,
                      description: activityDescription || null,
                    }
                  );
                  await loadData();
                  setShowActivityModal(false);
                } catch (err: any) {
                  alert(
                    err?.response?.data?.message ||
                      "Gagal menyimpan activity. Coba lagi."
                  );
                } finally {
                  setSavingActivity(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 mb-2 text-sm">
                  Penugasan Luar
                </label>
                <select
                  required
                  value={activityAssignmentId}
                  onChange={(e) => setActivityAssignmentId(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Pilih Penugasan</option>
                  {activeAssignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nama_lokasi || "Lokasi Luar Instansi"} (
                      {formatDate(a.mulai)} - {formatDate(a.selesai)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">
                  Tanggal Aktivitas
                </label>
                <input
                  type="date"
                  required
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  min={todayISO}
                  max={todayISO}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Hanya bisa mengisi aktivitas untuk hari ini.
                </p>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 text-sm">
                  Deskripsi Aktivitas
                </label>
                <textarea
                  value={activityDescription}
                  onChange={(e) => setActivityDescription(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Contoh: Mengembangkan fitur kasir di toko, memperbaiki bug, melakukan testing, dll."
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={savingActivity}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {savingActivity ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <ActivityIcon className="w-4 h-4" />
                      <span>Simpan Activity</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detail event aktivitas */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                  {selectedEvent.title || "Detail Aktivitas"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {formatDate(selectedEvent.date)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
              >
                Tutup
              </button>
            </div>

            {selectedEvent.location && (
              <div className="flex items-center text-sm text-gray-300 mb-3">
                <MapPin className="w-4 h-4 text-green-400 mr-2" />
                <span className="truncate">{selectedEvent.location}</span>
              </div>
            )}

            <div className="bg-gray-900/60 border border-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-200 whitespace-pre-wrap">
                {selectedEvent.description?.trim()
                  ? selectedEvent.description
                  : "Tidak ada deskripsi aktivitas."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;

