import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

interface InstitusiRow {
  id: number;
  nama_institusi: string;
  alamat: string;
  created_at: string;
  updated_at: string;
}

const Institusi: React.FC = () => {
  const [institusiData, setInstitusiData] = useState<InstitusiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notif, setNotif] = useState<string|null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Proteksi: redirect jika tidak ada token
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/Login');
      return;
    }
  }, [navigate]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      const res = await fetch('http://localhost:3000/api/institusi', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      setInstitusiData(Array.isArray(json) ? json : []);
    } catch (error) {
      console.error('Error fetching institusi data:', error);
      setInstitusiData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus institusi ini?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setNotif('Token tidak ditemukan');
        return;
      }
      
      const res = await fetch(`http://localhost:3000/api/institusi/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      
      const json = await res.json();
      setNotif('Institusi berhasil dihapus!');
      handleRefresh();
      setTimeout(() => setNotif(null), 2000);
    } catch (error) {
      console.error('Error deleting institusi:', error);
      setNotif(error instanceof Error ? error.message : 'Gagal menghapus institusi');
    }
  };

  useEffect(() => {
    const fetchInstitusi = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token tidak ditemukan');
        }
        
        const res = await fetch('http://localhost:3000/api/institusi', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        setInstitusiData(Array.isArray(json) ? json : []);
      } catch (err: any) {
        console.error('Error fetching institusi:', err);
        setError(err.message || 'Terjadi kesalahan saat mengambil data institusi');
        setInstitusiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitusi();
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Data Institusi
          </h1>
        </div>
        <p className="text-gray-400 mt-1 ml-5">Daftar institusi yang terdaftar.</p>
      </div>
      <Divider />
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none border border-gray-700 w-full md:w-64"
        />
        <div className="flex gap-2 items-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center" onClick={() => navigate('/Institusi/tambah')}>
            <span className="mr-1">＋</span> Tambah Institusi
          </button>
        </div>
      </div>
      <Divider />
      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg mt-0 shadow-lg border border-gray-800">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : institusiData.length === 0 ? (
          <div className="text-center py-10 text-red-400">Tidak ada data institusi.</div>
        ) : (
          <table className="min-w-full bg-gray-900 text-white text-sm">
            <thead className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur border-b border-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">No</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Nama Institusi</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Alamat</th>
                <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Created At</th>
                <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {institusiData.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className={
                    `transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/70'} hover:bg-blue-950/60`
                  }
                >
                  <td className="px-3 py-2 whitespace-nowrap text-blue-400 font-bold text-center">{idx + 1}</td>
                  <td className="px-3 py-2 whitespace-nowrap font-semibold text-white">{row.nama_institusi}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-300">{row.alamat}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-400 text-xs font-mono">{new Date(row.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {typeof row.id !== 'undefined' ? (
                      <>
                        <button type="button" onClick={() => handleDelete(row.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold shadow-sm mr-1">
                          Hapus
                        </button>
                        <button type="button" onClick={() => {
                          navigate(`/Institusi/edit/${row.id}`);
                        }} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                          Edit
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Divider />
      {/* Footer Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="text-white">Rows:</span>
          <select className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700">
            <option>10</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-gray-800 text-gray-400 px-3 py-2 rounded" disabled>{'<<'}</button>
          <span className="text-white">Page 1 of 1</span>
          <button className="bg-gray-800 text-gray-400 px-3 py-2 rounded" disabled>{'>>'}</button>
        </div>
      </div>
    </div>
  );
};

export default Institusi;