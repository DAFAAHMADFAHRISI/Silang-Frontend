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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setForm({ ...form, [e.target.name]: e.target.value });
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

    // Map frontend form fields to API fields
    const payload = new URLSearchParams();
    payload.append('nama', form.nama);
    payload.append('email', form.email);
    payload.append('password', form.password);
    payload.append('confirmPassword', form.confirmPassword);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
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
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-3 py-2 lg:px-4 lg:py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 text-sm lg:text-base"
            />
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
