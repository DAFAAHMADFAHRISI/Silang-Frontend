import React from 'react';
import { User, Clock, MapPin, Image, Calendar, Eye } from 'lucide-react';

interface AbsensiEntry {
  id: number;
  waktu_checkin: string;
  waktu_checkout: string;
  checkin_face: string;
  checkout_face: string;
  checkin_location: string;
  checkout_location: string;
  created_at: string;
  telat: string;
  jadwal_masuk: string;
  jadwal_keluar: string;
}

interface SiswaAbsensi {
  siswa_id: number;
  siswa_nama: string;
  absensi: AbsensiEntry[];
}

interface DetailProps {
  selectedAbsensi: AbsensiEntry | null;
  selectedSiswa: SiswaAbsensi | null;
  showDetailModal: boolean;
  setShowDetailModal: (show: boolean) => void;
}

const Detail: React.FC<DetailProps> = ({ 
  selectedAbsensi, 
  selectedSiswa, 
  showDetailModal, 
  setShowDetailModal 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (telat: string) => {
    if (telat.includes('Telat')) {
      return 'bg-red-500 text-white';
    } else if (telat === '0 menit' || telat === 'Tepat Waktu') {
      return 'bg-green-500 text-white';
    } else {
      return 'bg-yellow-500 text-white';
    }
  };

  const getStatusText = (telat: string) => {
    if (telat.includes('Telat')) {
      return telat;
    } else if (telat === '0 menit') {
      return 'Tepat Waktu';
    } else {
      return 'Tepat Waktu';
    }
  };

  if (!showDetailModal || !selectedAbsensi || !selectedSiswa) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Detail Absensi {selectedSiswa.siswa_nama}</h2>
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
                <p className="text-white mt-1">{selectedSiswa.siswa_nama}</p>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedAbsensi.telat)}`}>
                  {getStatusText(selectedAbsensi.telat)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Jadwal Masuk:</span>
                <p className="text-white mt-1">{selectedAbsensi.jadwal_masuk}</p>
              </div>
              <div>
                <span className="text-gray-400">Jadwal Keluar:</span>
                <p className="text-white mt-1">{selectedAbsensi.jadwal_keluar}</p>
              </div>
            </div>
          </div>

          {/* Time & Location */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-400">Waktu & Lokasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Waktu Check-in:</span>
                <p className="text-white mt-1">{formatDate(selectedAbsensi.waktu_checkin)}</p>
              </div>
              <div>
                <span className="text-gray-400">Waktu Check-out:</span>
                <p className="text-white mt-1">{formatDate(selectedAbsensi.waktu_checkout)}</p>
              </div>
              <div>
                <span className="text-gray-400">Lokasi Check-in:</span>
                <p className="text-white mt-1">{selectedAbsensi.checkin_location}</p>
              </div>
              <div>
                <span className="text-gray-400">Lokasi Check-out:</span>
                <p className="text-white mt-1">{selectedAbsensi.checkout_location}</p>
              </div>
            </div>
          </div>

          {/* Photo Evidence */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-yellow-400">Bukti Foto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Foto Check-in:</span>
                <p className="text-blue-300 mt-1">{selectedAbsensi.checkin_face}</p>
              </div>
              <div>
                <span className="text-gray-400">Foto Check-out:</span>
                <p className="text-blue-300 mt-1">{selectedAbsensi.checkout_face}</p>
              </div>
            </div>
          </div>

          {/* Other Details */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-purple-400">Detail Lainnya</h3>
            <div>
              <span className="text-gray-400">Dibuat Pada:</span>
              <p className="text-white mt-1">{formatDate(selectedAbsensi.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
