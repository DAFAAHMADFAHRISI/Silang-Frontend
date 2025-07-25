import React, { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

interface UserRow {
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  // Fetch detail user jika selectedId berubah
  useEffect(() => {
    if (selectedId === null) return;
    const fetchDetail = async () => {
      setLoadingDetail(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/users/${selectedId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        setDetail(json);
      } catch (err) {
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetchDetail();
  }, [selectedId]);

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
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center">
              <span className="mr-1">⟳</span> Refresh
            </button>
            <button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded flex items-center">
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
                </tr>
              </thead>
              <tbody>
                {userData.map((row, idx) => (
                  <tr
                    key={idx}
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* User Detail Section */}
        {selectedId && (
          <div className="mt-6 flex justify-center">
            <div className="w-full max-w-xl bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
              {loadingDetail ? (
                <div className="text-center text-gray-400">Loading detail...</div>
              ) : detail ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-lg text-lg font-bold">ID #{detail.id}</span>
                    <span>{detail.nama}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                    <div>
                      <div className="text-xs text-gray-400">Email</div>
                      <div className="font-semibold text-white">{detail.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">No HP</div>
                      <div className="font-semibold text-white">{detail.no_hp}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Kelamin</div>
                      <div className="font-semibold text-white capitalize">{detail.kelamin}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Role</div>
                      <div className="font-semibold text-white capitalize">{detail.role}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Asal Institusi</div>
                      <div className="font-semibold text-white">{detail.asal_institusi_id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Created At</div>
                      <div className="font-semibold text-white">{new Date(detail.created_at).toLocaleString('id-ID')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Updated At</div>
                      <div className="font-semibold text-white">{new Date(detail.updated_at).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-red-400">Gagal mengambil detail user.</div>
              )}
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
