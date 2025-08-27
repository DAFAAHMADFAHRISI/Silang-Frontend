import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthError: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errorData, setErrorData] = useState({
    error: '',
    email: '',
    name: '',
    picture: '',
    googleId: ''
  });

  useEffect(() => {
    // Ambil data dari URL parameters
    const error = searchParams.get('error') || '';
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') || '';
    const picture = searchParams.get('picture') || '';
    const googleId = searchParams.get('googleId') || searchParams.get('id') || '';

    setErrorData({
      error,
      email,
      name,
      picture,
      googleId
    });

    // Jika ini adalah halaman HTML dari backend, redirect ke frontend React
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      // Ini adalah backend, redirect ke frontend
      const frontendUrl = `http://localhost:3333/auth-error${window.location.search}`;
      window.location.href = frontendUrl;
    }

    // Jika tidak ada data dari URL parameters, coba ambil dari window.location.search
    if (!error && !email && !name) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get('error');
      const urlEmail = urlParams.get('email');
      const urlName = urlParams.get('name');
      const urlPicture = urlParams.get('picture');
      const urlGoogleId = urlParams.get('googleId') || urlParams.get('id');

      if (urlError || urlEmail || urlName) {
        setErrorData({
          error: urlError || '',
          email: urlEmail || '',
          name: urlName || '',
          picture: urlPicture || '',
          googleId: urlGoogleId || ''
        });
      }
    }
  }, [searchParams]);

  const handleBackToLogin = () => {
    navigate('/Login');
  };

  const handleContactAdmin = () => {
    // Bisa diubah sesuai kebutuhan - email, WhatsApp, dll
    const message = `Halo, saya ingin mendaftarkan akun Google saya ke dalam sistem SILANG.\n\nInformasi akun:\nNama: ${errorData.name}\nEmail: ${errorData.email}\nGoogle ID: ${errorData.googleId}`;
    
    // Buka WhatsApp dengan pesan yang sudah disiapkan
    // Ganti nomor WhatsApp sesuai kebutuhan
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Decode URL-encoded values
  const decodedName = decodeURIComponent(errorData.name);
  const decodedEmail = decodeURIComponent(errorData.email);
  const decodedPicture = decodeURIComponent(errorData.picture);

  // Jika tidak ada data, tampilkan pesan default
  const hasData = decodedName || decodedEmail || errorData.googleId;
  const displayName = decodedName || 'Tidak Diketahui';
  const displayEmail = decodedEmail || 'Tidak Diketahui';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
        {/* Error Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">!</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Akun Belum Terdaftar</h1>
          <p className="text-gray-600 text-sm">
            Maaf, akun Google Anda belum terdaftar dalam sistem kami.
          </p>
        </div>

        {/* User Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{displayName}</p>
              <p className="text-gray-600 text-sm">{displayEmail}</p>
            </div>
          </div>
        </div>

        {/* Google Account Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Informasi Akun Google:</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Nama: {displayName}</li>
            <li>• Email: {displayEmail}</li>
            {errorData.googleId && (
              <li>• Google ID: {errorData.googleId}</li>
            )}
            {!hasData && (
              <li>• Informasi akun tidak tersedia</li>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBackToLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Kembali ke Login
          </button>
          <button
            onClick={handleContactAdmin}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Hubungi Administrator
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <h4 className="font-semibold text-gray-800 mb-2">Butuh bantuan?</h4>
          <p className="text-gray-600 text-sm">
            Silakan hubungi administrator untuk mendaftarkan akun Anda ke dalam sistem.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
