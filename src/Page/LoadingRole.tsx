import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoadingRole: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Memverifikasi kredensial...',
    'Memeriksa role pengguna...',
    'Menetapkan role superadmin...',
    'Menyiapkan dashboard...'
  ];

  useEffect(() => {
    // Check if this is a redirect from auth-success with token and user data
    const tokenParam = searchParams.get('token');
    const roleParam = searchParams.get('role');
    const namaParam = searchParams.get('nama');
    const idParam = searchParams.get('id');

    // If we have token and user data from auth-success redirect
    if (tokenParam) {
      // Store the user data
      localStorage.setItem('token', tokenParam);
      if (namaParam) localStorage.setItem('nama', namaParam);
      if (idParam) localStorage.setItem('user_id', idParam);
      
      // If user already has a role, redirect to appropriate dashboard
      if (roleParam && roleParam !== '') {
        localStorage.setItem('role', roleParam);
        if (roleParam === 'siswa') {
          navigate('/DashboardSiswa');
          return;
        } else if (roleParam === 'admin' || roleParam === 'superadmin') {
          navigate('/DashboardSuperAdmin');
          return;
        } else if (roleParam === 'mentor') {
          navigate('/mentor/dashboard');
          return;
        } else if (roleParam === 'guru') {
          navigate('/guru/dashboard');
          return;
        }
      }
      
      // If no role or empty role, assign superadmin role
      // Start the loading process
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            // Assign superadmin role
            localStorage.setItem('role', 'superadmin');
            localStorage.setItem('user_data', JSON.stringify({
              role: 'superadmin',
              nama: namaParam || 'Super Admin',
              token: tokenParam,
              id: idParam
            }));
            
            // Redirect to superadmin dashboard after 1 second
            setTimeout(() => {
              navigate('/DashboardSuperAdmin');
            }, 1000);
            return 100;
          }
          return prev + 2;
        });

        // Update current step based on progress
        if (progress < 25) {
          setCurrentStep(0);
        } else if (progress < 50) {
          setCurrentStep(1);
        } else if (progress < 75) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
      }, 100);

      return () => clearInterval(timer);
    }

    // If no token, redirect to login
    navigate('/Login?error=no_token');
  }, [progress, navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <img 
          src="/LogoKominfo.png" 
          alt="Kominfo Logo" 
          className="h-32 w-auto"
        />
      </div>
      
      {/* Loading Card */}
      <div className="bg-[#232834] rounded-xl shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl p-6 sm:p-8 lg:p-10 text-center">
        {/* Loading Animation */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
          Verifikasi Role
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-300 text-sm lg:text-base mb-6 leading-relaxed">
          Mohon tunggu sebentar, kami sedang memverifikasi role Anda...
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Status Messages */}
        <div className="space-y-3 text-left">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                index < currentStep 
                  ? 'bg-green-500' 
                  : index === currentStep 
                    ? 'bg-blue-500 animate-pulse' 
                    : 'bg-gray-600'
              }`}></div>
              <span className={index <= currentStep ? 'text-gray-300' : 'text-gray-400'}>
                {step}
              </span>
            </div>
          ))}
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400">
            Proses ini biasanya memakan waktu beberapa detik. 
            Jangan tutup halaman ini.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-xs">
          © 2024 Kominfo. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoadingRole;
