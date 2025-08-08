import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface UserRow {
  id: number;
  nama?: string;
  email?: string;
  kelamin?: string;
  no_hp?: string;
  role?: string;
  asal_institusi?: string;
  created_at?: string;
  updated_at?: string;
}

interface InstitusiRow {
  id: number;
  nama_institusi: string;
}

const Edit: React.FC = () => {
  const [notif, setNotif] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [institusiList, setInstitusiList] = useState<InstitusiRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('Fetched user data:', data);
          setEditingUser(data);
        } else {
          console.error('Failed to fetch user:', res.status, res.statusText);
          setNotif('Gagal mengambil data user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setNotif('Gagal mengambil data user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Fetch institusi list for dropdown
  useEffect(() => {
    const fetchInstitusi = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:3000/api/institusi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        console.log('Fetched institusi list:', json);
        setInstitusiList(Array.isArray(json) ? json : []);
        
        // After setting institusi list, check if we can match with current user
        if (editingUser && Array.isArray(json)) {
          const currentInstitusi = json.find(i => i.nama_institusi === editingUser.asal_institusi);
          console.log('After loading institusi, current user institusi match:', currentInstitusi);
        }
      } catch (error) {
        console.error('Error fetching institusi:', error);
      }
    };
    fetchInstitusi();
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    setNotif(null);
    
    try {
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      // Ensure role is sent as numeric value
      const roleValue = formData.get('role');
      if (roleValue) {
        formData.set('role', roleValue.toString());
        console.log('Role value being sent:', roleValue.toString());
      } else {
        // If no role selected, use default
        formData.set('role', '3');
        console.log('Using default role value: 3');
      }
      
      // Ensure kelamin is sent as numeric value
      const kelaminValue = formData.get('kelamin');
      if (kelaminValue) {
        formData.set('kelamin', kelaminValue.toString());
        console.log('Kelamin value being sent:', kelaminValue.toString());
      } else {
        // If no kelamin selected, use default
        formData.set('kelamin', '1');
        console.log('Using default kelamin value: 1');
      }
      
      // Ensure asal_institusi_id is set correctly
      const asalInstitusiValue = formData.get('asal_institusi_id');
      console.log('Form asal_institusi_id value:', asalInstitusiValue);
      
      if (!asalInstitusiValue) {
        // If not set, try to find the institusi ID from the current user data
        const currentInstitusi = institusiList.find(i => i.nama_institusi === (editingUser.asal_institusi || ''));
        console.log('Looking for institusi:', editingUser.asal_institusi);
        console.log('Found institusi:', currentInstitusi);
        
        if (currentInstitusi) {
          formData.set('asal_institusi_id', currentInstitusi.id.toString());
          console.log('Setting asal_institusi_id to:', currentInstitusi.id.toString());
        } else {
          // If no match found, use the first available institusi
          if (institusiList.length > 0) {
            formData.set('asal_institusi_id', institusiList[0].id.toString());
            console.log('Using first available institusi:', institusiList[0].id.toString());
          } else {
            setNotif('Tidak ada institusi tersedia');
            setSubmitting(false);
            return;
          }
        }
      } else {
        console.log('Asal institusi value being sent:', asalInstitusiValue.toString());
      }
      
      // Log all form data for debugging
      console.log('All form data being sent:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(key, ':', value);
      });
      
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/api/users/update/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData, // Using FormData for file upload
      });
      
      const json = await res.json();
      if (res.ok) {
        setNotif('User berhasil diubah!');
        setTimeout(() => {
          navigate('/UserManagement');
        }, 2000);
      } else {
        setNotif(json.message || 'Gagal mengubah user');
      }
    } catch (error) {
      console.error('Error editing user:', error);
      setNotif(error instanceof Error ? error.message : 'Gagal mengubah user');
    } finally {
      setSubmitting(false);
    }
  };

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

  // Debug: Log when editingUser changes
  useEffect(() => {
    if (editingUser) {
      console.log('Editing user updated:', editingUser);
      console.log('Role value for form:', getRoleValue(editingUser.role || ''));
      console.log('Kelamin value for form:', getKelaminValue(editingUser.kelamin || ''));
      console.log('Asal institusi for form:', editingUser.asal_institusi);
      console.log('Available institusi:', institusiList.map(i => i.nama_institusi));
      
      // Check if current institusi exists in the list
      const currentInstitusi = institusiList.find(i => i.nama_institusi === editingUser.asal_institusi);
      console.log('Current institusi found:', currentInstitusi);
    }
  }, [editingUser, institusiList]);

  // Debug: Log the user data
  if (editingUser) {
    console.log('Editing user data:', editingUser);
    console.log('Role value:', getRoleValue(editingUser.role || ''));
    console.log('Kelamin value:', getKelaminValue(editingUser.kelamin || ''));
    console.log('Asal institusi:', editingUser.asal_institusi);
    console.log('Institusi list:', institusiList);
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data user...</p>
        </div>
      </div>
    );
  }

  if (!editingUser) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-400">User tidak ditemukan</p>
          <button 
            onClick={() => navigate('/UserManagement')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Kembali ke User Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Edit User
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Edit data user.</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nama</label>
              <input 
                name="nama" 
                required 
                defaultValue={editingUser.nama || ''} 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" 
                placeholder="Masukkan nama user"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                defaultValue={editingUser.email || ''} 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" 
                placeholder="Masukkan email user"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">No HP</label>
              <input 
                name="no_hp" 
                required 
                defaultValue={editingUser.no_hp || ''} 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" 
                placeholder="Masukkan nomor HP"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Role</label>
              <select 
                name="role" 
                required 
                defaultValue={getRoleValue(editingUser.role || '')} 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="3">Mentor</option>
                <option value="4">Guru</option>
                <option value="5">Siswa</option>
                <option value="1">Superadmin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kelamin</label>
              <select 
                name="kelamin" 
                required 
                defaultValue={getKelaminValue(editingUser.kelamin || '')} 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="1">Laki-laki</option>
                <option value="2">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Foto Profile</label>
              <input name="foto_profile" type="file" accept="image/*" className="w-full text-gray-300" />
              <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika tidak ingin mengubah foto</p>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-300 mb-1">Asal Institusi</label>
              <select 
                key={`institusi-${institusiList.length}-${editingUser.asal_institusi}`}
                name="asal_institusi_id" 
                required 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="">Pilih Institusi</option>
                {institusiList.map(i => {
                  const isSelected = i.nama_institusi === editingUser.asal_institusi;
                  console.log(`Institusi ${i.nama_institusi}: ${isSelected ? 'SELECTED' : 'not selected'}`);
                  return (
                    <option 
                      key={i.id} 
                      value={i.id}
                      selected={isSelected}
                    >
                      {i.nama_institusi}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              {submitting ? 'Menyimpan...' : 'Simpan'}
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

export default Edit;
