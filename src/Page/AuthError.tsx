import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, LogIn } from 'lucide-react';
import { useToast } from '../components/ToastManager';
import '../components/AuthError.css';

const AuthError: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get data from URL parameters
    const error = searchParams.get('error') || '';
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') || '';

    // Show toast notification for account not found
    if (error === 'account_not_found') {
      showToast({
        type: 'error',
        message: `Akun ${name || email} tidak tersedia dalam sistem. Silakan hubungi administrator.`,
        duration: 8000
      });
    }

    // Handle backend redirect logic - redirect from backend to frontend
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      const frontendUrl = `http://localhost:3333/auth-error${window.location.search}`;
      window.location.href = frontendUrl;
      return; // Stop execution here
    }
  }, [searchParams, showToast]);

  const handleGoToLogin = () => {
    navigate('/Login');
  };

  return (
    <div className="auth-error-container">
      <div className="auth-error-card">
        {/* Header */}
        <div className="auth-error-header">
          <div className="auth-error-icon">
            <AlertCircle className="h-16 w-16" />
          </div>
          <h1 className="auth-error-title">
            Login dengan Akun Google Gagal
          </h1>
          <p className="auth-error-message">
            Akun Anda belum terdaftar di sistem. Silakan hubungi Guru/Dosen atau SuperAdmin untuk mendapatkan akses.
          </p>
        </div>

        {/* Action Button */}
        <div className="auth-error-actions">
          <button
            onClick={handleGoToLogin}
            className="auth-error-button"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Kembali ke Halaman Login
          </button>
        </div>

        {/* Help Text */}
        <div className="auth-error-help">
          <p>
            <strong>Butuh bantuan?</strong><br />
            Silakan hubungi Guru/Dosen atau SuperAdmin untuk mendaftarkan akun Anda ke dalam sistem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
