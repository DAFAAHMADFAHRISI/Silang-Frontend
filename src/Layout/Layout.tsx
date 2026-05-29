import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link, useLocation } from 'react-router-dom';
import PetStreak from '../Page/Siswa/PetStreak';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Ambil role dari localStorage
  const role = localStorage.getItem('role');

  // Menu berdasarkan role
  let menuItems: { to: string; icon: string; label: string }[] = [];
  if (role === 'superadmin') {
    menuItems = [
      { to: '/DashboardSuperAdmin', icon: 'fa fa-tachometer-alt', label: 'Dashboard' },
      { to: '/Institusi', icon: 'fa fa-university', label: 'Data Institusi' },
      { to: '/UserManagement', icon: 'fa fa-user-cog', label: 'User Management' },
      { to: '/DataTugas', icon: 'fa fa-clipboard-list', label: 'Data Tugas' },
      { to: '/DataJadwal', icon: 'fa fa-calendar-alt', label: 'Data Jadwal' },
      { to: '/DataAbsensi', icon: 'fa fa-user-check', label: 'Data Absensi' },
      { to: '/DataMentorSiswa', icon: 'fa fa-chalkboard-teacher', label: 'Data Mentor - Siswa' },
      { to: '/DataGuruSiswa', icon: 'fa fa-user-graduate', label: 'Data Guru - Siswa' },
      { to: '/DataRekap', icon: 'fa fa-chart-bar', label: 'Data Rekap' },
      { to: '/Sertifikat', icon: 'fa fa-award', label: 'Sertifikat' }
    ];
  } else if (role === 'siswa') {
    menuItems = [
      { to: '/DashboardSiswa', icon: 'fa fa-tachometer-alt', label: 'Dashboard' },
      { to: '/ChatSiswa', icon: 'fa fa-comments', label: 'Chat' },
      { to: '/TodoSiswa', icon: 'fa fa-tasks', label: 'Tugas' },
      { to: '/AttendanceSiswa', icon: 'fa fa-calendar-check', label: 'Absensi' },
      { to: '/siswa/work-assignments', icon: 'fa fa-map-marker-alt', label: 'Tugas Luar' },
      { to: '/siswa/activity', icon: 'fa fa-chart-line', label: 'Activity' },
      { to: '/ReportSiswa', icon: 'fa fa-file-alt', label: 'Report' },
      { to: '/SiswaSertifikat', icon: 'fa fa-award', label: 'Sertifikat' },
    ];
  } else if (role === 'mentor') {
    menuItems = [
      { to: '/mentor/dashboard', icon: 'fa fa-tachometer-alt', label: 'Dashboard' },
      { to: '/mentor/chat', icon: 'fa fa-comments', label: 'Chat' },
      { to: '/mentor/tugas', icon: 'fa fa-clipboard-list', label: 'Data Tugas' },
      { to: '/mentor/work-assignments', icon: 'fa fa-map-marker-alt', label: 'Tugas Luar' },
      { to: '/mentor/absensi', icon: 'fa fa-user-check', label: 'Data Absensi' },
      { to: '/mentor/rekap', icon: 'fa fa-chart-bar', label: 'Data Rekap' },
      { to: '/mentor/activity-summary', icon: 'fa fa-chart-line', label: 'Ringkasan Aktivitas' },
    ];
  } else if (role === 'guru') {
    menuItems = [
      { to: '/guru/dashboard', icon: 'fa fa-tachometer-alt', label: 'Dashboard' },
      { to: '/guru/chat', icon: 'fa fa-comments', label: 'Chat' },
      { to: '/guru/tugas', icon: 'fa fa-clipboard-list', label: 'Data Tugas' },
      { to: '/guru/absensi', icon: 'fa fa-user-check', label: 'Data Absensi' },
      { to: '/guru/rekap', icon: 'fa fa-chart-bar', label: 'Data Rekap' },
    ];
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          absolute lg:static top-0 left-0 z-50 w-full lg:w-64 bg-gray-900 lg:border-r border-b border-gray-800 lg:border-b-0 flex flex-col py-4 lg:py-6 px-4 lg:px-2 max-h-full overflow-y-auto
          transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${sidebarOpen ? 'translate-y-0' : '-translate-y-full lg:translate-y-0'}
        `}>
          {/* Toggle up button for mobile */}
          <div className="flex justify-center mb-2 lg:hidden">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-2 flex items-center justify-center w-full"
            >
              <i className="fa fa-chevron-up text-xl"></i>
            </button>
          </div>


          <nav className="flex flex-col space-y-2">
            {menuItems.length === 0 ? (
              <div className="text-gray-500 text-center">No menu available</div>
            ) : (
              menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${location.pathname === item.to
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${(item.to === '/Sertifikat' || item.to === '/SiswaSertifikat') ? 'border border-yellow-700/40 hover:border-yellow-500/70' : ''}`}
                >
                  <span className={`mr-3 text-lg ${(item.to === '/Sertifikat' || item.to === '/SiswaSertifikat') ? 'text-yellow-400' : ''}`}>
                    <i className={item.icon} />
                  </span>
                  <span className={`text-sm lg:text-base ${(item.to === '/Sertifikat' || item.to === '/SiswaSertifikat') ? 'text-yellow-300' : ''}`}>{item.label}</span>
                </Link>
              ))
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      {/* Floating PetStreak only for siswa */}
      {role === 'siswa' && (
        <PetStreak />
      )}
      <Footer />
    </div>
  );
};

export default Layout; 