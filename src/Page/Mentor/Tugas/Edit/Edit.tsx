import React, { useState, useEffect, useRef } from "react";
import { Edit as EditIcon, ArrowLeft, FileText, Calendar, Users, AlertCircle, Save, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';


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
  penerima_tugas?: number[]; // Added for assigned students
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
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [task, setTask] = useState<Tugas | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [editForm, setEditForm] = useState<EditTaskForm>({
    judul: '',
    deskripsi: '',
    priority: '3',
    file_tugas: null,
    batas_waktu: '',
    selectedStudents: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
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
    } finally {
      setLoadingStudents(false);
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
      
      // Extract assigned student ids from various possible shapes
      let assignedIds: number[] = [];
      const rawAssigned: unknown = (data as any).penerima_tugas;
      if (typeof rawAssigned === 'string') {
        try {
          const parsed = JSON.parse(rawAssigned);
          if (Array.isArray(parsed)) {
            assignedIds = parsed
              .map((v) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : null))
              .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
          }
        } catch (e) {
          console.warn('Failed to parse penerima_tugas string:', rawAssigned);
        }
      } else if (Array.isArray(rawAssigned)) {
        assignedIds = rawAssigned
          .map((v) => (typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : null))
          .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v));
      }
      
      // Set form data
      setEditForm({
        judul: data.judul,
        deskripsi: data.deskripsi,
        priority: data.priority,
        file_tugas: null,
        batas_waktu: data.batas_waktu,
        selectedStudents: assignedIds,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data tugas.';
      setError(errorMessage);
      console.error('Error fetching task:', err);
    } finally {
      setLoadingTask(false);
    }
  };

  // Strict endpoint: only returns explicitly assigned students. If not available, returns null
  const fetchAssignedStudentsStrict = async (taskId: number): Promise<Student[] | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await fetch(`http://localhost:3000/api/tugas-mentor/${taskId}/assigned-students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) return null;
      const data: Student[] = await response.json();
      return data;
    } catch {
      return null;
    }
  };

  const loadTaskStudents = async () => {
    if (!task) return;

    try {
      console.log('=== Loading Task Students ===');
      console.log('Task ID:', task.id);
      console.log('Current students list length:', students.length);
      
      // Do not override if already populated from task data
      if (editForm.selectedStudents && editForm.selectedStudents.length > 0) {
        console.log('Selected students already set from task data. Skipping fetch.');
        return;
      }

      const strictAssigned = await fetchAssignedStudentsStrict(task.id);
      if (strictAssigned && strictAssigned.length >= 0) {
        const assignedIds = strictAssigned.map((s) => s.id);
        setEditForm((prev) => ({ ...prev, selectedStudents: assignedIds }));
        return;
      }

      console.log('No strict assigned endpoint available. Leaving selection empty to avoid selecting all.');
      // If no strict data, do not auto-select to avoid selecting all students incorrectly
      setEditForm((prev) => ({ ...prev, selectedStudents: prev.selectedStudents ?? [] }));
      
    } catch (err) {
      console.error('Error loading task students:', err);
      setEditForm(prev => ({ ...prev, selectedStudents: [] }));
    }
  };

  useEffect(() => {
    if (id) {
      fetchTask();
      fetchStudents();
    }
  }, [id]);

  useEffect(() => {
    if (task && students.length > 0) {
      loadTaskStudents();
    }
  }, [task, students]);

  useEffect(() => {
    console.log('=== Selected Students Changed ===');
    console.log('Current selectedStudents:', editForm.selectedStudents);
    console.log('Students list:', students.map(s => ({ id: s.id, nama: s.nama })));
  }, [editForm.selectedStudents, students]);

  // Manual trigger for debugging
  const manualLoadStudents = () => {
    console.log('Manual trigger - loading task students');
    if (task) {
      loadTaskStudents();
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

  // Date picker functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleConfirmDateTime = () => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(':');
      const dateTime = new Date(selectedDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes));
      
      // Format for input value (YYYY-MM-DDTHH:MM)
      const year = dateTime.getFullYear();
      const month = String(dateTime.getMonth() + 1).padStart(2, '0');
      const day = String(dateTime.getDate()).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      const formattedDateTime = `${year}-${month}-${day}T${timeString}`;
      setEditForm({...editForm, batas_waktu: formattedDateTime});
    }
    setShowDatePicker(false);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  if (loadingTask) {
    return (
      
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Memuat data tugas...</p>
            </div>
          </div>
        </div>
      
    );
  }

  if (!task) {
    return (
      
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
      
    );
  }

  return (
    
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        {/* Header */}
        <div className="mb-6 mt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/mentor/tugas')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700/50"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Kembali</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3 mt-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Edit Tugas
            </h1>
          </div>
          <p className="text-gray-400 mt-2 ml-5">Edit tugas "{task.judul}"</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
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
                      type="text"
                      value={editForm.batas_waktu ? new Date(editForm.batas_waktu).toLocaleDateString('id-ID', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                      onClick={() => setShowDatePicker(true)}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 cursor-pointer"
                      placeholder="Pilih tanggal dan waktu"
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
                
                {/* Hidden file input - always present */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => setEditForm({...editForm, file_tugas: e.target.files?.[0] || null})}
                  className="hidden"
                />
                
                {/* Show file input only when no existing file or when user wants to change */}
                {(!task.file_tugas || editForm.file_tugas) && (
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) => setEditForm({...editForm, file_tugas: e.target.files?.[0] || null})}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />
                  </div>
                )}

                {/* Show existing file if available */}
                {task.file_tugas && !editForm.file_tugas && (
                  <div className="p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600/20 rounded-lg">
                        <FileText className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{task.file_tugas}</p>
                        <p className="text-gray-400 text-xs">File yang sudah diupload</p>
                      </div>
                      <button
                        onClick={() => {
                          // Trigger file input click using ref
                          if (fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                      >
                        Ganti File
                      </button>
                    </div>
                  </div>
                )}

                {/* Show newly selected file */}
                {editForm.file_tugas && (
                  <div className="mt-2 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                    <p className="text-green-400 text-sm">File baru dipilih: {editForm.file_tugas.name}</p>
                    <p className="text-green-300 text-xs mt-1">File ini akan mengganti file yang ada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Date Picker Popup */}
            {showDatePicker && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-md w-full">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 px-6 py-4 border-b border-gray-700/50 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Pilih Tanggal & Waktu</h3>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="p-6">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={prevMonth}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h4 className="text-white font-semibold">
                        {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button
                        onClick={nextMonth}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                        <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentDate).map((date, index) => (
                        <button
                          key={index}
                          onClick={() => date && handleDateSelect(date)}
                          disabled={!date}
                          className={`
                            p-2 text-sm rounded-lg transition-all duration-200
                            ${!date ? 'invisible' : ''}
                            ${date && selectedDate && date.toDateString() === selectedDate.toDateString()
                              ? 'bg-blue-600 text-white'
                              : date && date < new Date()
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'text-white hover:bg-gray-600/50 cursor-pointer'
                            }
                          `}
                        >
                          {date ? date.getDate() : ''}
                        </button>
                      ))}
                    </div>

                    {/* Time Selection */}
                    <div className="mt-6">
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Waktu
                      </label>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    {/* Selected Date Display */}
                    {selectedDate && (
                      <div className="mt-4 p-3 bg-blue-600/20 border border-blue-700/50 rounded-lg">
                        <p className="text-blue-400 text-sm">
                          Dipilih: {formatDate(selectedDate)} {formatTime(selectedTime)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700/50 rounded-b-2xl">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleConfirmDateTime}
                        disabled={!selectedDate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Konfirmasi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  <div>
                    {loadingStudents ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-sm">Memuat siswa...</p>
                      </div>
                    ) : students.length === 0 ? (
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
    
  );
};

export default Edit;
