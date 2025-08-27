import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error parameters
        const errorParam = searchParams.get('error');
        const codeParam = searchParams.get('code');
        
                 if (errorParam) {
           if (errorParam === 'account_not_found') {
             // Redirect ke halaman auth-error dengan data dari URL
             const email = searchParams.get('email') || '';
             const name = searchParams.get('name') || '';
             const picture = searchParams.get('picture') || '';
             const googleId = searchParams.get('googleId') || '';
             
             const errorUrl = `/auth-error?error=${errorParam}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(picture)}&googleId=${encodeURIComponent(googleId)}`;
             navigate(errorUrl);
             return;
           } else if (errorParam === 'access_denied') {
             setError('Akses ditolak. Silakan coba lagi.');
             setTimeout(() => {
               navigate('/Login?error=google_auth_failed');
             }, 3000);
             return;
           } else {
             setError('Terjadi kesalahan saat login Google.');
             setTimeout(() => {
               navigate('/Login?error=callback_failed');
             }, 3000);
             return;
           }
         }

        // If we have a code, process the OAuth callback
        if (codeParam) {
          try {
            const response = await fetch('http://localhost:3000/API/auth/google/callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code: codeParam
              }),
            });

            const data = await response.json();

            if (response.ok && data.token) {
              // Store user data
              localStorage.setItem('token', data.token);
              if (data.nama) localStorage.setItem('nama', data.nama);
              if (data.role) localStorage.setItem('role', data.role);
              if (data.id) localStorage.setItem('user_id', data.id.toString());
              if (data.mentor_id) localStorage.setItem('mentor_id', data.mentor_id.toString());
              localStorage.setItem('user_data', JSON.stringify(data));

              // Redirect based on role
              if (data.role === 'siswa') {
                navigate('/DashboardSiswa');
              } else if (data.role === 'admin' || data.role === 'superadmin') {
                navigate('/DashboardSuperAdmin');
              } else if (data.role === 'mentor') {
                navigate('/mentor/dashboard');
              } else if (data.role === 'guru') {
                navigate('/guru/dashboard');
              } else {
                navigate('/LoadingRole');
              }
                         } else {
               // Handle specific error cases
               if (data.error === 'account_not_found') {
                 // Redirect ke halaman auth-error dengan data dari response
                 const email = data.email || '';
                 const name = data.name || '';
                 const picture = data.picture || '';
                 const googleId = data.googleId || '';
                 
                 const errorUrl = `/auth-error?error=${data.error}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&picture=${encodeURIComponent(picture)}&googleId=${encodeURIComponent(googleId)}`;
                 navigate(errorUrl);
               } else {
                 setError(data.message || 'Login Google gagal.');
                 setTimeout(() => {
                   navigate('/Login?error=google_auth_failed');
                 }, 3000);
               }
             }
          } catch (err) {
            console.error('Error processing Google callback:', err);
            setError('Terjadi kesalahan saat memproses login Google.');
            setTimeout(() => {
              navigate('/Login?error=callback_failed');
            }, 3000);
          }
        } else {
          // No code parameter, redirect to login
          navigate('/Login?error=callback_failed');
        }
      } catch (err) {
        console.error('Error in Google callback:', err);
        setError('Terjadi kesalahan saat memproses callback.');
        setTimeout(() => {
          navigate('/Login?error=callback_failed');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <div className="bg-[#232834] rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Memproses Login Google</h2>
          <p className="text-gray-400 text-sm">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <div className="bg-[#232834] rounded-xl shadow-lg w-full max-w-sm p-6 text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Login Gagal</h2>
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate('/Login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;
