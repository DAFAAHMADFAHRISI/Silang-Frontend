import React from 'react';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Search, Eye, FileText, Clock, Building } from 'lucide-react';

interface RekapData {
  siswa_id: number;
  nama: string;
  institusi: string;
  total_tugas: number;
  tugas_selesai: number;
  total_nilai: number;
  rata_nilai: number;
}

interface DetailProps {
  selectedRekap: RekapData | null;
  showDetailModal: boolean;
  setShowDetailModal: (show: boolean) => void;
}

const Detail: React.FC<DetailProps> = ({ selectedRekap, showDetailModal, setShowDetailModal }) => {
  const getStatusColor = (rataNilai: number) => {
    if (rataNilai >= 85) return 'bg-green-500 text-white';
    if (rataNilai >= 70) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getStatusText = (rataNilai: number) => {
    if (rataNilai >= 85) return 'Baik';
    if (rataNilai >= 70) return 'Cukup';
    return 'Perlu Perhatian';
  };

  const getNilaiColor = (nilai: number) => {
    if (nilai >= 85) return 'text-green-400';
    if (nilai >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!showDetailModal || !selectedRekap) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Detail Rekap {selectedRekap.nama}</h2>
          <button
            onClick={() => setShowDetailModal(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* General Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Informasi Umum</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Nama Siswa:</span>
                <p className="text-white mt-1">{selectedRekap.nama}</p>
              </div>
              <div>
                <span className="text-gray-400">Institusi:</span>
                <p className="text-white mt-1">{selectedRekap.institusi}</p>
              </div>
              <div>
                <span className="text-gray-400">Status Akademik:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedRekap.rata_nilai)}`}>
                  {getStatusText(selectedRekap.rata_nilai)}
                </span>
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Performa Akademik</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Total Nilai:</span>
                <p className="font-semibold text-lg mt-1 text-white">
                  {selectedRekap.total_nilai}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Rata-rata Nilai:</span>
                <p className={`font-semibold text-lg mt-1 ${getNilaiColor(selectedRekap.rata_nilai)}`}>
                  {selectedRekap.rata_nilai}
                </p>
              </div>
            </div>
          </div>

          {/* Task Statistics */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">Statistik Tugas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Total Tugas:</span>
                <p className="text-white mt-1">{selectedRekap.total_tugas}</p>
              </div>
              <div>
                <span className="text-gray-400">Tugas Selesai:</span>
                <p className="text-green-400 mt-1">{selectedRekap.tugas_selesai}</p>
              </div>
              <div>
                <span className="text-gray-400">Tugas Belum Selesai:</span>
                <p className="text-red-400 mt-1">{selectedRekap.total_tugas - selectedRekap.tugas_selesai}</p>
              </div>
              <div>
                <span className="text-gray-400">Persentase Selesai:</span>
                <p className="text-blue-400 mt-1">
                  {selectedRekap.total_tugas > 0 ? Math.round((selectedRekap.tugas_selesai / selectedRekap.total_tugas) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Visualisasi Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress Tugas</span>
                  <span>{selectedRekap.total_tugas > 0 ? Math.round((selectedRekap.tugas_selesai / selectedRekap.total_tugas) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{width: `${selectedRekap.total_tugas > 0 ? (selectedRekap.tugas_selesai / selectedRekap.total_tugas) * 100 : 0}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Rata-rata Nilai</span>
                  <span>{selectedRekap.rata_nilai}</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{width: `${selectedRekap.rata_nilai}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
