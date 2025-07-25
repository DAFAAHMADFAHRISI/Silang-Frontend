import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  // Ambil role dari localStorage
  const role = localStorage.getItem('role');

  // Menu berdasarkan role
  let menuItems: { to: string; icon: string; label: string }[] = [];
  if (role === 'superadmin') {
    menuItems = [
      { to: '/DashboardSuperAdmin', icon: 'fa fa-columns', label: 'Dashboard' },
      { to: '/Institusi', icon: 'fa fa-university', label: 'Data Institusi' },
      { to: '/UserManagement', icon: 'fa fa-users-cog', label: 'User Management' },
    ];
  } else if (role === 'siswa') {
    menuItems = [
      { to: '/DashboardSiswa', icon: 'fa fa-columns', label: 'Dashboard' },
      { to: '/TodoSiswa', icon: 'fa fa-tasks', label: 'To Do' },
      { to: '/AttendanceSiswa', icon: 'fa fa-calendar-check', label: 'Attendance' },
      { to: '/ReportSiswa', icon: 'fa fa-file-alt', label: 'Report' },
    ];
  } else if (role === 'mentor') {
    menuItems = [
      { to: '/DashboardMentor', icon: 'fa fa-columns', label: 'Dashboard' },
    ];
  } else if (role === 'guru') {
    menuItems = [
      { to: '/DashboardGuru', icon: 'fa fa-columns', label: 'Dashboard' },
    ];
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-2 overflow-y-auto">
          <nav className="flex flex-col space-y-2">
            {menuItems.length === 0 ? (
              <div className="text-gray-500 text-center">No menu available</div>
            ) : (
              menuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === item.to ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  <span className="mr-3"><i className={item.icon} /></span>
                  {item.label}
                </Link>
              ))
            )}
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 