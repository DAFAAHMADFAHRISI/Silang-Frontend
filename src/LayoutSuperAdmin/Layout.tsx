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
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-2 overflow-y-auto">
          <nav className="flex flex-col space-y-2">
            <Link
              to="/DashboardSuperAdmin"
              className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === '/DashboardSuperAdmin' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3"><i className="fa fa-columns" /></span>
              Dashboard
            </Link>
            <Link
              to="/UserManagement"
              className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === '/UserManagement' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3"><i className="fa fa-users-cog" /></span>
              User Management
            </Link>
            <Link
              to="/DataInstitusi"
              className={`flex items-center px-4 py-2 rounded font-semibold ${location.pathname === '/DataInstitusi' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <span className="mr-3"><i className="fa fa-university" /></span>
              Data Institusi
            </Link>
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
