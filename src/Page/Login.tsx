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
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.nama) localStorage.setItem('nama', data.nama);
        if (data.role) localStorage.setItem('role', data.role);
        if (data.id) localStorage.setItem('user_id', data.id.toString());
        if (data.mentor_id) localStorage.setItem('mentor_id', data.mentor_id.toString());
        if (data.user_id) localStorage.setItem('user_id', data.user_id.toString());
        
        // Store complete user data for debugging
        localStorage.setItem('user_data', JSON.stringify(data));
        
        // Redirect sesuai role
        if (data.role === 'siswa') {
          navigate('/DashboardSiswa');
        } else if (data.role === 'admin' || data.role === 'superadmin') {
          navigate('/DashboardSuperAdmin');
        } else if (data.role === 'mentor') {
          navigate('/DashboardMentor');
        } else if (data.role === 'guru') {
          navigate('/DashboardGuru');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
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
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base"
            />
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
