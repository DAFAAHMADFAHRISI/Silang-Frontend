import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      {/* Logo and App Name */}
      <div className="flex items-center space-x-2">
        <img
          src="/LogoKominfo.png"
          alt="Logo Kominfo"
          className="w-8 h-8 object-contain rounded-full"
        />
        <span className="text-xl font-bold text-white tracking-wide">SILANG</span>
      </div>
      {/* User Profile */}
      <div className="flex items-center space-x-2">
        <div className="bg-gray-800 px-4 py-2 rounded text-white flex items-center space-x-2">
          <span className="text-lg"><i className="fa fa-user-circle" /></span>
          <span>Dafa Ahmad Fahrisi</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </header>
  );
};

export default Header; 