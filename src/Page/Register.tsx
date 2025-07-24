import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listbox } from '@headlessui/react';

const institutions = [
  { value: '', label: 'Select Institution', disabled: true },
  { value: 'instansi1', label: 'Instansi 1' },
  { value: 'instansi2', label: 'Instansi 2' },
];

const Register: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
    no_hp: '',
    kelamin: '1',
    asal_institusi_id: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Map frontend form fields to API fields
    const payload = new URLSearchParams();
    payload.append('nama', form.nama);
    payload.append('email', form.email);
    payload.append('password', form.password);
    payload.append('no_hp', form.no_hp);
    payload.append('kelamin', form.kelamin);
    payload.append('asal_institusi_id', form.asal_institusi_id);

    try {
      const res = await fetch('http://localhost:3000/api/register', {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-[#232834] rounded-xl shadow-lg w-full max-w-md p-8">
        {/* Tabs */}
        <div className="flex mb-8 border-b border-gray-700">
          <button
            className={`flex-1 text-lg pb-2 font-medium transition-colors duration-200 ${activeTab === 'login' ? 'text-gray-300' : 'text-gray-400'} focus:outline-none`}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className={`flex-1 text-lg pb-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === 'register' ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent'} focus:outline-none`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        {/* Register Form */}
        {activeTab === 'register' && (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="nama"
              placeholder="Nama"
              value={form.nama}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
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
            <input
              type="tel"
              name="no_hp"
              placeholder="No HP"
              value={form.no_hp}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <div className="flex gap-4 items-center">
              <label className="text-gray-200">Kelamin:</label>
              <label className="text-gray-200">
                <input
                  type="radio"
                  name="kelamin"
                  value="1"
                  checked={form.kelamin === '1'}
                  onChange={handleChange}
                /> Laki-laki
              </label>
              <label className="text-gray-200">
                <input
                  type="radio"
                  name="kelamin"
                  value="2"
                  checked={form.kelamin === '2'}
                  onChange={handleChange}
                /> Perempuan
              </label>
            </div>
            <select
              name="asal_institusi_id"
              value={form.asal_institusi_id}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            >
              <option value="">Pilih Institusi</option>
              <option value="1">SMK Negeri 1 Sumenep</option>
              <option value="2">SMK Negeri 2 Pamekasan</option>
            </select>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            {error && <div className="text-red-400 text-sm">{error}</div>}
            {success && <div className="text-green-400 text-sm">{success}</div>}
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}
        {/* Login Form Placeholder */}
        {activeTab === 'login' && (
          <div className="text-gray-400 text-center py-8">Login form goes here.</div>
        )}
      </div>
    </div>
  );
};

export default Register;
