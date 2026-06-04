import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BarChart3,
  Search,
  TrendingUp,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import api from "../../../services/api";

interface ActivitySummaryRow {
  siswa_id: number;
  siswa_nama: string;
  institusi: string;
  total_hari_hadir: number;
  present_days: number;
  late_days: number;
  total_tugas_diberikan: number;
  total_tugas_selesai: number;
  total_nilai: number;
  rata_rata_nilai: number;
}

const ActivitySummary: React.FC = () => {
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [data, setData] = useState<ActivitySummaryRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [aiSummary, setAiSummary] = useState<{
    siswa_id: number;
    siswa_nama: string;
    summary: string;
  } | null>(null);
  const [generatingSummaryId, setGeneratingSummaryId] = useState<number | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const navigate = useNavigate();

  const toDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getLast7DaysRange = () => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    return { start: toDateString(sevenDaysAgo), end: toDateString(today) };
  };

  const getThisMonthRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: toDateString(firstDay), end: toDateString(lastDay) };
  };

  const formatSummaryText = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={`br-${index}`} />;

      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <h3
            key={index}
            className="text-lg font-bold text-purple-300 mt-4 mb-2"
          >
            {trimmed.replace(/\*\*/g, "")}
          </h3>
        );
      }

      if (/^[-•*]\s/.test(trimmed)) {
        return (
          <li key={index} className="ml-4 text-gray-200 list-disc">
            {trimmed.replace(/^[-•*]\s/, "")}
          </li>
        );
      }

      const boldParts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={index} className="text-gray-200 mb-2 leading-relaxed">
          {boldParts.map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="text-white font-semibold">
                {part.replace(/\*\*/g, "")}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "mentor") {
      setError("Anda tidak memiliki akses ke halaman ini.");
      setInitializing(false);
      return;
    }

    const { start: defaultStart, end: defaultEnd } = getLast7DaysRange();

    setStart(defaultStart);
    setEnd(defaultEnd);

    fetchSummary(defaultStart, defaultEnd).finally(() => {
      setInitializing(false);
    });
  }, []);

  const fetchSummary = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      setData([]);

      const response = await api.get("/api/mentor/rekap-mentor/activity-summary", {
        params: { start: startDate, end: endDate },
      });

      if (!response.data || response.data.success === false) {
        throw new Error(response.data?.message || "Gagal memuat ringkasan aktivitas.");
      }

      setData(response.data.data || []);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal memuat ringkasan aktivitas.";
      setError(msg);
      console.error("Error fetching activity summary:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) return;
    fetchSummary(start, end);
  };

  const handleResetPeriod = () => {
    const { start: defaultStart, end: defaultEnd } = getLast7DaysRange();
    setStart(defaultStart);
    setEnd(defaultEnd);
    fetchSummary(defaultStart, defaultEnd);
  };

  const handleThisMonth = () => {
    const { start: monthStart, end: monthEnd } = getThisMonthRange();
    setStart(monthStart);
    setEnd(monthEnd);
    fetchSummary(monthStart, monthEnd);
  };

  const filteredData = data.filter((row) => {
    const term = searchTerm.toLowerCase();
    return (
      row.siswa_nama.toLowerCase().includes(term) ||
      row.institusi.toLowerCase().includes(term)
    );
  });

  const generateAISummary = async (siswaId: number, siswaNama: string) => {
    if (!start || !end) {
      alert("Pilih periode terlebih dahulu");
      return;
    }

    try {
      setGeneratingSummaryId(siswaId);

      const response = await api.post("/api/mentor/rekap-mentor/ai-summary", {
        siswa_id: siswaId,
        period_start: start,
        period_end: end,
      });

      if (response.data?.success) {
        setAiSummary({
          siswa_id: siswaId,
          siswa_nama: siswaNama,
          summary: response.data.data.summary,
        });
        setShowSummaryModal(true);
      } else {
        throw new Error(response.data?.message || "Gagal generate ringkasan");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal generate ringkasan aktivitas.";
      alert(msg);
    } finally {
      setGeneratingSummaryId(null);
    }
  };

  const totalSiswa = filteredData.length;
  const totalHadir = filteredData.reduce(
    (sum, row) => sum + (row.total_hari_hadir || 0),
    0
  );
  const totalTelat = filteredData.reduce(
    (sum, row) => sum + (row.late_days || 0),
    0
  );
  const rataRataNilaiGlobal =
    filteredData.length > 0
      ? (
        filteredData.reduce(
          (sum, row) => sum + (row.rata_rata_nilai || 0),
          0
        ) / filteredData.length
      ).toFixed(2)
      : "0";

  if (initializing) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Menyiapkan halaman ringkasan aktivitas...</p>
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
            <div className="space-y-2">
              <button
                onClick={() => fetchSummary(start, end)}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => navigate("/Login")}
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6 mt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ringkasan Aktivitas Peserta
            </h1>
          </div>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">
          Rekap kehadiran dan tugas siswa dalam periode tertentu.
        </p>
      </div>

      <div className="border-t border-gray-700/50 my-6 w-full" />

      {/* Period Picker + Search */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Periode Mulai</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-blue-400 mr-2" />
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="bg-transparent flex-1 text-white focus:outline-none text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 mb-1 text-sm">Periode Akhir</label>
            <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-purple-400 mr-2" />
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="bg-transparent flex-1 text-white focus:outline-none text-sm"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 text-sm font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memuat...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Cari</span>
              </>
            )}
          </button>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-gray-400 font-medium">pilih cepat:</span>
          <button
            type="button"
            onClick={handleThisMonth}
            disabled={loading}
            className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/30 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all disabled:opacity-60"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>Bulan Ini</span>
          </button>
          <button
            type="button"
            onClick={handleResetPeriod}
            className="bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 border border-gray-700/50 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>7 Hari Terakhir</span>
          </button>
        </div>
      </form>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama siswa atau institusi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 sm:p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-[10px] sm:text-xs font-medium mb-1">
              Total Siswa
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalSiswa}</p>
          </div>
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 sm:p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-[10px] sm:text-xs font-medium mb-1">
              Total Hari Hadir
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalHadir}</p>
          </div>
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg flex-shrink-0">
            <Calendar className="w-5 h-5 sm:w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-3 sm:p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-[10px] sm:text-xs font-medium mb-1">
              Total Hari Telat
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalTelat}</p>
          </div>
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 h-6 text-white" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 sm:p-4 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-[10px] sm:text-xs font-medium mb-1">
              Rata-rata Nilai
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">{rataRataNilaiGlobal}</p>
          </div>
          <div className="p-2 sm:p-3 bg-white/20 rounded-lg flex-shrink-0">
            <BarChart3 className="w-5 h-5 sm:w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Tabel ringkasan */}
      <div className="bg-gray-900/60 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Ringkasan Per Siswa ({filteredData.length})</span>
          </h2>
        </div>

        {filteredData.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Tidak ada data ringkasan untuk periode dan filter yang dipilih.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="flex flex-col gap-4 lg:hidden p-4">
              {filteredData.map((row, index) => (
                <div
                  key={row.siswa_id}
                  className="bg-gray-800/70 rounded-xl border border-gray-700/60 p-4 space-y-3"
                >
                  {/* Header: Student Name and Index */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {row.siswa_nama}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {row.institusi}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid for attendance & task statistics */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">
                        Kehadiran
                      </p>
                      <p className="text-gray-200 font-medium">
                        Hadir:{" "}
                        <span className="text-green-400 font-semibold">
                          {row.total_hari_hadir} hari
                        </span>
                      </p>
                      <p className="text-gray-200 font-medium">
                        Telat:{" "}
                        <span className="text-red-400 font-semibold">
                          {row.late_days} hari
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">
                        Tugas
                      </p>
                      <p className="text-gray-200 font-medium">
                        Diberikan:{" "}
                        <span className="text-blue-400 font-semibold">
                          {row.total_tugas_diberikan}
                        </span>
                      </p>
                      <p className="text-gray-200 font-medium">
                        Selesai:{" "}
                        <span className="text-purple-400 font-semibold">
                          {row.total_tugas_selesai}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Values row */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">
                        Total Nilai
                      </p>
                      <p className="text-white font-bold text-sm">
                        {row.total_nilai}
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-2.5 border border-gray-700/40">
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">
                        Rata-rata Nilai
                      </p>
                      <p className="text-blue-300 font-bold text-sm">
                        {row.rata_rata_nilai}
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-1">
                    <button
                      onClick={() =>
                        generateAISummary(row.siswa_id, row.siswa_nama)
                      }
                      disabled={generatingSummaryId !== null}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg text-xs font-semibold transition-all duration-300 transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                    >
                      {generatingSummaryId === row.siswa_id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Membuat AI Summary...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Summary</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-200">
                      Siswa
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-200">
                      Institusi
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-200">
                      Hari Hadir
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-200">
                      Hari Telat
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-200">
                      Tugas Diberikan
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-200">
                      Tugas Selesai
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-200">
                      Total Nilai
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-200">
                      Rata-rata Nilai
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-200">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, idx) => (
                    <tr
                      key={row.siswa_id}
                      className={idx % 2 === 0 ? "bg-gray-900" : "bg-gray-900/70"}
                    >
                      <td className="px-4 py-3 text-left text-gray-100">
                        {row.siswa_nama}
                      </td>
                      <td className="px-4 py-3 text-left text-gray-300">
                        {row.institusi}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-100">
                        {row.total_hari_hadir}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-100">
                        {row.late_days}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-100">
                        {row.total_tugas_diberikan}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-100">
                        {row.total_tugas_selesai}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-100">
                        {row.total_nilai}
                      </td>
                      <td className="px-4 py-3 text-center text-blue-300 font-semibold">
                        {row.rata_rata_nilai}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            generateAISummary(row.siswa_id, row.siswa_nama)
                          }
                          disabled={generatingSummaryId !== null}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg text-xs font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-1 mx-auto"
                        >
                          {generatingSummaryId === row.siswa_id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Membuat...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>AI Summary</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* AI Summary Modal */}
      {showSummaryModal && aiSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">
                  Ringkasan AI - {aiSummary.siswa_nama}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setAiSummary(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-400 mb-2">
                Periode: {start} hingga {end}
              </p>
            </div>
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-200 leading-relaxed">
                {formatSummaryText(aiSummary.summary)}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  setAiSummary(null);
                }}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
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

export default ActivitySummary;

