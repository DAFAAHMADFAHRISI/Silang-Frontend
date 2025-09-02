import React, { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useToast } from './ToastManager';

const ErrorHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

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
        '/', '/Login', '/register', '/google-callback', '/auth-error', '/test-auth-error',
        '/DashboardSiswa', '/TodoSiswa', '/AttendanceSiswa', '/ChatSiswa', '/ReportSiswa', '/ProfileSiswa', '/ResetPassword',
        '/mentor/dashboard', '/mentor/tugas', '/mentor/absensi', '/mentor/rekap', '/mentor/chat',
        '/guru/dashboard', '/guru/tugas', '/guru/absensi', '/guru/rekap', '/guru/chat',
        '/DashboardSuperAdmin', '/LoadingRole', '/Institusi', '/UserManagement', '/DataTugas', '/DataJadwal', '/DataAbsensi',
        '/DataMentorSiswa', '/DataGuruSiswa', '/DataRekap'
      ];

      const isValidRoute = validRoutes.some(route => pathname.startsWith(route));
      
      if (!isValidRoute) {
        showToast({
          type: 'error',
          message: `Halaman "${pathname}" tidak ditemukan. Anda akan dialihkan ke beranda.`,
          duration: 6000
        });

        // Redirect to home page after 3 seconds
        const timer = setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);

        return () => clearTimeout(timer);
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

  // Return empty div - only toast will be visible
  return <div />;
};

export default ErrorHandler;
