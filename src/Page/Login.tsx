import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-[#232834] rounded-xl shadow-lg w-full max-w-md p-8">
        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-700">
          <button
            className={`flex-1 text-lg pb-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === 'login' ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'} focus:outline-none`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 text-lg pb-2 font-medium transition-colors duration-200 ${activeTab === 'register' ? 'text-gray-300' : 'text-gray-400'} focus:outline-none`}
            onClick={() => navigate('/register')}
          >
            Register
          </button>
        </div>
        {/* Login Form */}
        {activeTab === 'login' && (
          <form className="flex flex-col gap-2">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors duration-200"
            >
              Login
            </button>
            {/* Jarak separator diperkecil maksimal */}
            <div className="flex items-center my-0">
              <div className="flex-grow h-px bg-gray-700" />
              <span className="mx-2 text-gray-400 text-sm">or</span>
              <div className="flex-grow h-px bg-gray-700" />
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-white text-gray-800 font-medium py-3 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors duration-200 mt-0"
            >
              {/* Ikon Google hanya warna merah dan proporsional */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M21.805 10.023h-9.765v3.954h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.25s2.75-6.25 6.125-6.25c1.922 0 3.211.82 3.953 1.523l2.703-2.633C17.07 2.82 15.07 2 12.805 2 7.477 2 3.305 6.477 3.305 12s4.172 10 9.5 10c5.484 0 9.117-3.852 9.117-9.297 0-.625-.07-1.102-.117-1.68z" fill="#EA4335"/>
              </svg>
              <span className="font-medium">Sign in with Google</span>
            </button>
          </form>
        )}
        {/* Register Form Placeholder */}
        {activeTab === 'register' && (
          <div className="text-gray-400 text-center py-8">Register form goes here.</div>
        )}
      </div>
    </div>
  );
};

export default Login;
