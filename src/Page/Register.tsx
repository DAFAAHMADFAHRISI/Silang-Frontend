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
    fullName: '',
    email: '',
    phone: '',
    institution: '',
    password: '',
    confirmPassword: '',
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
          <form className="flex flex-col gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            {/* Custom Dropdown Institution */}
            <div className="relative">
              <Listbox
                value={form.institution}
                onChange={val => setForm(f => ({ ...f, institution: val }))}
              >
                <Listbox.Button className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-left w-full text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400 flex items-center">
                  {institutions.find(i => i.value === form.institution)?.label || 'Select Institution'}
                  {/* Garis vertikal */}
                  <span className="pointer-events-none absolute top-2 bottom-2 right-10 w-px bg-white" />
                  {/* Chevron icon */}
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-[#232834] border border-gray-700 rounded-md shadow-lg text-gray-200">
                  {institutions.map(option => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={({ active, selected }) =>
                        `px-4 py-2 cursor-pointer select-none ${active ? 'bg-blue-600 text-white' : ''} ${selected ? 'font-semibold' : ''} ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                      }
                    >
                      {option.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Listbox>
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="bg-transparent border border-gray-700 rounded-md px-4 py-3 text-gray-200 focus:outline-none focus:border-blue-400 placeholder-gray-400"
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors duration-200"
            >
              Register
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
