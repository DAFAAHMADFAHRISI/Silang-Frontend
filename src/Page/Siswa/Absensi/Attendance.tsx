import React, { useEffect, useState, useRef, useCallback } from 'react';
import { UserCheck, Clock, Calendar, TrendingUp, AlertCircle, CheckCircle, Award, Users, Mail, Camera, LogIn, LogOut } from 'lucide-react';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';

const Divider = () => <div className="border-t border-gray-700/50 my-6 sm:my-8 w-full" />;

interface AttendanceRow {
  id: number;
  nama_siswa: string;
  tanggal_absen: string;
  waktu_checkin: string;
  waktu_checkout: string;
  checkin_face: string;
  checkout_face: string;
  checkin_location: string;
  checkout_location: string;
  status_kehadiran: string;
  checkin_face_url?: string;
  checkout_face_url?: string;
}

interface CheckInOutData {
  checkin_time?: string;
  status?: string;
  face_image?: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const Attendance: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkInOutData, setCheckInOutData] = useState<CheckInOutData | null>(null);
  const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  // Photo modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, type: string, name: string} | null>(null);

  // Get current GPS location with improved accuracy
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser ini.'));
        return;
      }

      // Improved GPS options for better accuracy
      const options = {
        enableHighAccuracy: true, // Use GPS instead of network-based location
        timeout: 30000, // 30 seconds - longer timeout for better accuracy
        maximumAge: 0 // Always get fresh location, don't use cached
      };

      // First attempt with high accuracy
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Validate coordinates
          if (isNaN(locationData.latitude) || isNaN(locationData.longitude)) {
            reject(new Error('Koordinat GPS tidak valid. Silakan coba lagi.'));
            return;
          }
          
          // Check if accuracy is reasonable (less than 50 meters)
          if (locationData.accuracy && locationData.accuracy > 50) {
            console.warn('GPS accuracy is low:', locationData.accuracy, 'meters');
            // Still resolve but warn user about low accuracy
          }
          
          console.log('GPS Location captured with accuracy:', locationData.accuracy, 'meters');
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Gagal mendapatkan lokasi.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Izin lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif dan tidak ada gangguan.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Waktu habis untuk mendapatkan lokasi. Pastikan GPS aktif dan tidak ada gangguan.';
              break;
            default:
              errorMessage = 'Terjadi kesalahan saat mendapatkan lokasi.';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Alternative method using watchPosition for continuous monitoring
  const getAccurateLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser ini.'));
        return;
      }

      let watchId: number;
      let attempts = 0;
      const maxAttempts = 5;
      let bestAccuracy = Infinity;
      let bestLocation: LocationData | null = null;

      const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      };

      const onSuccess = (position: GeolocationPosition) => {
        const accuracy = position.coords.accuracy;
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy
        };

        attempts++;
        console.log(`GPS attempt ${attempts}: accuracy ${accuracy}m`);

        // Update best location if accuracy improved
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          bestLocation = locationData;
        }

        // Resolve if we have good accuracy or max attempts reached
        if (accuracy <= 10 || attempts >= maxAttempts) {
          navigator.geolocation.clearWatch(watchId);
          if (bestLocation) {
            console.log('Final GPS location with accuracy:', bestLocation.accuracy, 'meters');
            resolve(bestLocation);
          } else {
            reject(new Error('Tidak dapat mendapatkan lokasi yang akurat.'));
          }
        }
      };

      const onError = (error: GeolocationPositionError) => {
        navigator.geolocation.clearWatch(watchId);
        let errorMessage = 'Gagal mendapatkan lokasi yang akurat.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin lokasi ditolak. Silakan izinkan akses lokasi di browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia. Pastikan GPS aktif dan tidak ada gangguan.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Waktu habis untuk mendapatkan lokasi. Pastikan GPS aktif dan tidak ada gangguan.';
            break;
        }
        reject(new Error(errorMessage));
      };

      // Start watching for position updates
      watchId = navigator.geolocation.watchPosition(onSuccess, onError, options);

      // Fallback timeout
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        if (bestLocation) {
          console.log('GPS timeout - using best available location with accuracy:', bestLocation.accuracy, 'meters');
          resolve(bestLocation);
        } else {
          reject(new Error('Waktu habis untuk mendapatkan lokasi yang akurat.'));
        }
      }, 45000); // 45 seconds total timeout
    });
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/absensi-siswa', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
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

      const result = await response.json();
      
      if (result.success && result.data) {
        setAttendanceData(result.data);
      } else {
        throw new Error('Format response tidak valid');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data absensi.';
      setError(errorMessage);
      console.error('Error fetching attendance:', err);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Get current time and day info
  const getCurrentTimeInfo = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDayName = dayNames[day];
    
    return {
      day,
      dayName: currentDayName,
      hour,
      minute,
      isWeekend: day === 0 || day === 6,
      timeString: now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }),
      dateString: now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  // Determine current action based on time and day
  const getCurrentAction = () => {
    const { day, hour, minute, isWeekend } = getCurrentTimeInfo();
    
    if (isWeekend) {
      return { action: 'weekend', message: 'Hari libur - tidak ada absensi' };
    }

    // Check if it's check-in time (6:00-14:00)
    if (hour >= 6 && hour < 16) {
      return { action: 'checkin', message: 'Check In' };
    }
    
    // Check if it's check-out time (15:00-20:00)
    if (hour >= 15 && hour < 20) {
      return { action: 'checkout', message: 'Check Out' };
    }
    
    // Outside working hours
    return { action: 'closed', message: 'Jam kerja telah selesai' };
  };

  // Capture photo using react-webcam
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Basic validation - check if image is not empty
        if (imageSrc === 'data:image/jpeg;base64,') {
          Swal.fire({
            icon: 'error',
            title: 'Foto tidak valid!',
            text: 'Tidak dapat mengambil foto. Pastikan kamera berfungsi dengan baik.',
          });
          return;
        }

        // Simple face detection validation
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            const data = imageData.data;
            let skinPixels = 0;
            let totalPixels = 0;
            
            // Calculate skin tone pixels (simple face detection)
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // Simple skin tone detection
              const isSkinTone = 
                r > 95 && g > 40 && b > 20 &&
                Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
                Math.abs(r - g) > 15 && r > g && r > b;
              
              if (isSkinTone) {
                skinPixels++;
              }
              totalPixels++;
            }
            
            const skinRatio = skinPixels / totalPixels;
            
            // Check if there's enough skin tone (indicating a face)
            if (skinRatio < 0.05) { // Less than 5% skin tone
              Swal.fire({
                icon: 'error',
                title: 'Wajah tidak terdeteksi!',
                text: 'Tidak dapat mendeteksi wajah dalam foto. Pastikan wajah Anda terlihat jelas.',
              });
              return;
            }
            
            // If validation passes, proceed with upload
            fetch(imageSrc)
              .then(res => res.blob())
              .then(blob => {
                handleCheckInOutWithPhoto(blob);
              })
              .catch(error => {
                console.error('Error processing photo:', error);
                Swal.fire({
                  icon: 'error',
                  title: 'Gagal memproses foto!',
                  text: 'Terjadi kesalahan saat memproses foto. Silakan coba lagi.',
                });
              });
          }
        };
        
        img.onerror = () => {
          Swal.fire({
            icon: 'error',
            title: 'Gagal memproses foto!',
            text: 'Tidak dapat memproses gambar. Silakan coba lagi.',
          });
        };
        
        img.src = imageSrc;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Tidak dapat mengambil foto!',
          text: 'Pastikan kamera berfungsi dengan baik.',
        });
      }
    }
  }, []);

  // Handle check-in/check-out with photo
  const handleCheckInOutWithPhoto = async (photoBlob: Blob) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setLocationError(null);

    try {
      // Get current GPS location first
      let currentLocation: LocationData | null = null;
      try {
        currentLocation = await getCurrentLocation();
        setLocationData(currentLocation);
        console.log('GPS Location captured:', currentLocation);
      } catch (locationErr) {
        const locationErrorMessage = locationErr instanceof Error ? locationErr.message : 'Gagal mendapatkan lokasi.';
        setLocationError(locationErrorMessage);
        console.warn('Location error:', locationErr);

        // Show error and STOP attendance process
        await Swal.fire({
          icon: 'error',
          title: 'Lokasi tidak tersedia',
          text: 'Gagal mendapatkan lokasi. Proses absensi dibatalkan.',
          showConfirmButton: true,
        });
        setIsLoading(false);
        setActionType(null);
        setShowCamera(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const formData = new FormData();
      formData.append('face_image', photoBlob, 'face_image.jpg');
      
      // Add location data if available
      if (currentLocation) {
        formData.append('latitude', currentLocation.latitude.toString());
        formData.append('longitude', currentLocation.longitude.toString());
        if (currentLocation.accuracy) {
          formData.append('accuracy', currentLocation.accuracy.toString());
        }
      }

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
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Gagal melakukan absensi.';
        
        // Handle specific error cases
        if (errorData.message && errorData.message.includes('face')) {
          errorMessage = 'Wajah tidak terdeteksi dalam foto. Pastikan wajah Anda terlihat jelas dan tidak terhalang.';
        } else if (errorData.message && errorData.message.includes('size')) {
          errorMessage = 'Ukuran foto terlalu besar. Silakan pilih foto dengan ukuran yang lebih kecil.';
        } else if (errorData.message && errorData.message.includes('format')) {
          errorMessage = 'Format foto tidak didukung. Gunakan format JPG atau PNG.';
        } else if (errorData.message && errorData.message.includes('time')) {
          errorMessage = 'Tidak dalam jam absensi. Silakan cek jadwal absensi.';
        }
        
        // Redirect to main page if face verification fails
        if (errorData.message && (errorData.message.includes('Face verification failed') || errorData.message.includes('Wajah tidak sesuai'))) {
          Swal.fire({
            icon: 'error',
            title: 'Verifikasi Wajah Gagal!',
            text: 'Wajah tidak sesuai dengan foto profil. Silakan coba lagi.',
            showConfirmButton: false,
            timer: 3000,
          });
          
          setTimeout(() => {
            window.location.href = '/AttendanceSiswa';
          }, 3000);
          return;
        }
        
        // Redirect to main page if distance error occurs
        if (errorData.message && (errorData.message.includes('luar area absensi') || errorData.message.includes('jarak maksimal'))) {
          Swal.fire({
            icon: 'error',
            title: 'Jarak Terlalu Jauh!',
            text: 'Anda berada di luar area absensi. Silakan datang ke lokasi sekolah.',
            showConfirmButton: false,
            timer: 3000,
          });
          
          setTimeout(() => {
            window.location.href = '/AttendanceSiswa';
          }, 3000);
          return;
        }
        
        // Redirect to main page if already checked in today
        if (errorData.message && errorData.message.includes('sudah melakukan check-in hari ini')) {
          Swal.fire({
            icon: 'warning',
            title: 'Sudah Check In!',
            text: 'Anda sudah melakukan check-in hari ini.',
            showConfirmButton: false,
            timer: 3000,
          });
          
          setTimeout(() => {
            window.location.href = '/AttendanceSiswa';
          }, 3000);
          return;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success) {
        // Show success message
        Swal.fire({
          icon: 'success',
          title: 'Absensi berhasil!',
          text: result.message,
          showConfirmButton: false,
          timer: 3000,
        });
        
        setSuccess(result.message);
        setCheckInOutData(result.data);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
        
        // Redirect to AttendanceSiswa page after successful attendance
        setTimeout(() => {
          window.location.href = '/AttendanceSiswa';
        }, 3000);
        
        // Refresh attendance data
        await fetchAttendance();
      } else {
        throw new Error(result.message || 'Gagal melakukan absensi');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal melakukan absensi.';
      setError(errorMessage);
      console.error('Error during check-in/out:', err);
      
      // Redirect to main page if face verification fails
      if (errorMessage.includes('Face verification failed') || errorMessage.includes('Wajah tidak sesuai')) {
        Swal.fire({
          icon: 'error',
          title: 'Verifikasi Wajah Gagal!',
          text: 'Wajah tidak sesuai dengan foto profil. Silakan coba lagi.',
          showConfirmButton: false,
          timer: 3000,
        });
        
        setTimeout(() => {
          window.location.href = '/AttendanceSiswa';
        }, 3000);
        return;
      }
      
      // Redirect to main page if distance error occurs
      if (errorMessage.includes('luar area absensi') || errorMessage.includes('jarak maksimal')) {
        Swal.fire({
          icon: 'error',
          title: 'Jarak Terlalu Jauh!',
          text: 'Anda berada di luar area absensi. Silakan datang ke lokasi sekolah.',
          showConfirmButton: false,
          timer: 3000,
        });
        
        setTimeout(() => {
          window.location.href = '/AttendanceSiswa';
        }, 3000);
        return;
      }
      
      // Redirect to main page if already checked in today
      if (errorMessage.includes('sudah melakukan check-in hari ini')) {
        Swal.fire({
          icon: 'warning',
          title: 'Sudah Check In!',
          text: 'Anda sudah melakukan check-in hari ini.',
          showConfirmButton: false,
          timer: 3000,
        });
        
        setTimeout(() => {
          window.location.href = '/AttendanceSiswa';
        }, 3000);
        return;
      }
      
      // Show error notification
      Swal.fire({
        icon: 'error',
        title: 'Gagal melakukan absensi!',
        text: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setActionType(null);
      setShowCamera(false);
    }
  };

  // Handle check-in/check-out button click
  const handleCheckInOut = async (type: 'checkin' | 'checkout') => {
    setActionType(type);
    setCameraError(null);
    setLocationError(null);
    setLocationData(null);
    setShowCamera(true);
    
    // Request location permission when camera opens
    try {
      const location = await getCurrentLocation();
      setLocationData(location);
      console.log('Location captured on modal open:', location);
    } catch (locationErr) {
      console.warn('Location not available on modal open:', locationErr);
      // Don't show error here, will be handled during attendance
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendance();
    setRefreshing(false);
  };

  const filteredAttendance = attendanceData.filter(item => {
    const matchesSearch = item.nama_siswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tanggal_absen.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'late' && item.status_kehadiran.toLowerCase().includes('terlambat')) ||
                         (statusFilter === 'ontime' && !item.status_kehadiran.toLowerCase().includes('terlambat'));
    
    return matchesSearch && matchesStatus;
  });

  const getRowNumber = (index: number) => {
    return index + 1;
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      // No explicit cleanup needed here as react-webcam handles its own cleanup
    };
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return as-is if can't parse
      }
      return date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateString; // Return as-is if error
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    
    // Jika format sudah HH:MM:SS, langsung return
    if (timeString.includes(':')) {
      return timeString;
    }
    
    // Jika format adalah timestamp, convert ke HH:MM:SS
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString; // Return as-is if can't parse
      }
      return date.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
      });
    } catch {
      return timeString; // Return as-is if error
    }
  };

  const getLateStatus = (statusKehadiran: string) => {
    if (!statusKehadiran) {
      return { text: 'Tidak ada status', class: 'text-gray-400' };
    }
    
    const status = statusKehadiran.toLowerCase();
    
    if (status.includes('terlambat')) {
      // Extract minutes from status like "Terlambat 388 menit"
      const minutesMatch = status.match(/(\d+)\s*menit/);
      if (minutesMatch) {
        const totalMinutes = parseInt(minutesMatch[1]);
        if (totalMinutes >= 60) {
          const hours = Math.floor(totalMinutes / 60);
          const remainingMinutes = totalMinutes % 60;
          let formattedStatus = `Telat ${hours} jam`;
          if (remainingMinutes > 0) {
            formattedStatus += ` ${remainingMinutes} menit`;
          }
          return { text: formattedStatus, class: 'text-red-400' };
        } else {
          return { text: `Telat ${totalMinutes} menit`, class: 'text-red-400' };
        }
      }
      return { text: statusKehadiran, class: 'text-red-400' };
    } else if (status.includes('on time') || status.includes('tepat waktu') || status.includes('hadir')) {
      return { text: 'Tepat Waktu', class: 'text-green-400' };
    } else if (status.includes('izin') || status.includes('sakit')) {
      return { text: statusKehadiran, class: 'text-yellow-400' };
    } else if (status.includes('alpha') || status.includes('tidak hadir')) {
      return { text: statusKehadiran, class: 'text-red-500' };
    } else {
      return { text: statusKehadiran, class: 'text-blue-400' };
    }
  };

  const openLocationMap = (location: string, type: 'checkin' | 'checkout') => {
    if (!location) return;
    
    try {
      const [lat, lng] = location.split(',').map(coord => coord.trim());
      
      // Validasi koordinat
      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        alert('Koordinat tidak valid');
        return;
      }
      
      const url = `https://www.google.com/maps?q=${lat},${lng}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening map:', error);
      alert('Tidak dapat membuka lokasi');
    }
  };

  const renderLocationCell = (location: string, type: 'checkin' | 'checkout') => {
    if (!location) {
      return <span className="text-gray-500">-</span>;
    }

    try {
      const [lat, lng] = location.split(',').map(coord => coord.trim());
      
      // Validasi koordinat
      if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
        return <span className="text-gray-500">Invalid</span>;
      }

      return (
        <button
          onClick={() => openLocationMap(location, type)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors whitespace-nowrap"
          title={`Buka lokasi ${type === 'checkin' ? 'check-in' : 'check-out'} di Google Maps`}
        >
          View Map
        </button>
      );
    } catch (error) {
      return <span className="text-gray-500">Error</span>;
    }
  };

  // Handle photo viewing
  const openPhotoModal = (photoUrl: string, type: 'checkin' | 'checkout', studentName: string) => {
    const fullUrl = photoUrl.startsWith('http') ? photoUrl : `http://localhost:3000${photoUrl}`;
    setSelectedPhoto({
      url: fullUrl,
      type: type,
      name: studentName
    });
    setShowPhotoModal(true);
  };

  // Render photo cell
  const renderPhotoCell = (photoUrl: string | undefined, type: 'checkin' | 'checkout', studentName: string) => {
    if (!photoUrl) {
      return <span className="text-gray-500">-</span>;
    }

    const fullUrl = photoUrl.startsWith('http') ? photoUrl : `http://localhost:3000${photoUrl}`;

    return (
      <div className="flex flex-col items-center">
        <img
          src={fullUrl}
          alt={`Foto ${type === 'checkin' ? 'check-in' : 'check-out'} ${studentName}`}
          className="w-12 h-12 object-cover rounded-lg border border-gray-600 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openPhotoModal(photoUrl, type, studentName)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-400 text-xs text-center';
            errorDiv.textContent = 'Foto tidak tersedia';
            target.parentNode?.appendChild(errorDiv);
          }}
          title={`Klik untuk melihat foto ${type === 'checkin' ? 'check-in' : 'check-out'} ${studentName}`}
        />
        <span className="text-xs text-gray-400 mt-1">
          {type === 'checkin' ? 'Check In' : 'Check Out'}
        </span>
      </div>
    );
  };

  const { dayName, timeString, dateString } = getCurrentTimeInfo();
  const { action, message } = getCurrentAction();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Redirect to main page if face verification fails
    if (error.includes('Face verification failed') || error.includes('Wajah tidak sesuai')) {
      window.location.href = '/AttendanceSiswa';
      return null;
    }
    
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
            <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
            <div className="space-y-2">
              <button 
                onClick={fetchAttendance} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Coba Lagi
              </button>
              <button 
                onClick={() => window.location.href = '/Login'} 
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 mt-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-1 sm:w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Attendance
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-3 sm:ml-5 text-sm sm:text-base">Riwayat kehadiran dan absensi siswa.</p>
      </div>
      
      <Divider />
      
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

      {cameraError && (
        <div className="mb-6 bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            <span>{cameraError}</span>
          </div>
          <button onClick={() => setCameraError(null)} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
      )}

      {/* Check In/Out Buttons */}
      {getCurrentAction().action !== 'weekend' && getCurrentAction().action !== 'closed' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Absensi dengan Kamera</h3>
            <div className="flex items-center space-x-3">
            </div>
          </div>



          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Check In Button */}
            <button
              onClick={() => handleCheckInOut('checkin')}
              disabled={isLoading || getCurrentAction().action !== 'checkin'}
              className={`p-6 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                isLoading || getCurrentAction().action !== 'checkin'
                  ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-green-500 bg-green-600 hover:bg-green-700 text-white shadow-lg'
              }`}
            >
              <LogIn className={`w-8 h-8 ${
                getCurrentAction().action === 'checkin' ? 'text-white' : 'text-gray-500'
              }`} />
              <div className="text-center">
                <div className="font-semibold text-lg">Check In</div>
                {/* <div className="text-sm opacity-75">06:00 - 12:00</div> */}
              </div>
            </button>

            {/* Check Out Button */}
            <button
              onClick={() => handleCheckInOut('checkout')}
              disabled={isLoading || getCurrentAction().action !== 'checkout'}
              className={`p-6 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center space-y-3 ${
                isLoading || getCurrentAction().action !== 'checkout'
                  ? 'border-gray-600 bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-blue-500 bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
              }`}
            >
              <LogOut className={`w-8 h-8 ${
                getCurrentAction().action === 'checkout' ? 'text-white' : 'text-gray-500'
              }`} />
              <div className="text-center">
                <div className="font-semibold text-lg">Check Out</div>
                {/* <div className="text-sm opacity-75">15:00 - 20:00</div> */}
              </div>
            </button>
          </div>

          {/* Status Message */}
          {getCurrentAction().action === 'closed' && (
            <div className="bg-yellow-600 text-white px-4 py-3 rounded-lg text-center">
              <p className="font-semibold">Tidak dalam jam kerja</p>
              <p className="text-sm opacity-90">Check In: 06:00-12:00 | Check Out: 15:00-20:00</p>
            </div>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {actionType === 'checkin' ? 'Check In' : 'Check Out'} dengan Kamera
                </h3>
                {locationData && (
                  <div className="text-xs text-gray-300 mt-1">
                    📍 GPS: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                    {locationData.accuracy && (
                      <span className={`ml-2 ${
                        locationData.accuracy <= 10 ? 'text-green-400' : 
                        locationData.accuracy <= 25 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        (Akurasi: {locationData.accuracy.toFixed(1)}m)
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {locationData && (
                  <button
                    onClick={async () => {
                      try {
                        setLocationData(null);
                        const newLocation = await getAccurateLocation();
                        setLocationData(newLocation);
                      } catch (err) {
                        setLocationError('Gagal mendapatkan lokasi yang akurat. Silakan coba lagi.');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    title="Refresh GPS location untuk akurasi lebih baik"
                  >
                    🔄 GPS
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowCamera(false);
                    setActionType(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                width={640}
                height={480}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
                style={{ transform: 'scaleX(-1)' }}
                onUserMediaError={(error) => {
                  console.error('Webcam error:', error);
                  setCameraError('Tidak dapat mengakses kamera.');
                  Swal.fire({
                    icon: 'error',
                    title: 'Kamera tidak dapat diakses!',
                    text: 'Pastikan kamera aktif dan izin kamera telah diizinkan.',
                  });
                }}
                onUserMedia={() => {
                  console.log('Camera stream obtained successfully');
                }}
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-300 text-sm mb-4">
                Posisikan wajah Anda di dalam frame dan klik "Ambil Foto"
              </p>
              

              {isLoading && (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Memproses...</span>
                </div>
              )}
              {locationError && (
                <div className="bg-yellow-600 text-white px-3 py-2 rounded text-xs mb-2">
                  ⚠️ {locationError}
                  <button 
                    onClick={async () => {
                      try {
                        setLocationError(null);
                        const newLocation = await getAccurateLocation();
                        setLocationData(newLocation);
                      } catch (err) {
                        setLocationError('Gagal mendapatkan lokasi yang akurat. Silakan coba lagi.');
                      }
                    }}
                    className="ml-2 bg-yellow-700 hover:bg-yellow-800 px-2 py-1 rounded text-xs"
                  >
                    🔄 Coba Lagi
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-4">
              <button
                onClick={capturePhoto}
                disabled={isLoading}
                className={`px-4 py-2 rounded font-semibold ${
                  isLoading
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                📸 Ambil Foto
              </button>
              <button
                onClick={() => {
                  setShowCamera(false);
                  setActionType(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold"
              >
                ❌ Batal
              </button>
            </div>
            
          </div>
        </div>
      )}
      
      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Absensi</p>
              <p className="text-2xl font-bold text-white">{filteredAttendance.length}</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tepat Waktu</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredAttendance.filter(item => !item.status_kehadiran.toLowerCase().includes('terlambat')).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Terlambat</p>
              <p className="text-2xl font-bold text-red-400">
                {filteredAttendance.filter(item => item.status_kehadiran.toLowerCase().includes('terlambat')).length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Check Out</p>
              <p className="text-2xl font-bold text-blue-400">
                {filteredAttendance.filter(item => item.waktu_checkout).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-4">
        <input
          type="text"
          placeholder="Cari nama atau tanggal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded focus:outline-none border border-gray-700 w-full sm:w-64 text-sm sm:text-base"
        />
        <div className="flex gap-2 items-center">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-800 text-white px-2 py-2 rounded border border-gray-700 text-xs sm:text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="ontime">Tepat Waktu</option>
            <option value="late">Terlambat</option>
          </select>
          {/* Tombol Check In dihapus sesuai permintaan user */}
        </div>
      </div>
      
      <Divider />
      
      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm min-w-[1200px]">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">No.</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Nama Siswa</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Tanggal</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Check In</th>
              <th className="text-center py-2 px-2 sm:px-4 font-semibold text-gray-300">Foto Check In</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Lokasi In</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Status</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Check Out</th>
              <th className="text-center py-2 px-2 sm:px-4 font-semibold text-gray-300">Foto Check Out</th>
              <th className="text-left py-2 px-2 sm:px-4 font-semibold text-gray-300">Lokasi Out</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-12">
                  <div className="text-center">
                    <UserCheck className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    {attendanceData.length === 0 ? (
                      <>
                        <p className="text-gray-400 text-lg">Belum ada data absensi</p>
                        <p className="text-gray-500 text-sm">Data absensi akan muncul setelah Anda melakukan check-in</p>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-lg">Tidak ada data yang sesuai</p>
                        <p className="text-gray-500 text-sm">Coba ubah filter atau kata kunci pencarian</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAttendance.map((row, index) => {
                const lateStatus = getLateStatus(row.status_kehadiran);
                return (
                  <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-2 sm:px-4 text-gray-400 text-center font-medium">{getRowNumber(index)}</td>
                    <td className="py-3 px-2 sm:px-4 text-white font-medium">{row.nama_siswa}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-300">{formatDate(row.tanggal_absen)}</td>
                    <td className="py-3 px-2 sm:px-4 text-green-400 font-medium">{formatTime(row.waktu_checkin)}</td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      {renderPhotoCell(row.checkin_face_url, 'checkin', row.nama_siswa)}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-gray-400 text-xs">
                      {renderLocationCell(row.checkin_location, 'checkin')}
                    </td>
                    <td className={`py-3 px-2 sm:px-4 font-medium ${lateStatus.class}`}>
                      {lateStatus.text}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-blue-400 font-medium">{formatTime(row.waktu_checkout)}</td>
                    <td className="py-3 px-2 sm:px-4 text-center">
                      {renderPhotoCell(row.checkout_face_url, 'checkout', row.nama_siswa)}
                    </td>
                    <td className="py-3 px-2 sm:px-4 text-gray-400 text-xs">
                      {renderLocationCell(row.checkout_location, 'checkout')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      <Divider />
      
      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-white text-xs sm:text-sm">Rows:</span>
          <select className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 text-xs sm:text-sm">
            <option>{filteredAttendance.length}</option>
          </select>
          <span className="text-gray-400 text-xs sm:text-sm">
            ({attendanceData.length} total)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-800 text-gray-400 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm" disabled>{'<<'}</button>
          <span className="text-white text-xs sm:text-sm">Page 1 of 1</span>
          <button className="bg-gray-800 text-gray-400 px-2 py-1 sm:px-3 sm:py-2 rounded text-xs sm:text-sm" disabled>{'>>'}</button>
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
          <img
            src={selectedPhoto.url}
            alt={`Foto ${selectedPhoto.type === 'checkin' ? 'check-in' : 'check-out'} ${selectedPhoto.name}`}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'text-white text-center text-lg';
              errorDiv.textContent = 'Gagal memuat foto. URL tidak valid atau foto tidak tersedia.';
              target.parentNode?.appendChild(errorDiv);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Attendance;
