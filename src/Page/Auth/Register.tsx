import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listbox } from '@headlessui/react';

interface Institution {
  id: number;
  nama_institusi: string;
  alamat: string;
}

const Register: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    no_hp: '',
    kelamin: '1',
    asal_institusi_id: '',
    confirmPassword: '',
    role_preference: '',
    tanggal_mulai_magang: '',
    tanggal_selesai_magang: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch institutions from API
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch('http://localhost:3000/API/public/institusi');
        if (response.ok) {
          const data = await response.json();
          setInstitutions(data);
        } else {
          console.error('Failed to fetch institutions');
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Reset magang dates when switching away from siswa
      if (name === 'role_preference' && value !== 'siswa') {
        updated.tanggal_mulai_magang = '';
        updated.tanggal_selesai_magang = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Client-side password confirmation validation
    if (form.password !== form.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      setLoading(false);
      return;
    }

    // Validate role preference
    if (!form.role_preference) {
      setError('Silakan pilih peran (Siswa atau Guru).');
      setLoading(false);
      return;
    }

    // Validate magang dates for siswa
    if (form.role_preference === 'siswa') {
      if (!form.tanggal_mulai_magang || !form.tanggal_selesai_magang) {
        setError('Tanggal mulai dan selesai magang wajib diisi untuk Siswa.');
        setLoading(false);
        return;
      }
      if (new Date(form.tanggal_selesai_magang) <= new Date(form.tanggal_mulai_magang)) {
        setError('Tanggal selesai magang harus setelah tanggal mulai magang.');
        setLoading(false);
        return;
      }
    }

    // Map frontend form fields to API fields
    const payload = new URLSearchParams();
    payload.append('nama', form.nama);
    payload.append('email', form.email);
    payload.append('password', form.password);
    payload.append('confirmPassword', form.confirmPassword);
    payload.append('no_hp', form.no_hp);
    payload.append('kelamin', form.kelamin);
    payload.append('asal_institusi_id', form.asal_institusi_id);
    payload.append('role_preference', form.role_preference);

    if (form.role_preference === 'siswa') {
      payload.append('tanggal_mulai_magang', form.tanggal_mulai_magang);
      payload.append('tanggal_selesai_magang', form.tanggal_selesai_magang);
    }

    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload.toString(),
      });
      const data = await res.json();
      if (res.status === 201) {
        setSuccess(data.message || 'Registration successful!');
        setForm({
          nama: '',
          email: '',
          password: '',
          no_hp: '',
          kelamin: '1',
          asal_institusi_id: '',
          confirmPassword: '',
          role_preference: '',
          tanggal_mulai_magang: '',
          tanggal_selesai_magang: '',
        });
        setTimeout(() => {
          navigate('/login');
        }, 1500); // Redirect setelah 1.5 detik
      } else {
        setError(data.message || 'Registration failed.');
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
            className={`flex-1 text-base lg:text-lg pb-2 font-medium transition-colors duration-200 ${activeTab === 'login' ? 'text-gray-300' : 'text-gray-400'} focus:outline-none`}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className={`flex-1 text-base lg:text-lg pb-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === 'register' ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'} focus:outline-none`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        {/* Register Form */}
        {activeTab === 'register' && (
          <form className="flex flex-col gap-3 lg:gap-4" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-gray-400 text-xs lg:text-sm mb-1.5">Daftar Sebagai <span className="text-red-400">*</span></label>
              <div className="flex gap-3">
                <label
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 lg:px-4 lg:py-3 rounded-md border cursor-pointer transition-all duration-200 text-sm lg:text-base ${
                    form.role_preference === 'siswa'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/20'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="role_preference"
                    value="siswa"
                    checked={form.role_preference === 'siswa'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Siswa
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 lg:px-4 lg:py-3 rounded-md border cursor-pointer transition-all duration-200 text-sm lg:text-base ${
                    form.role_preference === 'guru'
                      ? 'border-green-500 bg-green-500/10 text-green-400 shadow-sm shadow-green-500/20'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="role_preference"
                    value="guru"
                    checked={form.role_preference === 'guru'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Guru
                </label>
              </div>
            </div>

            <input
              type="text"
              name="nama"
              placeholder="Full Name"
              value={form.nama}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base"
            />
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
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                {showConfirmPassword ? (
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
            <input
              type="tel"
              name="no_hp"
              placeholder="Phone Number"
              value={form.no_hp}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base"
            />
            <select
              name="kelamin"
              value={form.kelamin}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 text-sm lg:text-base"
            >
              <option value="1" className="bg-gray-800 text-gray-200">Male</option>
              <option value="2" className="bg-gray-800 text-gray-200">Female</option>
            </select>
            <select
              name="asal_institusi_id"
              value={form.asal_institusi_id}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 text-sm lg:text-base"
              disabled={loadingInstitutions}
            >
              <option value="" className="bg-gray-700 text-gray-400">
                {loadingInstitutions ? 'Loading institutions...' : 'Select Institution'}
              </option>
              {institutions.map((institution) => (
                <option 
                  key={institution.id} 
                  value={institution.id.toString()} 
                  className="bg-gray-800 text-gray-200"
                >
                  {institution.nama_institusi}
                </option>
              ))}
            </select>

            {/* Tanggal Magang Fields - Only for Siswa */}
            {form.role_preference === 'siswa' && (
              <div className="flex flex-col gap-3 p-3 lg:p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
                <p className="text-blue-400 text-xs lg:text-sm font-medium flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Periode Magang
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-xs">Tanggal Mulai Magang <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    name="tanggal_mulai_magang"
                    value={form.tanggal_mulai_magang}
                    onChange={handleChange}
                    className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 text-sm lg:text-base [color-scheme:dark]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 text-xs">Tanggal Selesai Magang <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    name="tanggal_selesai_magang"
                    value={form.tanggal_selesai_magang}
                    onChange={handleChange}
                    className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 text-sm lg:text-base [color-scheme:dark]"
                  />
                </div>
              </div>
            )}

            {error && <div className="text-red-400 text-xs lg:text-sm">{error}</div>}
            {success && <div className="text-green-400 text-xs lg:text-sm">{success}</div>}
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 lg:py-3 rounded-md transition-colors duration-200 text-sm lg:text-base"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
