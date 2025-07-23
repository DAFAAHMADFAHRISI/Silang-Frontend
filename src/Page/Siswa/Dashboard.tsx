import React from 'react';

const Divider = () => <div className="border-t border-white/30 my-6 w-full" />;

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pt-1 px-6 pb-6">
      {/* Title - match other pages */}
      <div className="mb-4 mt-0">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      </div>
      <Divider />

      {/* Statistik Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">Statistik</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[110px]">
            <h3 className="text-sm text-gray-300 mb-2 text-center">Hadir Hari Ini</h3>
            <p className="text-3xl font-bold text-center">1</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[110px]">
            <h3 className="text-sm text-gray-300 mb-2 text-center">Telat Hari Ini</h3>
            <p className="text-3xl font-bold text-center">0</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[110px]">
            <h3 className="text-sm text-gray-300 mb-2 text-center">Tepat Waktu</h3>
            <p className="text-3xl font-bold text-center">1</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[110px]">
            <h3 className="text-sm text-gray-300 mb-2 text-center">Jumlah Mentor</h3>
            <p className="text-3xl font-bold text-center">13</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-center min-h-[110px]">
            <h3 className="text-sm text-gray-300 mb-2 text-center">Jumlah Siswa</h3>
            <p className="text-3xl font-bold text-center">19</p>
          </div>
        </div>
      </div>
      <Divider />

      {/* Absensi Hari Ini Section */}
      <div className="mb-2">
        <h2 className="text-2xl font-semibold mb-4">Absensi Hari Ini</h2>
        <div className="bg-gray-800 rounded-lg p-6 max-w-sm">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Dafa Ahmad Fahrisi</h3>
              <p className="text-gray-400 text-sm mb-2">dafamangku@gmail.com</p>
              <div className="space-y-1">
                <p className="text-sm">Check-in: 06:56:37 AM</p>
                <p className="text-red-400 text-sm">Telat 0 jam 0 menit 0 detik</p>
                <p className="text-sm">Check-out: -</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Divider />

      {/* Tugas Hari Ini Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">Tugas Hari Ini</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pending Task */}
          <div className="bg-orange-500 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">
              Lakukan Analisis dan Desain Arsitektur Apilkasi Silang
            </h3>
            <div className="space-y-2 text-sm">
              <p>Due Date: 42 menit yang lalu</p>
              <p>Status: Pending</p>
              <p>Nilai: 0</p>
              <p>Catatan: Melakukan Analisis dan Desain Arsitektur Apilkasi Silang</p>
            </div>
          </div>

          {/* Completed Task */}
          <div className="bg-blue-600 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-3">
              Buat SOP Si Aladin
            </h3>
            <div className="space-y-2 text-sm">
              <p>Due Date: dalam sehari</p>
              <p>Status: Completed</p>
              <p>Nilai: 85</p>
              <p>Selesai: 09:49:41 AM</p>
              <p>Catatan: Tutorial Si Aladin</p>
            </div>
          </div>
        </div>
      </div>
      <Divider />
    </div>
  );
};

export default Dashboard;
