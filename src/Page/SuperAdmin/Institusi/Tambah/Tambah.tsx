import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Tambah: React.FC = () => {
  const [notif, setNotif] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const urlEncodedData = new URLSearchParams();
    
    // Convert FormData to URLSearchParams for x-www-form-urlencoded
    Array.from(formData.entries()).forEach(([key, value]) => {
      urlEncodedData.append(key, value.toString());
    });
    
    setNotif(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/institusi/create', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncodedData.toString(),
      });
      const json = await res.json();
      if (res.ok) {
        setNotif('Institusi berhasil ditambahkan!');
        setTimeout(() => {
          navigate('/Institusi');
        }, 2000);
      } else {
        setNotif(json.message || 'Gagal menambah institusi');
      }
    } catch (error) {
      console.error('Error creating institusi:', error);
      setNotif(error instanceof Error ? error.message : 'Gagal menambah institusi');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Tambah Institusi
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Tambah institusi baru ke sistem.</p>
      </div>

      {/* Form */}
      <div className="max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nama Institusi</label>
              <input name="nama_institusi" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Alamat</label>
              <textarea name="alamat" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" rows={3} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Simpan
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/Institusi')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Kembali
            </button>
          </div>
          {notif && <div className="mt-2 text-center text-sm text-green-400">{notif}</div>}
        </form>
      </div>
    </div>
  );
};

export default Tambah;
