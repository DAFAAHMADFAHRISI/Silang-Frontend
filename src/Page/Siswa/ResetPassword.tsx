import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authAPI } from '../../services/api';

interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  token: string;
}

const ResetPassword: React.FC = () => {
  const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordData>({
    email: '',
    newPassword: '',
    confirmNewPassword: '',
    token: ''
  });
  const [resetPasswordStep, setResetPasswordStep] = useState<'email' | 'reset'>('email');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmNewPassword: false
  });
  const [userEmail, setUserEmail] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'siswa') {
      navigate('/Login');
      return;
    }

    // Determine step based on URL
    if (location.pathname === '/ResetPassword/Token') {
      setResetPasswordStep('reset');
    } else {
      setResetPasswordStep('email');
    }

    // Get user email from profile data
    fetchUserEmail();
  }, [navigate, location.pathname]);

  const fetchUserEmail = async () => {
    try {
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
        navigate('/Login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Error server: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setUserEmail(data.email);
      setResetPasswordData(prev => ({
        ...prev,
        email: data.email
      }));
      
    } catch (err) {
      console.error('Error fetching user email:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Tidak dapat mengambil data email. Silakan refresh halaman.',
      });
    }
  };

  const handleResetPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Tidak dapat mengambil data email. Silakan refresh halaman.',
      });
      return;
    }

    try {
      setResetPasswordLoading(true);
      
      await authAPI.forgotPassword(userEmail);
      
      Swal.fire({
        icon: 'success',
        title: 'Email reset password terkirim!',
        text: `Email reset password telah dikirim ke ${userEmail}. Silakan periksa email Anda untuk mendapatkan token reset password.`,
        confirmButtonText: 'OK'
      }).then(() => {
        // Navigate to step 2 URL
        navigate('/ResetPassword/Token');
      });
      
    } catch (err: any) {
      console.error('Forgot password error:', err);
      
      let errorMessage = 'Gagal mengirim email reset password.';
      
      if (err?.response?.status === 404) {
        errorMessage = 'Endpoint reset password belum tersedia di server. Silakan hubungi administrator.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal mengirim email!',
        text: errorMessage,
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetPasswordData.newPassword !== resetPasswordData.confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password tidak cocok!',
        text: 'Password baru dan konfirmasi password harus sama.',
      });
      return;
    }

    if (!resetPasswordData.token) {
      Swal.fire({
        icon: 'error',
        title: 'Token diperlukan!',
        text: 'Silakan masukkan token yang dikirim ke email Anda.',
      });
      return;
    }

    try {
      setResetPasswordLoading(true);
      
      await authAPI.resetPassword(resetPasswordData.token, resetPasswordData.newPassword);
      
      Swal.fire({
        icon: 'success',
        title: 'Password berhasil direset!',
        text: 'Password Anda telah berhasil direset. Silakan login dengan password baru.',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/Login');
      });
      
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      let errorMessage = 'Gagal mereset password.';
      
      if (err?.response?.status === 404) {
        errorMessage = 'Endpoint reset password belum tersedia di server. Silakan hubungi administrator.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal mereset password!',
        text: errorMessage,
      });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const goBack = () => {
    navigate('/ProfileSiswa');
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={goBack}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reset Password
            </h1>
          </div>
          <p className="text-gray-400 ml-9">
            Reset password akun Anda melalui email
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${resetPasswordStep === 'email' ? 'text-orange-500' : 'text-green-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                resetPasswordStep === 'email' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <span className="text-sm">Kirim Email</span>
            </div>
            <div className={`w-8 h-0.5 ${resetPasswordStep === 'reset' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center space-x-2 ${resetPasswordStep === 'reset' ? 'text-green-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                resetPasswordStep === 'reset' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-400'
              }`}>
                2
              </div>
              <span className="text-sm">Reset Password</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {resetPasswordStep === 'email' ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Kirim Email Reset</h2>
                <p className="text-gray-400 text-sm">
                  Email reset password akan dikirim ke akun yang sedang login
                </p>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 cursor-not-allowed"
                  readOnly
                  disabled
                />
                <p className="text-gray-400 text-xs mt-2">
                  Email ini sesuai dengan akun yang sedang login
                </p>
              </div>

              <button
                type="submit"
                disabled={resetPasswordLoading}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
                  resetPasswordLoading
                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {resetPasswordLoading ? 'Mengirim...' : 'Kirim Email Reset'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Masukkan Token & Password Baru</h2>
                <p className="text-gray-400 text-sm">
                  Masukkan token yang dikirim ke email dan password baru Anda
                </p>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Token Reset</label>
                <input
                  type="text"
                  name="token"
                  value={resetPasswordData.token}
                  onChange={handleResetPasswordChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan token dari email"
                  disabled={resetPasswordLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={resetPasswordData.newPassword}
                    onChange={handleResetPasswordChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 pr-12"
                    placeholder="Masukkan password baru"
                    disabled={resetPasswordLoading}
                    required
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
                <label className="block text-white mb-2 font-semibold">Konfirmasi Password Baru</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirmNewPassword ? 'text' : 'password'}
                    name="confirmNewPassword"
                    value={resetPasswordData.confirmNewPassword}
                    onChange={handleResetPasswordChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 pr-12"
                    placeholder="Konfirmasi password baru"
                    disabled={resetPasswordLoading}
                    required
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

                             <div className="flex space-x-3">
                 <button
                   type="button"
                   onClick={() => navigate('/ResetPassword')}
                   className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                 >
                   Kembali
                 </button>
                <button
                  type="submit"
                  disabled={resetPasswordLoading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    resetPasswordLoading
                      ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {resetPasswordLoading ? 'Mereset...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Kembali ke{' '}
            <button
              onClick={goBack}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Profile
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
