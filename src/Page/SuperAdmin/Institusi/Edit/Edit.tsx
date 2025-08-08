import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface InstitusiRow {
  id: number;
  nama_institusi: string;
  alamat: string;
  created_at: string;
  updated_at: string;
}

const Edit: React.FC = () => {
  const [notif, setNotif] = useState<string | null>(null);
  const [editingInstitusi, setEditingInstitusi] = useState<InstitusiRow | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchInstitusi = async () => {
      if (!id) return;
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/api/institusi/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setEditingInstitusi(data);
        } else {
          setNotif('Gagal mengambil data institusi');
        }
      } catch (error) {
        console.error('Error fetching institusi:', error);
        setNotif('Gagal mengambil data institusi');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitusi();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInstitusi) return;

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
      const res = await fetch(`http://localhost:3000/api/institusi/update/${editingInstitusi.id}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlEncodedData.toString(),
      });
      const json = await res.json();
      if (res.ok) {
        setNotif('Institusi berhasil diubah!');
        setTimeout(() => {
          navigate('/Institusi');
        }, 2000);
      } else {
        setNotif(json.message || 'Gagal mengubah institusi');
      }
    } catch (error) {
      console.error('Error editing institusi:', error);
      setNotif(error instanceof Error ? error.message : 'Gagal mengubah institusi');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data institusi...</p>
        </div>
      </div>
    );
  }

  if (!editingInstitusi) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-400">Institusi tidak ditemukan</p>
          <button 
            onClick={() => navigate('/Institusi')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Kembali ke Institusi
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
            Edit Institusi
          </h1>
        </div>
        <p className="text-gray-400 mt-2 ml-5">Edit data institusi.</p>
      </div>

      {/* Form */}
      <div className="max-w-md">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nama Institusi</label>
              <input name="nama_institusi" required defaultValue={editingInstitusi.nama_institusi} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Alamat</label>
              <textarea name="alamat" required defaultValue={editingInstitusi.alamat} className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white" rows={3} />
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
              Batal
            </button>
          </div>
          {notif && <div className="mt-2 text-center text-sm text-green-400">{notif}</div>}
        </form>
      </div>
    </div>
  );
};

export default Edit;
