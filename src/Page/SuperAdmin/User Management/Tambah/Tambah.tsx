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
  const [selectedRole, setSelectedRole] = useState<string>('');
  const navigate = useNavigate();

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
      
      // Get role value directly from form
      const roleValue = formData.get('role');
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Role value from form:', roleValue);
      console.log('Role value type:', typeof roleValue);
      
      // Validate role value
      if (!roleValue || (roleValue !== 'mentor' && roleValue !== 'guru' && roleValue !== 'siswa')) {
        setNotif('Role tidak valid. Silakan pilih role yang benar.');
        setLoading(false);
        return;
      }
      
      // Get kelamin value directly from form
      const kelaminValue = formData.get('kelamin');
      console.log('Kelamin value from form:', kelaminValue);
      console.log('Kelamin value type:', typeof kelaminValue);
      
      // Ensure asal_institusi_id is set correctly
      const asalInstitusiValue = formData.get('asal_institusi_id');
      if (!asalInstitusiValue) {
        setNotif('Pilih institusi terlebih dahulu');
        setLoading(false);
        return;
      }
      
      // Validate date fields for siswa role
      if (roleValue === 'siswa') {
        const tanggalAwalMagang = formData.get('tanggal_awal_magang');
        const tanggalKeluarMagang = formData.get('tanggal_keluar_magang');
        
        if (!tanggalAwalMagang) {
          setNotif('Tanggal awal magang harus diisi untuk role siswa');
          setLoading(false);
          return;
        }
        
        if (!tanggalKeluarMagang) {
          setNotif('Tanggal keluar magang harus diisi untuk role siswa');
          setLoading(false);
          return;
        }
        
        // Validate that end date is after start date
        const startDate = new Date(tanggalAwalMagang as string);
        const endDate = new Date(tanggalKeluarMagang as string);
        
        if (endDate <= startDate) {
          setNotif('Tanggal keluar magang harus setelah tanggal awal magang');
          setLoading(false);
          return;
        }
      }
      
      // Log all form data for debugging
      console.log('All form data being sent:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(key, ':', value, '(', typeof value, ')');
      });
      
      // Verify role mapping
      const roleMapping = {
        'mentor': 'Mentor',
        'guru': 'Guru', 
        'siswa': 'Siswa'
      };
      console.log('Role mapping verification:');
      console.log('Form value:', roleValue, '→', roleMapping[roleValue as keyof typeof roleMapping]);
      
      // Double-check form data before sending
      console.log('=== FINAL VERIFICATION ===');
      console.log('Role to be sent:', roleValue);
      console.log('Role name:', roleMapping[roleValue as keyof typeof roleMapping]);
      console.log('FormData entries:');
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      // Use the correct API endpoint based on your backend structure
      const apiUrl = 'http://localhost:3000/api/users/create';
      console.log('Sending request to:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData, // Using FormData for file upload
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      const json = await res.json();
      console.log('Response JSON:', json);
      
      if (res.ok) {
        setNotif(`User berhasil ditambahkan dengan role ${roleMapping[roleValue as keyof typeof roleMapping]}!`);
        setTimeout(() => {
          navigate('/UserManagement');
        }, 2000);
      } else {
        console.log('Create user failed:', json);
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
              <select 
                name="role" 
                required 
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="">Pilih Role</option>
                <option value="mentor">Mentor</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
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
            {selectedRole === 'siswa' && (
              <>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tanggal Awal Magang</label>
                  <input 
                    name="tanggal_awal_magang" 
                    type="date" 
                    required={selectedRole === 'siswa'}
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tanggal Keluar Magang</label>
                  <input 
                    name="tanggal_keluar_magang" 
                    type="date" 
                    required={selectedRole === 'siswa'}
                    className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" 
                  />
                </div>
              </>
            )}
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
