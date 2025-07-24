import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [nama, setNama] = useState<string>('User');

  useEffect(() => {
    const updateNama = () => {
      const storedNama = localStorage.getItem('nama');
      setNama(storedNama || 'User');
    };
    updateNama();
    window.addEventListener('storage', updateNama);
    return () => window.removeEventListener('storage', updateNama);
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
      <div className="flex items-center space-x-2" ref={dropdownRef}>
        <div
          className="bg-gray-800 px-2 py-1 rounded text-white flex items-center space-x-2 cursor-pointer relative min-w-[140px] justify-between text-base"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-lg"><i className="fa fa-user-circle" /></span>
          <span className="flex-1 text-center font-semibold truncate">{nama}</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-[#232834] rounded shadow-lg z-50 border border-gray-700 py-2 flex flex-col gap-1">
              <button
                className="w-full text-left px-6 py-3 text-white hover:bg-gray-700 text-lg rounded"
                onClick={() => { setOpen(false); navigate('/ProfileSiswa'); }}
              >
                Profile
              </button>
              <button
                className="w-full text-left px-6 py-3 text-white hover:bg-gray-700 text-lg rounded"
                onClick={() => { setOpen(false); navigate('/Login'); }}
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