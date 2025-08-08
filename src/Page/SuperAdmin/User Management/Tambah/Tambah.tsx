import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface InstitusiRow {
  id: number;
  nama_institusi: string;
}

const Tambah: React.FC = () => {
  const [notif, setNotif] = useState<string | null>(null);
  const [institusiList, setInstitusiList] = useState<InstitusiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to convert role string to number
  const getRoleValue = (role: string) => {
    if (!role) return '3'; // Default to mentor if no role
    const roleLower = role.toLowerCase();
    switch (roleLower) {
      case 'superadmin':
      case '1':
        return '1';
      case 'mentor':
      case '3':
        return '3';
      case 'guru':
      case '4':
        return '4';
      case 'siswa':
      case '5':
        return '5';
      default:
        return '3'; // Default to mentor
    }
  };

  // Helper function to convert kelamin string to number
  const getKelaminValue = (kelamin: string) => {
    if (!kelamin) return '1'; // Default to laki-laki if no kelamin
    const kelaminLower = kelamin.toLowerCase();
    switch (kelaminLower) {
      case 'laki-laki':
      case 'laki laki':
      case '1':
        return '1';
      case 'perempuan':
      case '2':
        return '2';
      default:
        return '1'; // Default to laki-laki
    }
  };

  // Fetch institusi list for dropdown
  useEffect(() => {
    const fetchInstitusi = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/institusi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        setInstitusiList(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error('Error fetching institusi:', error);
      }
    };
    fetchInstitusi();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotif(null);
    
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      // Ensure role is sent as numeric value
      const roleValue = formData.get('role');
      if (roleValue) {
        formData.set('role', getRoleValue(roleValue.toString()));
        console.log('Role value being sent:', getRoleValue(roleValue.toString()));
      } else {
        // If no role selected, use default
        formData.set('role', '3');
        console.log('Using default role value: 3');
      }
      
      // Ensure kelamin is sent as numeric value
      const kelaminValue = formData.get('kelamin');
      if (kelaminValue) {
        formData.set('kelamin', getKelaminValue(kelaminValue.toString()));
        console.log('Kelamin value being sent:', getKelaminValue(kelaminValue.toString()));
      } else {
        // If no kelamin selected, use default
        formData.set('kelamin', '1');
        console.log('Using default kelamin value: 1');
      }
      
      // Ensure asal_institusi_id is set correctly
      const asalInstitusiValue = formData.get('asal_institusi_id');
      if (!asalInstitusiValue) {
        setNotif('Pilih institusi terlebih dahulu');
        setLoading(false);
        return;
      }
      
      // Log all form data for debugging
      console.log('All form data being sent:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(key, ':', value);
      });
      
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData, // Using FormData for file upload
      });
      
      const json = await res.json();
      if (res.ok) {
        setNotif('User berhasil ditambahkan!');
        setTimeout(() => {
          navigate('/UserManagement');
        }, 2000);
      } else {
        setNotif(json.message || 'Gagal menambah user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setNotif(error instanceof Error ? error.message : 'Gagal menambah user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Tambah User
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Tambah user baru ke sistem.</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
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
                <option value="3">Mentor</option>
                <option value="4">Guru</option>
                <option value="5">Siswa</option>
                <option value="1">Superadmin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kelamin</label>
              <select name="kelamin" required className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white">
                <option value="1">Laki-laki</option>
                <option value="2">Perempuan</option>
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
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/UserManagement')}
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
