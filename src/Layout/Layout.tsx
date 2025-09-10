import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link, useLocation } from 'react-router-dom';

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
    ];
  } else if (role === 'siswa') {
    menuItems = [
      { to: '/DashboardSiswa', icon: 'fa fa-tachometer-alt', label: 'Dashboard' },
      // { to: '/ChatSiswa', icon: 'fa fa-comments', label: 'Chat' },
      { to: '/TodoSiswa', icon: 'fa fa-tasks', label: 'To Do' },
      { to: '/AttendanceSiswa', icon: 'fa fa-calendar-check', label: 'Attendance' },
      { to: '/ReportSiswa', icon: 'fa fa-file-alt', label: 'Report' },
    ];
  } else if (role === 'mentor') {
    menuItems = [
      { to: '/mentor/dashboard', icon: 'fa fa-tachometer-alt', label: 'Dashboard' },
      // { to: '/mentor/chat', icon: 'fa fa-comments', label: 'Chat' },
      { to: '/mentor/tugas', icon: 'fa fa-clipboard-list', label: 'Data Tugas' },
      { to: '/mentor/absensi', icon: 'fa fa-user-check', label: 'Data Absensi' },
      { to: '/mentor/rekap', icon: 'fa fa-chart-bar', label: 'Data Rekap' },
    ];
  } else if (role === 'guru') {
    menuItems = [
      { to: '/guru/dashboard', icon: 'fa fa-tachometer-alt', label: 'Dashboard' },
      // { to: '/guru/chat', icon: 'fa fa-comments', label: 'Chat' },
      { to: '/guru/tugas', icon: 'fa fa-clipboard-list', label: 'Data Tugas' },
      { to: '/guru/absensi', icon: 'fa fa-user-check', label: 'Data Absensi' },
      { to: '/guru/rekap', icon: 'fa fa-chart-bar', label: 'Data Rekap' },
    ];
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-2 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Close button for mobile */}
          <div className="flex justify-end lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-2"
            >
              <i className="fa fa-times text-xl"></i>
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
                  className={`flex items-center px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                    location.pathname === item.to 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg"><i className={item.icon} /></span>
                  <span className="text-sm lg:text-base">{item.label}</span>
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
      <Footer />
    </div>
  );
};

export default Layout; 