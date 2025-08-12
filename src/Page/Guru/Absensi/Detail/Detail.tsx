import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { User, Clock, MapPin, Image, Calendar, Eye, ArrowLeft } from 'lucide-react';

interface AbsensiEntry {
  id: number;
  waktu_checkin: string;
  waktu_checkout: string;
  checkin_face: string;
  checkout_face: string;
  checkin_face_url?: string;
  checkout_face_url?: string;
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

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [absensi, setAbsensi] = useState<AbsensiEntry | null>(null);
  const [siswa, setSiswa] = useState<SiswaAbsensi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Photo modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, type: string, name: string} | null>(null);

  useEffect(() => {
    if (id) {
      fetchAbsensiDetail();
    }
  }, [id]);

  const fetchAbsensiDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      // Fetch all absensi data and find the specific one by ID
      const response = await fetch('http://localhost:3000/api/absensi-guru', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      const data = await response.json();
      const absensiData = Array.isArray(data) ? data : [data];
      
      // Find the specific absensi entry by ID
      let foundAbsensi = null;
      let foundSiswa = null;
      
      for (const siswaData of absensiData) {
        const absensiEntry = siswaData.absensi.find((entry: AbsensiEntry) => entry.id.toString() === id);
        if (absensiEntry) {
          foundAbsensi = absensiEntry;
          foundSiswa = siswaData;
          break;
        }
      }
      
      if (!foundAbsensi || !foundSiswa) {
        throw new Error('Data absensi tidak ditemukan');
      }
      
      setAbsensi(foundAbsensi);
      setSiswa(foundSiswa);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat detail absensi.';
      setError(errorMessage);
      console.error('Error fetching absensi detail:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Handle photo viewing
  const openPhotoModal = (photoUrl: string, type: 'checkin' | 'checkout', studentName: string) => {
    let fullUrl = photoUrl;
    if (!photoUrl.startsWith('http')) {
      // If it's a relative path starting with /API/, add the base URL
      if (photoUrl.startsWith('/API/')) {
        fullUrl = `http://localhost:3000${photoUrl}`;
      } else if (!photoUrl.includes('/')) {
        // If it's just a filename, add the uploads path
        fullUrl = `http://localhost:3000/uploads/${photoUrl}`;
      } else {
        fullUrl = `http://localhost:3000${photoUrl}`;
      }
    }
    
    setSelectedPhoto({
      url: fullUrl,
      type: type,
      name: studentName
    });
    setShowPhotoModal(true);
  };

  // Render photo with proper error handling
  const renderPhoto = (photoUrl: string | undefined, type: 'checkin' | 'checkout', studentName: string) => {
    
    if (!photoUrl || photoUrl === '' || photoUrl === 'null' || photoUrl === 'undefined') {
      return (
        <div className="text-center py-4">
          <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Image className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 text-xs">Foto {type === 'checkin' ? 'check-in' : 'check-out'} tidak tersedia</p>
          <p className="text-gray-500 text-xs mt-1">Data: {photoUrl || 'null'}</p>
        </div>
      );
    }

    // Handle different URL formats
    let fullUrl = photoUrl;
    if (!photoUrl.startsWith('http')) {
      // If it's a relative path starting with /API/, add the base URL
      if (photoUrl.startsWith('/API/')) {
        fullUrl = `http://localhost:3000${photoUrl}`;
      } else if (!photoUrl.includes('/')) {
        // If it's just a filename, add the uploads path
        fullUrl = `http://localhost:3000/uploads/${photoUrl}`;
      } else {
        fullUrl = `http://localhost:3000${photoUrl}`;
      }
    }
    

    return (
      <div className="relative">
        <img
          src={fullUrl}
          alt={`Foto ${type === 'checkin' ? 'check-in' : 'check-out'} ${studentName}`}
          className="w-32 h-32 object-cover rounded-full cursor-pointer hover:opacity-80 transition-opacity mx-auto"
          onClick={() => openPhotoModal(photoUrl, type, studentName)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-center py-4';
            errorDiv.innerHTML = `
              <div class="w-6 h-6 text-gray-500 mx-auto mb-2">📷</div>
              <p class="text-gray-400 text-xs">Foto ${type === 'checkin' ? 'check-in' : 'check-out'} tidak dapat dimuat</p>
              <p class="text-gray-500 text-xs mt-1">URL: ${fullUrl}</p>
            `;
            target.parentNode?.appendChild(errorDiv);
          }}
          onLoad={() => {
          }}
          title={`Klik untuk melihat foto ${type === 'checkin' ? 'check-in' : 'check-out'} ${studentName}`}
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
          {type === 'checkin' ? 'In' : 'Out'}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat detail absensi...</p>
          </div>
        </div>
      
    );
  }

  if (error) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={() => navigate('/guru/absensi')} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Absensi
              </button>
            </div>
          </div>
        </div>
      
    );
  }

  if (!absensi || !siswa) {
    return (
      
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-yellow-500 mx-auto mb-4">⚠️</div>
              <p className="text-yellow-400 mb-4">Data absensi tidak ditemukan</p>
              <button 
                onClick={() => navigate('/guru/absensi')} 
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Kembali ke Absensi
              </button>
            </div>
          </div>
        </div>
      
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3 mb-4">
          <button
            onClick={() => navigate('/guru/absensi')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Detail Absensi
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Informasi lengkap absensi siswa.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Detail Absensi {siswa.siswa_nama}</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(absensi.telat)}`}>
              {getStatusText(absensi.telat)}
            </span>
          </div>

          <div className="space-y-6">
            {/* General Information */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-blue-400">Informasi Umum</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Nama Siswa:</span>
                  <p className="text-white mt-1">{siswa.siswa_nama}</p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(absensi.telat)}`}>
                    {getStatusText(absensi.telat)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Jadwal Masuk:</span>
                  <p className="text-white mt-1">{absensi.jadwal_masuk}</p>
                </div>
                <div>
                  <span className="text-gray-400">Jadwal Keluar:</span>
                  <p className="text-white mt-1">{absensi.jadwal_keluar}</p>
                </div>
              </div>
            </div>

            {/* Time & Location */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-green-400">Waktu & Lokasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400">Waktu Check-in:</span>
                  <p className="text-white mt-1">{formatDate(absensi.waktu_checkin)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Waktu Check-out:</span>
                  <p className="text-white mt-1">{formatDate(absensi.waktu_checkout)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Lokasi Check-in:</span>
                  <p className="text-white mt-1">{absensi.checkin_location}</p>
                </div>
                <div>
                  <span className="text-gray-400">Lokasi Check-out:</span>
                  <p className="text-white mt-1">{absensi.checkout_location}</p>
                </div>
              </div>
            </div>

            {/* Photo Evidence */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Bukti Foto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-gray-400 block mb-2">Foto Check-in:</span>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    {renderPhoto(absensi.checkin_face_url, 'checkin', siswa.siswa_nama)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block mb-2">Foto Check-out:</span>
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                    {renderPhoto(absensi.checkout_face_url, 'checkout', siswa.siswa_nama)}
                  </div>
                </div>
              </div>
            </div>

            {/* Other Details */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-purple-400">Detail Lainnya</h3>
              <div>
                <span className="text-gray-400">Dibuat Pada:</span>
                <p className="text-white mt-1">{formatDate(absensi.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPhotoModal(false);
            setSelectedPhoto(null);
          }}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => {
                setShowPhotoModal(false);
                setSelectedPhoto(null);
              }}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors z-10"
            >
              ✕
            </button>
            <img
              src={selectedPhoto?.url || ''}
              alt={`Foto ${selectedPhoto?.type === 'checkin' ? 'check-in' : 'check-out'} ${selectedPhoto?.name || ''}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-white text-center text-lg p-8';
                errorDiv.textContent = 'Gagal memuat foto. URL tidak valid atau foto tidak tersedia.';
                target.parentNode?.appendChild(errorDiv);
              }}
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              {selectedPhoto?.type === 'checkin' ? 'Check In' : 'Check Out'} - {selectedPhoto?.name || ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
