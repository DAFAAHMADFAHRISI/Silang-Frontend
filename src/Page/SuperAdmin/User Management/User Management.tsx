import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Divider: React.FC = () => <div className="border-t border-gray-700/50 my-8 w-full" />;

interface UserRow {
  id?: number;
  user_id?: number;
  _id?: number;
  nama: string;
  email: string;
  kelamin: string;
  no_hp: string;
  role: string;
  asal_institusi: string;
  created_at: string;
  updated_at: string;
}

const UserManagement: React.FC = () => {
  const [userData, setUserData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState<string>('superadmin');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Map role tab ke endpoint superadmin baru
        const rolePath = activeTab === 'superadmin' ? 'superadmin' : activeTab; // sudah sama namanya
        const apiUrl = `http://localhost:3000/api/superadmin/users/role/${rolePath}`;
        
        console.log('Fetching users from:', apiUrl);
        
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });
        
        const json = await res.json();
        console.log('=== API RESPONSE DEBUG ===');
        console.log('Response status:', res.status);
        console.log('Response URL:', apiUrl);
        console.log('Full API response:', json);
        console.log('Type of response:', typeof json);
        console.log('Is array:', Array.isArray(json));
        console.log('Length:', Array.isArray(json) ? json.length : 0);
        
        if (Array.isArray(json) && json.length > 0) {
          console.log('=== FIRST USER DETAILED DEBUG ===');
          console.log('First user:', json[0]);
          console.log('All keys in first user:', Object.keys(json[0]));
          console.log('All values in first user:', Object.values(json[0]));
          console.log('First user stringified:', JSON.stringify(json[0], null, 2));
        }
        
        setUserData(Array.isArray(json) ? json : []);
        
        // Debug: Log all users and their roles
        if (Array.isArray(json)) {
          console.log('=== ALL USERS DEBUG ===');
          json.forEach((user, index) => {
            console.log(`User ${index + 1}:`, {
              nama: user.nama,
              email: user.email,
              role: user.role,
              roleType: typeof user.role,
              roleNull: user.role === null,
              roleUndefined: user.role === undefined,
              roleEmpty: user.role === '',
              roleStringNull: user.role === 'null',
              roleStringNULL: user.role === 'NULL'
            });
          });
          
          // Check for unverified users
          const unverifiedUsers = json.filter(user => {
            const role = user.role;
            return !role || 
                   role === '' || 
                   role === 'null' || 
                   role === 'NULL' || 
                   role === 'undefined' || 
                   role === 'Undefined' ||
                   role === null ||
                   role === undefined ||
                   (typeof role === 'string' && role.trim() === '');
          });
          console.log('=== UNVERIFIED USERS COUNT ===', unverifiedUsers.length);
          console.log('Unverified users:', unverifiedUsers);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setUserData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [activeTab]);

  const handleDelete = async (identifier?: number | string) => {
    console.log('handleDelete called with identifier:', identifier);
    console.log('Identifier type:', typeof identifier);
    console.log('Current active tab:', activeTab);
    
    if (!identifier) {
      console.log('Invalid identifier detected:', identifier);
      setNotif('Identifier user tidak valid');
      return;
    }
    
    if (!window.confirm('Yakin ingin menghapus user ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const rolePath = activeTab === 'superadmin' ? 'superadmin' : activeTab;

      // Bangun URL delete sesuai spesifikasi
      let deleteUrl = '';
      let secondTryUrl = '';

      if (typeof identifier === 'number') {
        deleteUrl = `http://localhost:3000/api/superadmin/users/${identifier}`; // fallback by ID
      } else {
        const emailEncoded = encodeURIComponent(String(identifier));
        // Path style
        deleteUrl = `http://localhost:3000/api/superadmin/users/role/${rolePath}/delete/${emailEncoded}`;
        // Query style (fallback)
        secondTryUrl = `http://localhost:3000/api/superadmin/users/role/${rolePath}/delete?email=${emailEncoded}`;
      }
      
      console.log('Sending DELETE request to:', deleteUrl);
      
      let res = await fetch(deleteUrl, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'same-origin',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (!res.ok && secondTryUrl) {
        console.log('First delete failed with status', res.status, '- trying fallback URL:', secondTryUrl);
        res = await fetch(secondTryUrl, {
          method: 'DELETE',
          mode: 'cors',
          credentials: 'same-origin',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });
      }
      
      console.log('Delete response status:', res.status);
      console.log('Delete response ok:', res.ok);
      
      let json: any;
      try {
        json = await res.json();
        console.log('Delete response JSON:', json);
      } catch (parseError) {
        const text = await res.text();
        console.log('Delete response text:', text);
        json = { message: text };
      }
      
      if (res.ok) {
        setNotif('User berhasil dihapus!');
        // Refresh list
        const refreshUrl = `http://localhost:3000/api/superadmin/users/role/${rolePath}`;
        const res2 = await fetch(refreshUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const json2 = await res2.json();
        setUserData(Array.isArray(json2) ? json2 : []);
        setTimeout(() => setNotif(null), 1500);
      } else {
        setNotif(json.message || 'Gagal menghapus user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      console.error('Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setNotif('Gagal menghapus user');
    }
  };

  // Filter users based on active tab
  const getFilteredUsers = () => {
    let filteredByRole;
    switch (activeTab) {
      case 'superadmin':
        filteredByRole = userData.filter(user => user.role && (user.role.toLowerCase() === 'superadmin' || user.role === '1'));
        break;
      case 'mentor':
        filteredByRole = userData.filter(user => user.role && (user.role.toLowerCase() === 'mentor' || user.role === '3'));
        break;
      case 'guru':
        filteredByRole = userData.filter(user => user.role && (user.role.toLowerCase() === 'guru' || user.role === '4'));
        break;
      case 'siswa':
        filteredByRole = userData.filter(user => user.role && (user.role.toLowerCase() === 'siswa' || user.role === '5'));
        break;
      case 'belum_diverifikasi':
        // More comprehensive filtering for unverified users
        filteredByRole = userData.filter(user => {
          const role = user.role;
          return !role || 
                 role === '' || 
                 role === 'null' || 
                 role === 'NULL' || 
                 role === 'undefined' || 
                 role === 'Undefined' ||
                 role === null ||
                 role === undefined ||
                 (typeof role === 'string' && role.trim() === '');
        });
        break;
      default:
        filteredByRole = userData;
    }

    // Apply search filter on the role-filtered data
    if (searchTerm.trim() === '') {
      return filteredByRole;
    }

    const searchLower = searchTerm.toLowerCase();
    return filteredByRole.filter(user => 
      (user.nama && user.nama.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.no_hp && user.no_hp.toLowerCase().includes(searchLower)) ||
      (user.asal_institusi && user.asal_institusi.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower)) ||
      (user.kelamin && user.kelamin.toLowerCase().includes(searchLower))
    );
  };

  const filteredUsers = getFilteredUsers();

  const tabs = [
    { id: 'superadmin', label: 'Superadmin', count: userData.filter(u => u.role && u.role.toLowerCase() === 'superadmin' || u.role === '1').length },
    { id: 'mentor', label: 'Mentor', count: userData.filter(u => u.role && u.role.toLowerCase() === 'mentor' || u.role === '3').length },
    { id: 'guru', label: 'Guru', count: userData.filter(u => u.role && u.role.toLowerCase() === 'guru' || u.role === '4').length },
    { id: 'siswa', label: 'Siswa', count: userData.filter(u => u.role && u.role.toLowerCase() === 'siswa' || u.role === '5').length },
    { id: 'belum_diverifikasi', label: 'Belum Diverifikasi', count: userData.filter(u => {
      const role = u.role;
      return !role || 
             role === '' || 
             role === 'null' || 
             role === 'NULL' || 
             role === 'undefined' || 
             role === 'Undefined' ||
             role === null ||
             role === undefined ||
             (typeof role === 'string' && role.trim() === '');
    }).length },
  ];

  // Clear search when changing tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchTerm('');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-3 mt-0">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            User Management
          </h1>
        </div>
        <p className="text-gray-400 mt-1 ml-5">Daftar user sistem berdasarkan role.</p>
      </div>
      <Divider />
      
      {/* Role Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? tab.id === 'belum_diverifikasi' 
                  ? 'bg-yellow-600 text-white shadow-lg'
                  : 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              type="text"
              placeholder={`Search ${tabs.find(tab => tab.id === activeTab)?.label}...`}
              className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none border border-gray-700 w-full md:w-64 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center" onClick={() => navigate('/UserManagement/tambah')}>
            <span className="mr-1">＋</span> Tambah User
          </button>
        </div>
      </div>
      <Divider />
      
      {/* Notification */}
      {notif && (
        <div className="mb-4 p-3 rounded text-center text-sm">
          <span className={notif.includes('berhasil') ? 'text-green-400' : 'text-red-400'}>
            {notif}
          </span>
        </div>
      )}

      {/* Active Tab Info */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white capitalize">
          {tabs.find(tab => tab.id === activeTab)?.label} - {filteredUsers.length} User
        </h3>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-lg mt-0 shadow-lg border border-gray-800">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-10 text-red-400">
            Tidak ada data user untuk role {tabs.find(tab => tab.id === activeTab)?.label}.
          </div>
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
                {activeTab !== 'superadmin' && (
                  <th className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((row, idx) => {
                // Prioritas identifier: id → email → index
                const userId: number | null = (row as any)?.id ?? null;
                const identifier = userId ?? row.email ?? `index_${idx}`;
                
                return (
                  <tr
                    key={identifier}
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
                        !row.role || row.role === '' || row.role === 'null' || row.role === 'NULL' || row.role === 'undefined' || row.role === 'Undefined' || row.role === null || row.role === undefined || (typeof row.role === 'string' && row.role.trim() === '')
                          ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                        row.role === 'superadmin' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                        row.role === 'mentor' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                        row.role === 'guru' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                        row.role === 'siswa' ? 'bg-gray-500/20 text-gray-300 border-gray-400/30' :
                        'bg-gray-700/30 text-gray-300 border-gray-500/30'
                      }`}>
                        {!row.role || row.role === '' || row.role === 'null' || row.role === 'NULL' || row.role === 'undefined' || row.role === 'Undefined' || row.role === null || row.role === undefined || (typeof row.role === 'string' && row.role.trim() === '') ? 'Belum Diverifikasi' : row.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-300 font-medium">{row.asal_institusi}</td>
                    {activeTab !== 'superadmin' && (
                      <td className="px-3 py-2 whitespace-nowrap text-center">
                        <button 
                          type="button" 
                          onClick={() => {
                            handleDelete(identifier);
                          }} 
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-bold shadow-sm mr-1"
                        >
                          Hapus
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            if (userId) {
                              navigate(`/UserManagement/edit/${userId}`);
                            } else {
                              setNotif('ID user tidak tersedia untuk edit');
                            }
                          }} 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-bold shadow-sm"
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
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

export default UserManagement;

