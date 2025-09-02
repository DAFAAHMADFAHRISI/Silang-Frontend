import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import { authAPI } from '../../services/api';

interface ProfileData {
  id: number;
  nama: string;
  email: string;
  no_hp: string;
  asal_institusi_id: number;
  created_at: string;
  updated_at: string;
  asal_institusi: string;
}

interface ProfilePictureData {
  foto_profile: string;
  foto_profile_url: string;
}

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profilePicture, setProfilePicture] = useState<ProfilePictureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pictureLoading, setPictureLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showCameraButton, setShowCameraButton] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });

  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'siswa') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchProfileData();
    fetchProfilePicture();
  }, []);

  // Debug useEffect for camera modal
  useEffect(() => {
    console.log('showCameraButton changed to:', showCameraButton);
    if (showCameraButton) {
      console.log('Modal should be visible now');
      // Force a re-render check
      setTimeout(() => {
        console.log('Modal visibility check - showCameraButton:', showCameraButton);
      }, 50);
    }
  }, [showCameraButton]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }

      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }

      const data: ProfileData = await response.json();
      console.log('Debug - Profile API Response:', data);
      
      setProfileData(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data profil.';
      setError(errorMessage);
      console.error('Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilePicture = async () => {
    try {
      setPictureLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch('http://localhost:3000/api/auth/profile/picture', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }

      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }

      const data: ProfilePictureData = await response.json();
      console.log('Debug - Profile Picture API Response:', data);
      
      setProfilePicture(data);
      
    } catch (err) {
      console.error('Error fetching profile picture:', err);
      // Don't set error state for picture loading, just log it
    } finally {
      setPictureLoading(false);
    }
  };

  const checkChromeCameraPermissions = () => {
    // Check if we're on Chrome
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    
    if (isChrome) {
      console.log('Chrome detected. Checking camera permissions...');
      
      // Try to get camera stream to check permissions
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          console.log('Camera access granted!');
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(error => {
          console.log('Camera access denied:', error);
          setCameraError(`Chrome camera access denied: ${error.message}. Silakan buka chrome://settings/content/camera dan izinkan akses kamera.`);
        });
    }
  };

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
                const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
                uploadPhoto(file);
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
        
        // Close modal
        setShowCameraButton(false);
        setCameraLoading(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Tidak dapat mengambil foto!',
          text: 'Pastikan kamera berfungsi dengan baik.',
        });
      }
    }
  }, []);

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true);
      setCameraError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const formData = new FormData();
      formData.append('foto_profile', file);

      const response = await fetch('http://localhost:3000/api/auth/profile/picture/update', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Gagal mengupdate foto profil.';
        
        // Handle specific error cases
        if (errorData.message && errorData.message.includes('face')) {
          errorMessage = 'Wajah tidak terdeteksi dalam foto. Pastikan wajah Anda terlihat jelas dan tidak terhalang.';
        } else if (errorData.message && errorData.message.includes('size')) {
          errorMessage = 'Ukuran foto terlalu besar. Silakan pilih foto dengan ukuran yang lebih kecil.';
        } else if (errorData.message && errorData.message.includes('format')) {
          errorMessage = 'Format foto tidak didukung. Gunakan format JPG atau PNG.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Debug - Profile Picture Update Response:', data);
      
      // Update the profile picture data with the new response
      setProfilePicture({
        foto_profile: data.foto_profile,
        foto_profile_url: data.foto_profile_url
      });
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Foto profil berhasil diperbarui!',
        showConfirmButton: false,
        timer: 2000,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memperbarui foto profil.';
      setCameraError(errorMessage);
      console.error('Error updating profile picture:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui foto profil!',
        text: errorMessage,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePictureClick = async () => {
    // Clear any previous camera errors
    setCameraError(null);
    console.log('Profile picture clicked - starting camera process...');
    // HAPUS pengecekan isMobile
    // HAPUS pesan error 'Kamera hanya tersedia di perangkat mobile...'
    // Tetap lakukan pengecekan HTTPS jika diperlukan
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setCameraError('Akses kamera memerlukan HTTPS. Silakan gunakan galeri untuk memilih foto.');
      return;
    }
    console.log('Device and HTTPS checks passed, showing modal...');
    // Show modal immediately
    setShowCameraButton(true);
    setCameraLoading(true);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCameraError('Tidak ada file yang dipilih.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setCameraError('File harus berupa gambar.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCameraError('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    // Create image element to validate content
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
        let totalBrightness = 0;
        let totalPixels = 0;
        
        // Calculate average brightness
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
          totalPixels++;
        }
        
        const avgBrightness = totalBrightness / totalPixels;
        
        // Calculate contrast
        let contrast = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;
          contrast += Math.abs(brightness - avgBrightness);
        }
        const avgContrast = contrast / totalPixels;
        
        // Face detection using skin tone
        let skinPixels = 0;
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
        }
        
        const skinRatio = skinPixels / totalPixels;
        
        // Validation checks
        if (avgBrightness < 50) {
          Swal.fire({
            icon: 'error',
            title: 'Foto terlalu gelap!',
            text: 'Tidak dapat mendeteksi wajah. Pastikan pencahayaan cukup.',
          });
          return;
        }
        
        if (avgBrightness > 200) {
          Swal.fire({
            icon: 'error',
            title: 'Foto terlalu terang!',
            text: 'Foto terlalu terang. Pilih foto dengan pencahayaan yang tepat.',
          });
          return;
        }
        
        if (avgContrast < 20) {
          Swal.fire({
            icon: 'error',
            title: 'Tidak dapat mendeteksi wajah!',
            text: 'Foto terlalu blur atau tidak ada wajah yang terlihat.',
          });
          return;
        }
        
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
        uploadPhoto(file);
      }
    };
    
    img.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: 'File tidak valid!',
        text: 'Tidak dapat memproses gambar. Pilih file gambar yang valid.',
      });
    };
    
    img.src = URL.createObjectURL(file);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password tidak cocok!',
        text: 'Password baru dan konfirmasi password harus sama.',
      });
      return;
    }

    try {
      setPasswordLoading(true);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const formData = new URLSearchParams();
      formData.append('currentPassword', passwordData.currentPassword);
      formData.append('newPassword', passwordData.newPassword);
      formData.append('confirmNewPassword', passwordData.confirmNewPassword);

      const response = await fetch('http://localhost:3000/api/auth/profile/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body: formData.toString(),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        localStorage.removeItem('user_id');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengupdate password.');
      }

      const data = await response.json();
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Password berhasil diupdate!',
        showConfirmButton: false,
        timer: 2000,
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate password.';
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengupdate password!',
        text: errorMessage,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const goToResetPassword = () => {
    navigate('/ResetPassword');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/Login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  // Get the profile picture URL
  const getProfilePictureUrl = () => {
    if (profilePicture?.foto_profile_url) {
      // If we have a relative URL from the API, construct the full URL
      return `http://localhost:3000${profilePicture.foto_profile_url}`;
    }
    // Fallback to default image
    return "https://randomuser.me/api/portraits/men/1.jpg";
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="mb-6 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Profile
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Kelola data dan keamanan akun Anda.</p>
      </div>
      <hr className="border-gray-700 mb-8" />
      <div className="flex flex-col items-center mb-8">
        {/* Camera UI */}
        {showCameraButton && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full mx-4">
              <div className="text-center mb-4">
                <h3 className="text-white text-lg font-semibold">Ambil Foto Profil</h3>
                <p className="text-gray-400 text-sm">
                  {cameraLoading ? 'Memulai kamera...' : 'Posisikan wajah Anda di dalam kotak'}
                </p>
              </div>
              
              <div className="relative">
                {cameraLoading ? (
                  <div className="w-full h-64 bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-400">Memulai kamera...</p>
                    </div>
                  </div>
                ) : (
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
                      setCameraError('Tidak dapat mengakses kamera. Silakan coba lagi.');
                      setShowCameraButton(false);
                      setCameraLoading(false);
                    }}
                    onUserMedia={() => {
                      console.log('Camera stream obtained successfully');
                      setCameraLoading(false);
                    }}
                  />
                )}
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={capturePhoto}
                  disabled={cameraLoading}
                  className={`flex-1 px-4 py-2 rounded font-semibold ${
                    cameraLoading
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  📸 Ambil Foto
                </button>
                <button
                  onClick={() => {
                    setShowCameraButton(false);
                    setCameraLoading(false);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold"
                >
                  ❌ Batal
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="relative group">
          <img
            src={getProfilePictureUrl()}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg mb-4 transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-xl"
          />
          {(pictureLoading || uploading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 flex items-center justify-center">
            {/* Hapus teks 'Klik untuk update foto' */}
            {uploading && (
              <div className="text-white text-sm font-semibold">
                Mengupload...
              </div>
            )}
          </div>
        </div>
        
        {/* Manual camera button below profile picture */}
        {!showCameraButton && (
          <button
            onClick={() => {
              console.log('Manual camera button clicked');
              setShowCameraButton(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold mb-4"
          >
            📷 Update Foto Profil
          </button>
        )}
        
        {/* Camera error display */}
        {cameraError && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4 max-w-md">
            <div className="flex items-center space-x-2">
              <div className="text-red-400">⚠️</div>
              <div className="text-red-200 text-sm">{cameraError}</div>
            </div>
            {/* HAPUS tips Chrome Mobile */}
          </div>
        )}
        
        {/* Hidden file input for camera/photo selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      <form className="space-y-6">
        <div>
          <label className="block text-white mb-1 font-semibold">Name</label>
          <input
            type="text"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
            value={profileData?.nama || ''}
            readOnly
          />
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">Email</label>
          <input
            type="email"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
            value={profileData?.email || ''}
            readOnly
          />
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">No. HP</label>
          <input
            type="text"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
            value={profileData?.no_hp || ''}
            readOnly
          />
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">Asal Institusi</label>
          <input
            type="text"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none"
            value={profileData?.asal_institusi || ''}
            readOnly
          />
        </div>
      </form>
      <hr className="my-8 border-gray-700" />
      <form onSubmit={handlePasswordUpdate} className="space-y-6">
        <div>
          <label className="block text-white mb-1 font-semibold">Current Password</label>
          <div className="relative">
            <input
              type={showPasswords.currentPassword ? 'text' : 'password'}
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none pr-10"
              disabled={passwordLoading}
            />
            <span
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPasswords(prev => ({ ...prev, currentPassword: !prev.currentPassword }))}
            >
              {showPasswords.currentPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">New Password</label>
          <div className="relative">
            <input
              type={showPasswords.newPassword ? 'text' : 'password'}
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none pr-10"
              disabled={passwordLoading}
            />
            <span
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
            >
              {showPasswords.newPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-white mb-1 font-semibold">Confirm New Password</label>
          <div className="relative">
            <input
              type={showPasswords.confirmNewPassword ? 'text' : 'password'}
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none pr-10"
              disabled={passwordLoading}
            />
            <span
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirmNewPassword: !prev.confirmNewPassword }))}
            >
              {showPasswords.confirmNewPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </span>
          </div>
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold" disabled={passwordLoading}>
          {passwordLoading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
      
      {/* Reset Password Section */}
      <hr className="my-8 border-gray-700" />
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Reset Password</h3>
          <p className="text-gray-400 text-sm mb-4">
            Jika Anda lupa password, Anda dapat mereset password melalui email.
          </p>
          <button 
            onClick={goToResetPassword}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded font-semibold transition-colors"
          >
            🔄 Reset Password
          </button>
        </div>
      </div>


    </div>
  );
};

export default Profile;
