import React, { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
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
  const [showModal, setShowModal] = useState(false);
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
      const res = await fetch('http://localhost:3000/api/institusi', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setInstitusiData(Array.isArray(json) ? json : []);
    } catch {
      setInstitusiData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Yakin ingin menghapus institusi ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/institusi/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setNotif('Institusi berhasil dihapus!');
        handleRefresh();
        setTimeout(() => setNotif(null), 2000);
      } else {
        setNotif(json.message || 'Gagal menghapus institusi');
      }
    } catch {
      setNotif('Gagal menghapus institusi');
    }
  };

  useEffect(() => {
    const fetchInstitusi = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/institusi', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Gagal mengambil data institusi');
        const json = await res.json();
        setInstitusiData(Array.isArray(json) ? json : []);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
        setInstitusiData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInstitusi();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-3 mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Data Institusi
            </h1>
          </div>
          <p className="text-gray-400 mt-1 ml-5">Daftar institusi yang terdaftar di sistem.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div></div>
          <div className="flex gap-2 items-center">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center" onClick={handleRefresh}>
              <span className="mr-1">⟳</span> Refresh
            </button>
            <button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded flex items-center" onClick={() => setShowModal(true)}>
              <span className="mr-1">＋</span> Tambah Institusi
            </button>
          </div>
        </div>
        <Divider />
        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg mt-0 shadow-lg border border-gray-800">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-400">{error}</div>
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
                    key={row.id}
                    className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/70'} hover:bg-blue-950/60`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-blue-400 font-bold text-center">{idx + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-semibold text-white">{row.nama_institusi}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-300 font-medium">{row.alamat}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-400 text-xs font-mono">{new Date(row.created_at).toLocaleString('id-ID')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      <button type="button" onClick={() => handleDelete(row.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
              <h2 className="text-2xl font-bold mb-4 text-white">Tambah Institusi</h2>
              <form className="space-y-4" onSubmit={async e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new URLSearchParams();
                fd.append('nama_institusi', (form.nama_institusi as any).value);
                fd.append('alamat', (form.alamat as any).value);
                setNotif(null);
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('http://localhost:3000/api/institusi/create', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: fd.toString(),
                  });
                  const json = await res.json();
                  if (res.ok) {
                    setNotif('Institusi berhasil ditambahkan!');
                    setShowModal(false);
                    handleRefresh();
                    setTimeout(() => setNotif(null), 2000);
                  } else {
                    setNotif(json.message || 'Gagal menambah institusi');
                  }
                } catch {
                  setNotif('Gagal menambah institusi');
                }
              }}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nama Institusi</label>
                    <input name="nama_institusi" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Alamat</label>
                    <input name="alamat" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Simpan</button>
                {notif && <div className="mt-2 text-center text-sm text-green-400">{notif}</div>}
              </form>
            </div>
          </div>
        )}
        <Divider />
      </div>
    </Layout>
  );
};

export default Institusi;
