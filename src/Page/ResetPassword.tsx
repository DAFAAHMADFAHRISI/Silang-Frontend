import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authAPI } from '../services/api';

interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  token: string;
}

const ReserPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    // Prefill email from navigation state if available
    const stateEmail = (location.state as any)?.email as string | undefined;
    if (stateEmail) {
      setResetPasswordData(prev => ({ ...prev, email: stateEmail }));
    }

    // Determine step based on URL hint
    if (location.pathname.toLowerCase().includes('/resetpassword/token') ||
        location.pathname.toLowerCase().includes('/resetpassword/token')) {
      setResetPasswordStep('reset');
    } else {
      setResetPasswordStep('email');
    }
  }, [location.pathname, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = resetPasswordData.email.trim();
    if (!email) {
      Swal.fire({
        icon: 'error',
        title: 'Email diperlukan!',
        text: 'Silakan isi email Anda terlebih dahulu.'
      });
      return;
    }

    try {
      setResetPasswordLoading(true);
      const result = await authAPI.forgotPassword(email);

      // Robust client-side validation of backend response content
      const lowered = (typeof result === 'string' ? result : JSON.stringify(result || {})).toLowerCase();
      const isNegativeResponse =
        result?.code === 404 ||
        result?.status === false ||
        result?.success === false ||
        result?.sent === false ||
        lowered.includes('not found') ||
        lowered.includes('tidak ditemukan') ||
        lowered.includes('akun tidak') ||
        lowered.includes('email tidak');

      if (isNegativeResponse) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengirim email!',
          text: 'Akun Anda tidak tersedia pada sistem. Tidak dapat mengirim reset password.'
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Email reset password terkirim!',
        text: `Email reset password telah dikirim ke ${email}. Silakan periksa email Anda untuk mendapatkan token reset password.`,
        confirmButtonText: 'OK'
      }).then(() => {
        setResetPasswordStep('reset');
      });
    } catch (err: any) {
      let errorMessage = 'Gagal mengirim email reset password.';
      const status = err?.response?.status;
      const apiMessage: string = err?.response?.data?.message || err?.message || '';
      const normalized = (apiMessage || '').toLowerCase();

      // Detect account-not-found variants from API
      const isAccountMissing =
        status === 404 ||
        normalized.includes('not found') ||
        normalized.includes('tidak ditemukan') ||
        normalized.includes('akun tidak tersedia') ||
        normalized.includes('akun tidak terdaftar') ||
        normalized.includes('user not') ||
        normalized.includes('email not');

      if (isAccountMissing) {
        errorMessage = 'Akun Anda tidak tersedia pada sistem. Tidak dapat mengirim reset password.';
      } else if (status === 404) {
        errorMessage = 'Endpoint reset password belum tersedia di server. Silakan hubungi administrator.';
      } else if (apiMessage) {
        errorMessage = apiMessage;
      }

      Swal.fire({ icon: 'error', title: 'Gagal mengirim email!', text: errorMessage });
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
        text: 'Password baru dan konfirmasi password harus sama.'
      });
      return;
    }

    if (!resetPasswordData.token) {
      Swal.fire({
        icon: 'error',
        title: 'Token diperlukan!',
        text: 'Silakan masukkan token yang dikirim ke email Anda.'
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
      let errorMessage = 'Gagal mereset password.';
      if (err?.response?.status === 404) {
        errorMessage = 'Endpoint reset password belum tersedia di server. Silakan hubungi administrator.';
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      Swal.fire({ icon: 'error', title: 'Gagal mereset password!', text: errorMessage });
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const goBack = () => {
    navigate('/Login');
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <button onClick={goBack} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-700 rounded-full"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Reset Password
            </h1>
          </div>
          <p className="text-gray-400 ml-9">Reset password akun Anda melalui email</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${resetPasswordStep === 'email' ? 'text-blue-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${resetPasswordStep === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                1
              </div>
              <span className="text-sm">Kirim Email</span>
            </div>
            <div className={`w-8 h-0.5 ${resetPasswordStep === 'reset' ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center space-x-2 ${resetPasswordStep === 'reset' ? 'text-blue-500' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${resetPasswordStep === 'reset' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
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
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Kirim Email Reset</h2>
                <p className="text-gray-400 text-sm">Masukkan email untuk menerima token reset</p>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={resetPasswordData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan email Anda"
                  disabled={resetPasswordLoading}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resetPasswordLoading}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${resetPasswordLoading ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {resetPasswordLoading ? 'Mengirim...' : 'Kirim Email Reset'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Masukkan Token & Password Baru</h2>
                <p className="text-gray-400 text-sm">Masukkan token yang dikirim ke email dan password baru Anda</p>
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">Token Reset</label>
                <input
                  type="text"
                  name="token"
                  value={resetPasswordData.token}
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                  onClick={() => setResetPasswordStep('email')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordLoading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${resetPasswordLoading ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
            <button onClick={goBack} className="text-blue-400 hover:text-blue-300 underline">Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReserPassword;


