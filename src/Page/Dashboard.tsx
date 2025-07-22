import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-gray-200 text-center relative">
      <img
        src={process.env.PUBLIC_URL + '/LogoKominfo.png'}
        alt="Logo Kominfo"
        className="w-[115px] h-[100px] mb-8"
      />
      <h1 className="text-4xl font-bold m-0 mb-8">
        Selamat Datang di<br />
        <span className="font-bold">
          Sistem Informasi Layanan Magang (SILANG)
        </span>
      </h1>
      <p className="max-w-xl mt-6 mx-auto text-base text-slate-300 font-normal">
        Aplikasi untuk mempermudah pengelolaan informasi magang antara siswa, pembimbing, dan instansi di Dinas Komunikasi dan Informatika Kabupaten Sampang.
      </p>
      <div className="mt-10 flex gap-2 justify-center">
        <button
          className="px-8 py-2.5 rounded-3xl border border-blue-600 bg-transparent text-blue-400 font-medium text-base cursor-pointer transition-colors duration-200 hover:bg-blue-600 hover:text-white"
        >
          Login
        </button>
        <button
          className="px-8 py-2.5 rounded-3xl border border-blue-600 bg-transparent text-blue-400 font-medium text-base cursor-pointer transition-colors duration-200 hover:bg-blue-600 hover:text-white"
        >
          Register
        </button>
      </div>
      <footer className="absolute bottom-6 w-full text-center text-slate-300 text-sm opacity-70">
        © 2025 SILANG - Sistem Informasi Layanan Magang.
      </footer>
    </div>
  );
};

export default Dashboard;
