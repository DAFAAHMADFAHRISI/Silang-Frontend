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
  asal_institusi_id?: number;
  created_at?: string;
  updated_at?: string;
  // Field khusus untuk siswa
  tanggal_mulai_magang?: string | null;
  tanggal_selesai_magang?: string | null;
  status_magang?: string;
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
        const res = await fetch(`http://localhost:3000/api/superadmin/users/${id}`, {
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
           const currentInstitusi = json.find(i => i.id === editingUser.asal_institusi_id);
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
      
      // Get role value directly from form
      const roleValue = formData.get('role');
      console.log('Role value from form:', roleValue);
      console.log('Role value type:', typeof roleValue);
      
      // Validate role value
      if (!roleValue || (roleValue !== 'mentor' && roleValue !== 'guru' && roleValue !== 'siswa')) {
        setNotif('Role tidak valid. Silakan pilih role yang benar.');
        setSubmitting(false);
        return;
      }
      
      // Get kelamin value directly from form
      const kelaminValue = formData.get('kelamin');
      console.log('Kelamin value from form:', kelaminValue);
      console.log('Kelamin value type:', typeof kelaminValue);
      
      // Validate kelamin value
      if (!kelaminValue || (kelaminValue !== 'laki-laki' && kelaminValue !== 'perempuan')) {
        setNotif('Kelamin tidak valid. Silakan pilih kelamin yang benar.');
        setSubmitting(false);
        return;
      }
      
      // Handle institusi - only update if user actually selected a different one
      const asalInstitusiValue = formData.get('asal_institusi_id');
      console.log('Form asal_institusi_id value:', asalInstitusiValue);
      
             if (!asalInstitusiValue) {
         // If no institution selected, remove it from form data so it won't be updated
         formData.delete('asal_institusi_id');
         console.log('No institution selected, removing from update data');
       } else {
         // Check if the selected institution is different from current one
         const currentInstitusiId = editingUser.asal_institusi_id;
         const selectedInstitusiId = Number(asalInstitusiValue);
         
         if (currentInstitusiId && selectedInstitusiId === currentInstitusiId) {
           // Same institution, remove from form data so it won't be updated
           formData.delete('asal_institusi_id');
           console.log('Same institution selected, removing from update data');
         } else {
           console.log('Different institution selected, will update to:', asalInstitusiValue.toString());
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
      
      const token = localStorage.getItem('token');
      console.log('Token available:', !!token);
      
      // Use the correct API endpoint - superadmin endpoint untuk edit siswa
      const apiUrl = `http://localhost:3000/api/superadmin/users/update/${editingUser.id}`;
      console.log('Sending PATCH request to:', apiUrl);
      
      const res = await fetch(apiUrl, {
        method: 'PATCH',
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
        setNotif(`User berhasil diubah dengan role ${roleMapping[roleValue as keyof typeof roleMapping]}!`);
        setTimeout(() => {
          navigate('/UserManagement');
        }, 2000);
      } else {
        console.log('Update user failed:', json);
        setNotif(json.message || 'Gagal mengubah user');
      }
    } catch (error) {
      console.error('Error editing user:', error);
      setNotif(error instanceof Error ? error.message : 'Gagal mengubah user');
    } finally {
      setSubmitting(false);
    }
  };

  // Debug: Log when editingUser changes
  useEffect(() => {
    if (editingUser) {
      console.log('Editing user updated:', editingUser);
           console.log('Role value for form:', editingUser.role);
     console.log('Kelamin value for form:', editingUser.kelamin);
     console.log('Asal institusi for form:', editingUser.asal_institusi);
     console.log('Asal institusi ID for form:', editingUser.asal_institusi_id);
     console.log('Available institusi:', institusiList.map(i => i.nama_institusi));
      
             // Check if current institusi exists in the list
       const currentInstitusi = institusiList.find(i => i.id === editingUser.asal_institusi_id);
       console.log('Current institusi found:', currentInstitusi);
    }
  }, [editingUser, institusiList]);

  // Debug: Log the user data
  if (editingUser) {
    console.log('Editing user data:', editingUser);
    console.log('Role value:', editingUser.role);
    console.log('Kelamin value:', editingUser.kelamin);
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
                defaultValue={editingUser.role || 'mentor'} 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="mentor">Mentor</option>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kelamin</label>
              <select 
                name="kelamin" 
                required 
                defaultValue={editingUser.kelamin || 'laki-laki'} 
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
              >
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
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
                 className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
               >
                                                                       <option value="">Pilih Institusi</option>
                   {institusiList.map(i => {
                     const isSelected = i.id === editingUser.asal_institusi_id;
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
             
             {/* Field khusus untuk role siswa */}
             {editingUser.role === 'siswa' && (
               <>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Tanggal Mulai Magang</label>
                   <input 
                     name="tanggal_mulai_magang" 
                     type="date" 
                     defaultValue={editingUser.tanggal_mulai_magang ? editingUser.tanggal_mulai_magang.split('T')[0] : ''} 
                     className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" 
                     placeholder="Pilih tanggal mulai magang"
                   />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Tanggal Selesai Magang</label>
                   <input 
                     name="tanggal_selesai_magang" 
                     type="date" 
                     defaultValue={editingUser.tanggal_selesai_magang ? editingUser.tanggal_selesai_magang.split('T')[0] : ''} 
                     className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" 
                     placeholder="Pilih tanggal selesai magang"
                   />
                 </div>
                 <div>
                   <label className="block text-sm text-gray-300 mb-1">Status Magang</label>
                   <div className="px-3 py-2 rounded bg-gray-700 border border-gray-600 text-gray-400 text-sm">
                     {editingUser.status_magang || 'Belum Ditentukan'} (Otomatis berdasarkan tanggal)
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Status magang akan dihitung otomatis berdasarkan tanggal yang dipilih</p>
                 </div>
               </>
             )}
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
