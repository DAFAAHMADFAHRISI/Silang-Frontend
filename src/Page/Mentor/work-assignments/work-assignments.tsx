import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, BarChart3, RefreshCw, Search, ChevronLeft } from "lucide-react";
import api from "../../../services/api";

interface ScheduleEntry {
  date?: string; // Optional karena sekarang menggunakan 1 periode
  day_name?: string;
  siswa_id: number;
  siswa_nama: string;
  start_time?: string;
  end_time?: string;
  type?: string;
  note?: string;
  catatan?: string;
  lokasi_saran?: string;
}

interface GeneratedSchedule {
  id: number;
  mentor_id: number;
  period_start: string;
  period_end: string;
  entries: ScheduleEntry[];
}

const getDefaultPeriod = () => {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 6);
  const toYMD = (d: Date) => d.toISOString().split("T")[0];
  return { period_start: toYMD(today), period_end: toYMD(end) };
};

const AutoWorkAssignments: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [schedule, setSchedule] = useState<GeneratedSchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  const handleBuatDanTerapkan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSchedule(null);

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError("Isi instruksi untuk AI terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);
      const { period_start, period_end } = getDefaultPeriod();

      const response = await api.post("/api/mentor/work-assignments/ai-generate", {
        period_start,
        period_end,
        prompt: trimmedPrompt,
      });
      if (!response.data || response.data.success === false) {
        throw new Error(response.data?.message || "Gagal menghasilkan jadwal dengan AI");
      }

      const data = response.data.data as GeneratedSchedule;
      setSchedule(data);

      setApplying(true);
      const applyRes = await api.post(
        `/api/mentor/work-assignments/auto-apply/${data.id}`,
        {}
      );
      if (!applyRes.data || applyRes.data.success === false) {
        throw new Error(applyRes.data?.message || "Gagal menerapkan jadwal");
      }

      const applyData = applyRes.data.data as { applied_count: number };
      setMessage(
        `Jadwal berhasil diterapkan. ${applyData.applied_count} penugasan baru dibuat di Tugas Luar.`
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Gagal membuat atau menerapkan jadwal.";
      setError(msg);
    } finally {
      setLoading(false);
      setApplying(false);
    }
  };

  const filteredEntries =
    schedule?.entries.filter((e) => {
      const term = searchTerm.toLowerCase();
      return (
        (e.siswa_nama || "").toLowerCase().includes(term) ||
        (e.lokasi_saran || "").toLowerCase().includes(term) ||
        (e.catatan || "").toLowerCase().includes(term) ||
        (schedule?.period_start || "").toLowerCase().includes(term) ||
        (schedule?.period_end || "").toLowerCase().includes(term)
      );
    }) || [];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate("/mentor/work-assignments")}
              className="mr-2 text-gray-400 hover:text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Jadwal Penugasan Otomatis
            </h1>
          </div>
        </div>
        <p className="text-gray-400 mt-2 ml-10 text-sm">
          Buat jadwal penugasan otomatis untuk siswa berdasarkan jadwal absen dan relasi mentor–siswa.
        </p>
      </div>

      <hr className="border-gray-700 mb-6" />

      {/* Prompt untuk AI + Tombol Buat & Terapkan */}
      <form onSubmit={handleBuatDanTerapkan} className="mb-6">
        <div className="mb-4">
          <label className="block text-gray-300 mb-1 text-sm font-medium">
            Instruksi untuk AI
          </label>
          <p className="text-gray-500 text-xs mb-2">
            Tulis jadwal penugasan luar (wajib sebutkan tanggal, misal: tanggal 24 Februari 2026, atau besok, atau 25-27 Februari). Periode akan diambil dari tanggal yang Anda tulis. Jadwal langsung diterapkan ke Tugas Luar.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder=""
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-y min-h-[100px]"
            rows={4}
          />
        </div>
        <button
          type="submit"
          disabled={loading || applying}
          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading || applying ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{applying ? "Menerapkan..." : "Membuat jadwal..."}</span>
            </>
          ) : (
            <>
              <BarChart3 className="w-5 h-5" />
              <span>Buat & Terapkan dengan AI</span>
            </>
          )}
        </button>
      </form>

      {/* Search in entries */}
      {schedule && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari siswa atau tanggal (misal: Senin, 2025-11-03)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700/70 text-red-200 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 bg-green-900/40 border border-green-700/70 text-green-200 px-4 py-3 rounded-lg text-sm">
          {message}
        </div>
      )}

      {/* Preview jadwal (sudah otomatis diterapkan) */}
      {schedule && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">
                Jadwal Terakhir &middot; Periode {schedule.period_start} s.d.{" "}
                {schedule.period_end}
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Jadwal ini sudah otomatis diterapkan ke data Tugas Luar. Tabel di
                bawah adalah ringkasan penugasan yang dibuat oleh AI.
              </p>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-400 bg-gray-900/60 border border-gray-700 rounded-xl">
              Tidak ada entri jadwal yang cocok dengan filter.
            </div>
          ) : (
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold text-sm">
                    Periode: {schedule?.period_start} s.d. {schedule?.period_end}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {filteredEntries.length} penugasan
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-200">
                        Siswa
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-200">
                        Lokasi
                      </th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-200">
                        Jenis
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-200">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((e) => (
                      <tr
                        key={`${e.siswa_id}-${schedule?.period_start}`}
                        className="odd:bg-gray-900 even:bg-gray-900/70"
                      >
                        <td className="px-4 py-2 text-left text-gray-100">
                          {e.siswa_nama}
                        </td>
                        <td className="px-4 py-2 text-left text-gray-300">
                          {e.lokasi_saran || "Lokasi Luar Instansi"}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-100">
                          {e.type ?? "magang"}
                        </td>
                        <td className="px-4 py-2 text-left text-gray-300">
                          {e.note || e.catatan || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoWorkAssignments;

