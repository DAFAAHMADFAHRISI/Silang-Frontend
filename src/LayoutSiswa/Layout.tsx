import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-2">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/DashboardSiswa"
              className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === '/DashboardSiswa' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3"><i className="fa fa-columns" /></span>
              Dashboard
            </Link>
            <Link
              to="/TodoSiswa"
              className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === '/TodoSiswa' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3"><i className="fa fa-tasks" /></span>
              To Do
            </Link>
            <Link
              to="/AttendanceSiswa"
              className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === '/AttendanceSiswa' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3"><i className="fa fa-calendar-check" /></span>
              Attendance
            </Link>
            <Link
              to="/ReportSiswa"
              className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === '/ReportSiswa' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3"><i className="fa fa-file-alt" /></span>
              Report
            </Link>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 