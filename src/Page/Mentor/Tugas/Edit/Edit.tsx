import React, { useState, useEffect } from "react";
import { Edit as EditIcon, ArrowLeft, FileText, Calendar, Users, AlertCircle, Save } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import Layout from "../../../../Layout/Layout";

interface Tugas {
  id: number;
  mentor_id?: number;
  judul: string;
  deskripsi: string;
  priority: string;
  file_tugas: string;
  waktu_diberikan: string;
  batas_waktu: string;
  created_at: string;
  updated_at: string;
  total_submissions: number;
  total_graded: number;
}

interface Student {
  id: number;
  nama: string;
  email: string;
  nama_institusi: string;
}

interface EditTaskForm {
  judul: string;
  deskripsi: string;
  priority: string;
  file_tugas: File | null;
  batas_waktu: string;
  selectedStudents: number[];
}

const Edit: React.FC = () => {
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [task, setTask] = useState<Tugas | null>(null);
  const [editForm, setEditForm] = useState<EditTaskForm>({
    judul: '',
    deskripsi: '',
    priority: '3',
    file_tugas: null,
    batas_waktu: '',
    selectedStudents: [],
  });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const fetchStudents = async () => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/api/siswa-mentor', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      const data: Student[] = await response.json();
      console.log('Debug - Students API Response:', data);
      
      setStudents(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data siswa.';
      setError(errorMessage);
      console.error('Error fetching students:', err);
    }
  };

  const fetchTask = async () => {
    if (!id) return;

    try {
      setLoadingTask(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch(`http://localhost:3000/api/tugas-mentor/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      const data: Tugas = await response.json();
      console.log('Debug - Task API Response:', data);
      
      setTask(data);
      
      // Set form data
      setEditForm({
        judul: data.judul,
        deskripsi: data.deskripsi,
        priority: data.priority,
        file_tugas: null,
        batas_waktu: data.batas_waktu.split('T')[0] + 'T' + data.batas_waktu.split('T')[1].substring(0, 5),
        selectedStudents: [],
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data tugas.';
      setError(errorMessage);
      console.error('Error fetching task:', err);
    } finally {
      setLoadingTask(false);
    }
  };

  const fetchTaskStudents = async (taskId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch(`http://localhost:3000/api/tugas-mentor/${taskId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      const data: Student[] = await response.json();
      console.log('Debug - Task Students API Response:', data);
      
      return data;
      
    } catch (err) {
      console.error('Error fetching task students:', err);
      return [];
    }
  };

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchStudents();
    }
  }, [id]);

  useEffect(() => {
    if (task) {
      loadTaskStudents();
    }
  }, [task]);

  const loadTaskStudents = async () => {
    if (!task) return;

    try {
      const assignedStudents = await fetchTaskStudents(task.id);
      const assignedStudentIds = assignedStudents.map(student => student.id);
      
      setEditForm(prev => ({
        ...prev,
        selectedStudents: assignedStudentIds,
      }));
    } catch (err) {
      console.error('Error loading task students:', err);
    }
  };

  const handleUpdateTask = async () => {
    if (!task) return;

    // Validation
    if (!editForm.judul.trim()) {
      setError('Judul tugas harus diisi.');
      return;
    }
    
    if (!editForm.deskripsi.trim()) {
      setError('Deskripsi tugas harus diisi.');
      return;
    }
    
    if (!editForm.batas_waktu) {
      setError('Batas waktu harus diisi.');
      return;
    }
    
    if (editForm.selectedStudents.length === 0) {
      setError('Pilih minimal satu siswa untuk ditugaskan.');
      return;
    }

    try {
      setLoadingAction(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const formData = new FormData();
      formData.append('judul', editForm.judul);
      formData.append('deskripsi', editForm.deskripsi);
      formData.append('priority', editForm.priority);
      formData.append('batas_waktu', editForm.batas_waktu);
      
      if (editForm.file_tugas) {
        formData.append('file_tugas', editForm.file_tugas);
      }
      
      // Kirim array id siswa sebagai penerima_tugas
      formData.append('penerima_tugas', JSON.stringify(editForm.selectedStudents));
      
      const response = await fetch(`http://localhost:3000/api/tugas-mentor/update/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      console.log('Task updated successfully');
      // Navigate back to the main tasks page
      navigate('/mentor/tugas');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate tugas.';
      setError(errorMessage);
      console.error('Error updating task:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '1': return 'text-red-400 bg-red-900/20 border-red-700';
      case '2': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case '3': return 'text-green-400 bg-green-900/20 border-green-700';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case '1': return 'High';
      case '2': return 'Medium';
      case '3': return 'Low';
      default: return 'Low';
    }
  };

  if (loadingTask) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Memuat data tugas...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!task) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
              <p className="text-red-400 mb-4 text-lg font-semibold">Tugas tidak ditemukan</p>
              <button 
                onClick={() => navigate('/mentor/tugas')} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Kembali ke Daftar Tugas
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Header Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/mentor/tugas')}
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700/50"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="font-medium">Kembali</span>
                </button>
                <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Edit Tugas
                  </h1>
                  <p className="text-gray-400 mt-1">Edit tugas "{task.judul}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {error && (
            <div className="mb-8 p-4 bg-red-900/50 border border-red-700/50 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-8 py-6 border-b border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Informasi Tugas</h2>
                  <p className="text-gray-400 text-sm">Edit detail tugas yang akan diberikan</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Judul Tugas <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.judul}
                    onChange={(e) => setEditForm({...editForm, judul: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    placeholder="Masukkan judul tugas yang jelas dan deskriptif"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Deskripsi <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={editForm.deskripsi}
                    onChange={(e) => setEditForm({...editForm, deskripsi: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Jelaskan detail tugas, instruksi, dan ekspektasi yang diharapkan"
                    rows={5}
                  />
                </div>
              </div>

              {/* Priority and Deadline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Prioritas
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="1">High Priority</option>
                    <option value="2">Medium Priority</option>
                    <option value="3">Low Priority</option>
                  </select>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(editForm.priority)}`}>
                      {getPriorityText(editForm.priority)} Priority
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Batas Waktu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={editForm.batas_waktu}
                      onChange={(e) => setEditForm({...editForm, batas_waktu: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                    />
                    <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* File Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  File Tugas (Opsional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={(e) => setEditForm({...editForm, file_tugas: e.target.files?.[0] || null})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                </div>
                {editForm.file_tugas && (
                  <div className="mt-2 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                    <p className="text-green-400 text-sm">File dipilih: {editForm.file_tugas.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Students Selection Section */}
            <div className="border-t border-gray-700/50">
              <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-8 py-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Pilih Siswa</h2>
                    <p className="text-gray-400 text-sm">Pilih siswa yang akan menerima tugas ini</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="bg-gray-700/30 rounded-xl border border-gray-600/50 overflow-hidden">
                  {/* Selection Controls */}
                  <div className="p-4 bg-gray-700/50 border-b border-gray-600/50">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setEditForm({
                          ...editForm,
                          selectedStudents: students.map(s => s.id)
                        })}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Pilih Semua</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditForm({
                          ...editForm,
                          selectedStudents: []
                        })}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      >
                        Hapus Semua
                      </button>
                      {editForm.selectedStudents.length > 0 && (
                        <span className="px-4 py-2 bg-green-600/20 text-green-400 text-sm font-medium rounded-lg border border-green-700/50">
                          {editForm.selectedStudents.length} siswa dipilih
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Students List */}
                  <div className="max-h-80 overflow-y-auto">
                    {students.length === 0 ? (
                      <div className="p-8 text-center">
                        <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Tidak ada siswa tersedia.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-600/50">
                        {students.map((student) => (
                          <label key={student.id} className="flex items-center space-x-4 p-4 hover:bg-gray-600/30 cursor-pointer transition-colors duration-200">
                            <input
                              type="checkbox"
                              checked={editForm.selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditForm({
                                    ...editForm,
                                    selectedStudents: [...editForm.selectedStudents, student.id]
                                  });
                                } else {
                                  setEditForm({
                                    ...editForm,
                                    selectedStudents: editForm.selectedStudents.filter(id => id !== student.id)
                                  });
                                }
                              }}
                              className="w-5 h-5 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{student.nama}</p>
                              <p className="text-gray-400 text-sm truncate">{student.email}</p>
                              <p className="text-gray-500 text-xs truncate">{student.nama_institusi}</p>
                            </div>
                            {editForm.selectedStudents.includes(student.id) && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-800/50 px-8 py-6 border-t border-gray-700/50">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleUpdateTask}
                  disabled={loadingAction}
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {loadingAction ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Update Tugas</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => navigate('/mentor/tugas')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl transition-colors duration-200 font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Edit;
