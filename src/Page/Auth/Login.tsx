import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Check for Google OAuth errors on component mount
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'google_auth_failed') {
        setError('Login Google gagal. Silakan coba lagi.');
      } else if (errorParam === 'callback_failed') {
        setError('Terjadi kesalahan saat memproses login Google.');
      } else if (errorParam === 'account_not_found') {
        setError('Akun belum terdaftar. Silakan register terlebih dahulu.');
      } else {
        setError('Terjadi kesalahan saat login.');
      }
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    // Redirect ke Google OAuth dengan callback URL yang mengarah ke frontend
    const callbackUrl = encodeURIComponent('http://localhost:3333/google-callback');
    window.location.href = `http://localhost:3000/API/auth/google?callback=${callbackUrl}`;
  };

  const handleForgotPassword = () => {
    const trimmedEmail = form.email.trim();
    const state = trimmedEmail ? { email: trimmedEmail } : undefined;
    navigate('/ResetPassword', { state });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = new URLSearchParams();
    payload.append('email', form.email);
    payload.append('password', form.password);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });
      const data = await res.json();
      console.log('Login response:', data);
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.nama) localStorage.setItem('nama', data.nama);
        if (data.role) localStorage.setItem('role', data.role);
        // Backend mengirim 'id', bukan 'user_id'
        if (data.id) {
          localStorage.setItem('user_id', data.id.toString());
          console.log('Stored user_id:', data.id.toString());
        }
        if (data.mentor_id) localStorage.setItem('mentor_id', data.mentor_id.toString());
        
        // Store complete user data for debugging
        localStorage.setItem('user_data', JSON.stringify(data));
        
        // Redirect sesuai role
        if (data.role === 'siswa') {
          navigate('/DashboardSiswa');
        } else if (data.role === 'admin' || data.role === 'superadmin') {
          navigate('/DashboardSuperAdmin');
        } else if (data.role === 'mentor') {
          navigate('/mentor/dashboard');
        } else if (data.role === 'guru') {
          navigate('/guru/dashboard');
        } else {
          navigate('/');
        }
      } else {
        const message: string = data?.message || '';
        const normalized = message.toLowerCase();
        if (
          data?.code === 404 ||
          normalized.includes('not found') ||
          normalized.includes('tidak ditemukan') ||
          normalized.includes('akun tidak tersedia')
        ) {
          setError('akun anda tidak tersedia pada sistem');
        } else {
          setError(message || 'Login gagal.');
        }
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      {/* Logo outside the card */}
      <div className="flex justify-center mb-8">
        <img 
          src="/LogoKominfo.png" 
          alt="Kominfo Logo" 
          className="h-32 w-auto"
        />
      </div>
      
      <div className="bg-[#232834] rounded-xl shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl p-4 sm:p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex mb-6 lg:mb-8 border-b border-gray-700">
          <button
            className={`flex-1 text-base lg:text-lg pb-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === 'login' ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'} focus:outline-none`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 text-base lg:text-lg pb-2 font-medium transition-colors duration-200 ${activeTab === 'register' ? 'text-gray-300' : 'text-gray-400'} focus:outline-none`}
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
        
        {/* Login Form */}
        {activeTab === 'login' && (
          <form className="flex flex-col gap-3 lg:gap-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base"
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Forgot Password Link */}
            <div className="flex justify-end -mt-1 mb-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-400 hover:text-blue-300 text-xs lg:text-sm focus:outline-none"
              >
                Lupa password?
              </button>
            </div>

            {error && (
              <div className="space-y-2">
                <div className="text-red-400 text-xs lg:text-sm">{error}</div>
                {error.includes('Akun belum terdaftar') && (
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 lg:py-3 rounded-md transition-colors duration-200 text-sm lg:text-base"
                  >
                    Daftar Sekarang
                  </button>
                )}
              </div>
            )}
            
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 lg:py-3 rounded-md transition-colors duration-200 text-sm lg:text-base"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            {/* Divider */}
            <div className="flex items-center my-0">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-3 text-gray-400 text-sm">atau</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>
            
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 lg:py-3 px-4 rounded-md transition-colors duration-200 text-sm lg:text-base border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Memproses...' : 'Login dengan Google'}
            </button>
          </form>
        )}
        
        {/* Register Form Placeholder */}
        {activeTab === 'register' && (
          <div className="text-gray-400 text-center py-8 text-sm lg:text-base">Register form goes here.</div>
        )}
      </div>
    </div>
  );
};

export default Login;
