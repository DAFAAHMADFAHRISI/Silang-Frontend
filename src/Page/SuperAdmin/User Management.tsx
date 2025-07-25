import React, { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import Institusi from './Institusi';

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

interface UserRow {
  id?: number;
  nama: string;
  email: string;
  kelamin: string;
  no_hp: string;
  role: string;
  asal_institusi: string;
  created_at: string;
  updated_at: string;
}

interface UserDetail {
  id: number;
  nama: string;
  email: string;
  kelamin: string;
  no_hp: string;
  role: string;
  asal_institusi_id: number;
  created_at: string;
  updated_at: string;
}

const UserManagement: React.FC = () => {
  const [userData, setUserData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [institusiList, setInstitusiList] = useState<{id:number, nama_institusi:string}[]>([]);
  const [notif, setNotif] = useState<string|null>(null);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setNotif('User berhasil dihapus!');
        // Refresh user table
        const res2 = await fetch('http://localhost:3000/api/users', { headers: { Authorization: `Bearer ${token}` } });
        const json2 = await res2.json();
        setUserData(Array.isArray(json2) ? json2 : []);
        setTimeout(() => setNotif(null), 2000);
      } else {
        setNotif(json.message || 'Gagal menghapus user');
      }
    } catch {
      setNotif('Gagal menghapus user');
    }
  };

  // Tambahkan fungsi handleRefresh
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setUserData(Array.isArray(json) ? json : []);
    } catch {
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch institusi list for dropdown
  useEffect(() => {
    if (!showModal) return;
    const fetchInstitusi = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/institusi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setInstitusiList(Array.isArray(json) ? json : []);
      } catch {}
    };
    fetchInstitusi();
  }, [showModal]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        setUserData(Array.isArray(json) ? json : []);
      } catch (err) {
        setUserData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-3 mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              User Management
            </h1>
          </div>
          <p className="text-gray-400 mt-1 ml-5">Daftar user sistem.</p>
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
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center" onClick={handleRefresh}>
              <span className="mr-1">⟳</span> Refresh
            </button>
            <button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded flex items-center" onClick={() => setShowModal(true)}>
              <span className="mr-1">＋</span> Tambah User
            </button>
          </div>
        </div>
        <Divider />
        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg mt-0 shadow-lg border border-gray-800">
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : userData.length === 0 ? (
            <div className="text-center py-10 text-red-400">Tidak ada data user.</div>
          ) : (
            <table className="min-w-full bg-gray-900 text-white text-sm">
              <thead className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur border-b border-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">No</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Nama</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Kelamin</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">No HP</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Role</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Asal Institusi</th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Created At</th>
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {userData.map((row, idx) => (
                  <tr
                    key={row.id ?? idx}
                    className={
                      `transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800/70'} hover:bg-blue-950/60`
                    }
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-blue-400 font-bold text-center">{idx + 1}</td>
                    <td className="px-3 py-2 whitespace-nowrap font-semibold text-white">{row.nama}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-300">{row.email}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold shadow-sm ${
                        row.kelamin === 'laki-laki' 
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' 
                          : 'bg-pink-500/20 text-pink-300 border border-pink-400/30'
                      }`}>
                        {row.kelamin}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-300">{row.no_hp}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold shadow-sm border ${
                        row.role === 'superadmin' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                        row.role === 'mentor' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                        row.role === 'guru' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                        row.role === 'siswa' ? 'bg-gray-500/20 text-gray-300 border-gray-400/30' :
                        'bg-gray-700/30 text-gray-300 border-gray-500/30'
                      }`}>
                        {row.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-300 font-medium">{row.asal_institusi}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-400 text-xs font-mono">{new Date(row.created_at).toLocaleString('id-ID')}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-center">
                      {typeof row.id !== 'undefined' ? (
                        <button type="button" onClick={() => handleDelete(row.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                          Hapus
                        </button>
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
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-lg border border-gray-700 relative">
              <button onClick={() => setShowModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl">&times;</button>
              <h2 className="text-2xl font-bold mb-4 text-white">Tambah User</h2>
              <form className="space-y-4" onSubmit={async e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fd = new FormData(form);
                setNotif(null);
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch('http://localhost:3000/api/users/create', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd,
                  });
                  const json = await res.json();
                  if (res.ok) {
                    setNotif('User berhasil ditambahkan!');
                    setShowModal(false);
                    // Refresh user table
                    setTimeout(() => setNotif(null), 2000);
                    // Re-fetch user data
                    const res2 = await fetch('http://localhost:3000/api/users', { headers: { Authorization: `Bearer ${token}` } });
                    const json2 = await res2.json();
                    setUserData(Array.isArray(json2) ? json2 : []);
                  } else {
                    setNotif(json.message || 'Gagal menambah user');
                  }
                } catch {
                  setNotif('Gagal menambah user');
                }
              }} encType="multipart/form-data">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nama</label>
                    <input name="nama" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Email</label>
                    <input name="email" type="email" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">No HP</label>
                    <input name="no_hp" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Role</label>
                    <select name="role" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white">
                      <option value="mentor">Mentor</option>
                      <option value="guru">Guru</option>
                      <option value="siswa">Siswa</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Kelamin</label>
                    <select name="kelamin" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white">
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Foto Profile</label>
                    <input name="foto_profile" type="file" accept="image/*" className="w-full text-gray-300" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-gray-300 mb-1">Asal Institusi</label>
                    <select name="asal_institusi_id" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white">
                      <option value="">Pilih Institusi</option>
                      {institusiList.map(i => (
                        <option key={i.id} value={i.id}>{i.nama_institusi}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Simpan</button>
                {notif && <div className="mt-2 text-center text-sm text-green-400">{notif}</div>}
              </form>
            </div>
          </div>
        )}
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
    </Layout>
  );
};

export default UserManagement;
