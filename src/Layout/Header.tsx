import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [nama, setNama] = useState<string>('User');
  const [role, setRole] = useState<string>('');
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.body;
    if (theme === 'light') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    const updateUserData = () => {
      const storedNama = localStorage.getItem('nama');
      const storedRole = localStorage.getItem('role');
      setNama(storedNama || 'User');
      setRole(storedRole || '');
    };
    updateUserData();
    window.addEventListener('storage', updateUserData);
    return () => window.removeEventListener('storage', updateUserData);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <header className="w-full h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-300 hover:text-white p-2 mr-2"
      >
        <i className="fa fa-bars text-xl"></i>
      </button>

      {/* Logo and App Name */}
      <div className="flex items-center space-x-2 flex-1 lg:flex-none">
        <img
          src="/LogoKominfo.png"
          alt="Logo Kominfo"
          className="w-8 h-8 object-contain rounded-full"
        />
        <span className="text-lg lg:text-xl font-bold text-white tracking-wide">SILANG</span>
        {/* Toggle Theme Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-full hover:bg-gray-800 dark-toggle-btn text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none flex items-center justify-center"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M17.636 17.636l.707-.707M6.364 4.364l.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* User Profile */}
      <div className="flex items-center space-x-2" ref={dropdownRef}>
        <div
          className="bg-gray-800 px-2 py-1 rounded text-white flex items-center space-x-2 cursor-pointer relative min-w-[120px] lg:min-w-[140px] justify-between text-sm lg:text-base"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-base lg:text-lg shrink-0"><i className="fa fa-user-circle" /></span>
          <span className="flex-1 text-center font-semibold truncate max-w-[80px] sm:max-w-[150px] lg:max-w-[200px]">{nama}</span>
          <svg className="w-3 h-3 lg:w-4 lg:h-4 ml-1 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-48 lg:w-60 bg-[#232834] rounded shadow-lg z-50 border border-gray-700 py-2 flex flex-col gap-1">
              {role === 'siswa' && (
                <button
                  className="w-full text-left px-4 lg:px-6 py-1 text-white hover:bg-gray-700 text-sm lg:text-base rounded font-semibold"
                  onClick={() => { setOpen(false); navigate('/ProfileSiswa'); }}
                >
                  Profile
                </button>
              )}
              {/* {role === 'guru' && (
                <button
                  className="w-full text-left px-4 lg:px-6 py-1 text-white hover:bg-gray-700 text-sm lg:text-base rounded font-semibold"
                  onClick={() => { setOpen(false); navigate('/Guru/Profile'); }}
                >
                  Profile
                </button>
              )}
              {role === 'mentor' && (
                <button
                  className="w-full text-left px-4 lg:px-6 py-1 text-white hover:bg-gray-700 text-sm lg:text-base rounded font-semibold"
                  onClick={() => { setOpen(false); navigate('/Mentor/Profile'); }}
                >
                  Profile
                </button>
              )} */}
              <button
                className="w-full text-left px-4 lg:px-6 py-1 text-white hover:bg-gray-700 text-sm lg:text-base rounded font-semibold"
                onClick={() => {
                  setOpen(false);
                  localStorage.removeItem('token');
                  localStorage.removeItem('nama');
                  localStorage.removeItem('role');
                  // Hapus data lain jika perlu
                  navigate('/Login');
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 