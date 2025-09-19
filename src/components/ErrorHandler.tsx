import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useToast } from './ToastManager';

const ErrorHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [show404Page, setShow404Page] = useState(false);

  useEffect(() => {
    // Check for different types of errors
    const error = searchParams.get('error');
    const pathname = location.pathname;

    // Handle auth error (from AuthError component)
    if (error === 'account_not_found') {
      showToast({
        type: 'error',
        message: `Akun tidak tersedia dalam sistem. Silakan hubungi administrator.`,
        duration: 8000
      });
      return;
    }

    // Handle 404 page not found
    if (pathname !== '/' && pathname !== '/Login' && pathname !== '/register') {
      // Check if this is a valid route by looking at the current routes
      const validRoutes = [
        '/', '/Login', '/register', '/google-callback', '/auth-error', '/test-auth-error', '/LoadingRole',
        '/DashboardSiswa', '/TodoSiswa', '/AttendanceSiswa', '/ChatSiswa', '/ReportSiswa', '/ProfileSiswa', '/ReserPassword',
        '/mentor/dashboard', '/mentor/tugas', '/mentor/absensi', '/mentor/rekap', '/mentor/chat', '/Mentor/Profile', '/Mentor/ResetPassword',
        '/guru/dashboard', '/guru/tugas', '/guru/absensi', '/guru/rekap', '/guru/chat', '/Guru/Profile', '/Guru/ResetPassword',
        '/DashboardSuperAdmin', '/Institusi', '/UserManagement', '/DataTugas', '/DataJadwal', '/DataAbsensi',
        '/DataMentorSiswa', '/DataGuruSiswa', '/DataRekap', '/ResetPassword', '/access-denied'
      ];

      const isValidRoute = validRoutes.some(route => pathname.startsWith(route));
      
      if (!isValidRoute) {
        setShow404Page(true);
        showToast({
          type: 'error',
          message: `Halaman "${pathname}" tidak ditemukan.`,
          duration: 6000
        });
      }
    }

    // Handle other types of errors
    if (error) {
      showToast({
        type: 'warning',
        message: `Terjadi kesalahan: ${error}. Silakan coba lagi.`,
        duration: 5000
      });
    }
  }, [location.pathname, searchParams, navigate, showToast]);

  const handleGoBack = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      // Redirect ke dashboard yang sesuai dengan role
      switch (role) {
        case 'siswa':
          navigate('/DashboardSiswa');
          break;
        case 'mentor':
          navigate('/mentor/dashboard');
          break;
        case 'guru':
          navigate('/guru/dashboard');
          break;
        case 'superadmin':
          navigate('/DashboardSuperAdmin');
          break;
        default:
          navigate('/Login');
          break;
      }
    } else {
      navigate('/Login');
    }
  };

  // Jika menampilkan halaman 404
  if (show404Page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <i className="fa fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
            <h1 className="text-2xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
            <p className="text-gray-300 mb-6">
              Halaman yang Anda cari tidak ditemukan atau tidak tersedia.
            </p>
            <div className="text-sm text-gray-400 mb-4">
              <p>URL: <span className="font-mono text-white">{location.pathname}</span></p>
              {localStorage.getItem('role') && (
                <p>Role: <span className="font-semibold text-white">{localStorage.getItem('role')}</span></p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoBack}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <i className="fa fa-home mr-2"></i>
              Kembali ke Dashboard
            </button>
            
            <button
              onClick={() => navigate('/Login')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <i className="fa fa-sign-out-alt mr-2"></i>
              Login Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Return empty div - only toast will be visible
  return <div />;
};

export default ErrorHandler;
