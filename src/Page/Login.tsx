import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = new URLSearchParams();
    payload.append('email', form.email);
    payload.append('password', form.password);

    try {
      const res = await fetch('http://localhost:3000/api/login', {
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
        // Hapus baris ini karena backend tidak mengirim user_id
        // if (data.user_id) localStorage.setItem('user_id', data.user_id.toString());
        
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
        setError(data.message || 'Login gagal.');
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
            {error && <div className="text-red-400 text-xs lg:text-sm">{error}</div>}
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 lg:py-3 rounded-md transition-colors duration-200 text-sm lg:text-base"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
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
