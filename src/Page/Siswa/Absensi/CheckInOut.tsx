import React, { useState, useEffect } from 'react';
import { Clock, Calendar, UserCheck, Camera, AlertCircle, CheckCircle, LogIn, LogOut } from 'lucide-react';

interface CheckInOutData {
  checkin_time?: string;
  status?: string;
  face_image?: string;
}

const CheckInOut: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkInOutData, setCheckInOutData] = useState<CheckInOutData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get current day and time info
  const getCurrentDayInfo = () => {
    const day = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[day];

    return {
      day,
      dayName: currentDayName,
      hour,
      minute,
      isWeekend: day === 0 || day === 6, // Sunday or Saturday
      isFriday: day === 5,
      timeString: currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      dateString: currentTime.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  // Determine current action based on time and day
  const getCurrentAction = () => {
    const { day, hour, minute, isWeekend, isFriday } = getCurrentDayInfo();

    if (isWeekend) {
      return { action: 'weekend', message: 'Hari libur - tidak ada absensi' };
    }

    // Check if it's check-in time (6:00-12:00)
    if (hour >= 6 && hour < 14) {
      return { action: 'checkin', message: 'Check In' };
    }

    // Check if it's check-out time (15:00-20:00)
    if (hour >= 15 && hour < 24) {
      return { action: 'checkout', message: 'Check Out' };
    }

    // Outside working hours
    return { action: 'closed', message: 'Jam kerja telah selesai' };
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle check-in/check-out
  const handleCheckInOut = async (type: 'checkin' | 'checkout') => {
    if (!selectedFile) {
      setError('Silakan pilih foto wajah terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setActionType(type);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const formData = new FormData();
      formData.append('face_image', selectedFile);

      const response = await fetch('http://localhost:3000/api/checkin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
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

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setCheckInOutData(result.data);
        setSelectedFile(null);
        setPreviewUrl(null);
        setActionType(null);

        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error(result.message || 'Gagal melakukan absensi');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal melakukan absensi.';
      setError(errorMessage);
      console.error('Error during check-in/out:', err);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const { dayName, timeString, dateString } = getCurrentDayInfo();
  const { action, message } = getCurrentAction();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Absensi
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Lakukan check-in dan check-out harian Anda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Waktu Sekarang</h3>
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">{timeString}</div>
            <div className="text-gray-300">{dateString}</div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Status Absensi</h3>
            <Calendar className="w-6 h-6 text-green-400" />
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${action === 'checkin' ? 'text-green-400' :
                action === 'checkout' ? 'text-blue-400' :
                  action === 'weekend' ? 'text-yellow-400' : 'text-gray-400'
              }`}>
              {message}
            </div>
            <div className="text-gray-300">{dayName}</div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      )}

      {/* Check In/Out Buttons */}
      {action !== 'weekend' && action !== 'closed' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Pilih Aksi Absensi</h3>
            <div className="p-2 rounded-full bg-blue-600">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {/* Check In Button */}
            {action === 'checkin' && (
              <button
                onClick={() => handleCheckInOut('checkin')}
                disabled={isLoading || !selectedFile}
                className={`p-6 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${isLoading || !selectedFile
                    ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'border-green-500 bg-green-600 hover:bg-green-700 text-white shadow-lg'
                  }`}
              >
                <LogIn className={`w-8 h-8 ${action === 'checkin' ? 'text-white' : 'text-gray-500'
                  }`} />
                <div className="text-center">
                  <div className="font-semibold text-lg">Check In</div>
                </div>
              </button>
            )}

            {/* Check Out Button */}
            <button
              onClick={() => handleCheckInOut('checkout')}
              disabled={isLoading || !selectedFile}
              className={`p-6 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${isLoading || !selectedFile
                  ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed'
                  : action === 'checkout'
                    ? 'border-blue-500 bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
            >
              <LogOut className={`w-8 h-8 ${action === 'checkout' ? 'text-white' : 'text-gray-500'
                }`} />
              <div className="text-center">
                <div className="font-semibold text-lg">Check Out</div>
              </div>
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Foto Wajah</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="face-image"
                disabled={isLoading}
              />
              <label htmlFor="face-image" className="cursor-pointer">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-2">
                  {selectedFile ? selectedFile.name : 'Klik untuk memilih foto wajah'}
                </p>
                <p className="text-gray-500 text-sm">
                  Format: JPG, PNG, GIF (Max: 5MB)
                </p>
              </label>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Preview Foto</label>
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Status Message */}
          {action === 'closed' && (
            <div className="bg-yellow-600 text-white px-4 py-3 rounded-lg text-center">
              <p className="font-semibold">Tidak dalam jam kerja</p>
              <p className="text-sm opacity-90">Check In: 06:00-24:00 | Check Out: 15:00-24:00</p>
            </div>
          )}
        </div>
      )}

      {/* Weekend/Closed Message */}
      {(action === 'weekend' || action === 'closed') && (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${action === 'weekend' ? 'bg-yellow-600' : 'bg-gray-600'
            }`}>
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
          <p className="text-gray-400">
            {action === 'weekend'
              ? 'Silakan lakukan absensi pada hari kerja (Senin-Jumat)'
              : 'Jam kerja telah selesai. Silakan lakukan absensi besok.'
            }
          </p>
        </div>
      )}

      {/* Last Check In/Out Data */}
      {checkInOutData && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Data Absensi Terakhir</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-sm">Waktu</label>
              <p className="text-white font-medium">
                {checkInOutData.checkin_time
                  ? new Date(checkInOutData.checkin_time).toLocaleString('id-ID')
                  : '-'
                }
              </p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Status</label>
              <p className="text-white font-medium">{checkInOutData.status || '-'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Foto</label>
              <p className="text-white font-medium">{checkInOutData.face_image || '-'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOut; 