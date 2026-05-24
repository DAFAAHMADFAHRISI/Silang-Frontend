import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Clock, AlertCircle, CheckCircle, Download, Users, Star, MessageSquare } from "lucide-react";

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

interface Submission {
  id: number;
  file_jawaban: string;
  tanggal_mengumpulkan: string;
  nilai: number;
  catatan_siswa: string;
  catatan_guru: string;
  created_at: string;
  siswa_id: number;
  siswa_nama: string;
}

interface Student {
  id: number;
  nama: string;
  email: string;
  nama_institusi: string;
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(priority)}`}>
      {priority}
    </span>
  );
};

const DetailTugas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Tugas | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [gradeInputs, setGradeInputs] = useState<Record<number, { nilai: string; catatan_guru: string }>>({});
  const [loadingGradeId, setLoadingGradeId] = useState<number | null>(null);

  // ============================================================================
  // FILE HANDLING FUNCTIONS
  // ============================================================================

  const handleDownloadFile = async (fileName: string, taskId: number) => {
    try {
      setFileLoading(true);
      
      const token = localStorage.getItem('token');
      const fileUrl = `http://localhost:3000/api/tugas-mentor/${taskId}/download-task`;

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`File ${fileName} downloaded successfully`);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleViewFile = async (fileName: string, taskId: number) => {
    try {
      setFileLoading(true);
      
      const token = localStorage.getItem('token');
      const fileUrl = `http://localhost:3000/api/tugas-mentor/${taskId}/view-task`;

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to view file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // For PDF files, open in new tab
      if (fileName.toLowerCase().endsWith('.pdf')) {
        window.open(url, '_blank');
      } else {
        // For other file types, show in modal or download
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to view file. Please try again.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleDownloadAnswerFile = async (fileName: string, submissionId: number) => {
    try {
      setFileLoading(true);
      
      const token = localStorage.getItem('token');
      const fileUrl = `http://localhost:3000/api/submission/${submissionId}/download-answer`;

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download answer file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log(`Answer file ${fileName} downloaded successfully`);
    } catch (error) {
      console.error('Error downloading answer file:', error);
      alert('Failed to download answer file. Please try again.');
    } finally {
      setFileLoading(false);
    }
  };

  const handleViewAnswerFile = async (fileName: string, submissionId: number) => {
    try {
      setFileLoading(true);
      
      const token = localStorage.getItem('token');
      const fileUrl = `http://localhost:3000/api/submission/${submissionId}/view-answer`;

      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to view answer file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // For PDF files, open in new tab
      if (fileName.toLowerCase().endsWith('.pdf')) {
        window.open(url, '_blank');
      } else {
        // For other file types, show in modal or download
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error viewing answer file:', error);
      alert('Failed to view answer file. Please try again.');
    } finally {
      setFileLoading(false);
    }
  };

  // ============================================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================================

  const fetchTaskDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch(`http://localhost:3000/API/tugas-mentor/${id}`, {
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
      console.log('Debug - Task Detail API Response:', data);
      
      setTask(data);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat detail tugas.';
      setError(errorMessage);
      console.error('Error fetching task detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    if (!id) return;
    
    try {
      setLoadingSubmissions(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch(`http://localhost:3000/API/tugas-mentor/${id}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }
      
      if (!response.ok) {
        throw new Error(`Error server: ${response.status}`);
      }
      
      const data: Submission[] = await response.json();
      console.log('Debug - Submissions API Response:', data);
      
      setSubmissions(data);
      // Prefill inputs for each submission
      const initialInputs: Record<number, { nilai: string; catatan_guru: string }> = {};
      for (const s of data) {
        initialInputs[s.id] = { nilai: (s.nilai ?? '').toString(), catatan_guru: s.catatan_guru ?? '' };
      }
      setGradeInputs(initialInputs);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data submissions.';
      setError(errorMessage);
      console.error('Error fetching submissions:', err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }
      
      const response = await fetch('http://localhost:3000/API/siswa-mentor', {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'mentor') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    fetchTaskDetail();
    fetchSubmissions();
    fetchStudents();
  }, [id]);

  // ============================================================================
  // GRADE HANDLING FUNCTIONS
  // ============================================================================

  const handleGradeInputChange = (submissionId: number, field: 'nilai' | 'catatan_guru', value: string) => {
    setGradeInputs(prev => ({
      ...prev,
      [submissionId]: {
        nilai: field === 'nilai' ? value : (prev[submissionId]?.nilai ?? ''),
        catatan_guru: field === 'catatan_guru' ? value : (prev[submissionId]?.catatan_guru ?? ''),
      }
    }));
  };

  const handleSubmitGrade = async (submissionId: number) => {
    const input = gradeInputs[submissionId] ?? { nilai: '', catatan_guru: '' };
    const parsedNilai = Number(input.nilai);

    if (Number.isNaN(parsedNilai) || parsedNilai < 0 || parsedNilai > 100) {
      alert('Nilai harus berupa angka antara 0 - 100');
      return;
    }

    try {
      setLoadingGradeId(submissionId);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan. Silakan login ulang.');
      }

      const body = new URLSearchParams();
      body.append('nilai', String(parsedNilai));
      body.append('catatan_guru', input.catatan_guru ?? '');

      const response = await fetch(`http://localhost:3000/api/submission/${submissionId}/grade`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('nama');
        localStorage.removeItem('role');
        throw new Error('Sesi Anda telah berakhir. Silakan login ulang.');
      }

      if (!response.ok) {
        throw new Error(`Gagal menyimpan nilai (status ${response.status}).`);
      }

      // Update submission lokal atau refresh list
      setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, nilai: parsedNilai, catatan_guru: input.catatan_guru } as Submission : s));
      alert('Nilai submission berhasil diupdate.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan nilai.';
      setError(errorMessage);
      console.error('Error grading submission:', err);
    } finally {
      setLoadingGradeId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat detail tugas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
            <p className="text-red-400 mb-4 text-lg font-semibold">Error: {error}</p>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  fetchTaskDetail();
                  fetchSubmissions();
                  fetchStudents();
                }} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
              >
                Coba Lagi
              </button>
              <button 
                onClick={() => navigate('/mentor/tugas')} 
                className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors font-semibold ml-2"
              >
                Kembali ke Tugas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 text-red-500 mx-auto mb-4">⚠️</div>
            <p className="text-red-400 mb-4 text-lg font-semibold">Tugas tidak ditemukan</p>
            <button 
              onClick={() => navigate('/mentor/tugas')} 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              Kembali ke Tugas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        {/* Tombol Kembali - Baris terpisah di atas */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/mentor/tugas')}
            className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2"
          >
            <span className="text-xl font-semibold">←</span>
            <span className="text-base">Kembali</span>
          </button>
        </div>
        
        {/* Judul dan Subtitle - Baris terpisah di bawah */}
        <div className="flex items-center space-x-4">
          <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Detail Tugas
            </h1>
            <p className="text-gray-400 mt-2">Informasi lengkap tugas dan submissions siswa.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700/50 my-8 w-full" />

      <div className="w-full">
        <div className="space-y-6">
          {/* Task Information */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Informasi Tugas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Judul</label>
                <p className="text-white font-semibold text-lg">{task.judul}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Priority</label>
                <div className="mt-1">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-gray-400 text-sm">Deskripsi</label>
                <p className="text-white">{task.deskripsi}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">File Tugas</label>
                <div className="flex items-center space-x-2 mt-1">
                  <button
                    onClick={() => handleViewFile(task.file_tugas, task.id)}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-sm"
                    title="Lihat file"
                  >
                    {task.file_tugas}
                  </button>
                  <button
                    onClick={() => handleDownloadFile(task.file_tugas, task.id)}
                    className="text-green-400 hover:text-green-300 transition-colors"
                    title="Download file"
                    disabled={fileLoading}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Waktu Diberikan</label>
                <p className="text-white text-sm">{formatDate(task.waktu_diberikan)}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Batas Waktu</label>
                <p className="text-white text-sm">{formatDate(task.batas_waktu)}</p>
              </div>
            </div>
          </div>

          {/* Assigned Students Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              Siswa yang Ditugaskan
            </h4>
            
            {loadingStudents ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Memuat data siswa...</span>
              </div>
            ) : (
              <div className="bg-gray-700/30 rounded-xl border border-gray-600/50 overflow-hidden">
                <div className="divide-y divide-gray-600/50">
                  {(() => {
                    const assignedStudents = students.filter(student => 
                      task.total_submissions > 0 || 
                      submissions.some(sub => sub.siswa_id === student.id)
                    );
                    
                    if (assignedStudents.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Belum ada siswa yang ditugaskan</p>
                        </div>
                      );
                    }
                    
                    return assignedStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 hover:bg-gray-600/20 transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {student.nama.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{student.nama}</p>
                            <p className="text-gray-400 text-xs">{student.nama_institusi}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {submissions.some(sub => sub.siswa_id === student.id) ? (
                            <div className="flex items-center text-green-400">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-xs">Submitted</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-400">
                              <Clock className="w-4 h-4 mr-1" />
                              <span className="text-xs">Pending</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Submissions Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-400" />
              Submissions Siswa ({submissions.length})
            </h4>
            
            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                <span className="ml-3 text-gray-400">Memuat submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">Belum ada submissions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="bg-gray-700/30 rounded-xl border border-gray-600/50 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {submission.siswa_nama.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{submission.siswa_nama}</p>
                        
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-4 h-4 mr-1" />
                          <span className="font-semibold">{submission.nilai}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-gray-400 text-xs">File Jawaban</label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewAnswerFile(submission.file_jawaban, submission.id)}
                            className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer text-sm"
                            title="Lihat file jawaban"
                          >
                            {submission.file_jawaban}
                          </button>
                          <button
                            onClick={() => handleDownloadAnswerFile(submission.file_jawaban, submission.id)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                            title="Download file jawaban"
                            disabled={fileLoading}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs">Tanggal Submit</label>
                        <p className="text-white">{formatDate(submission.tanggal_mengumpulkan)}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-400 text-xs">Catatan Siswa</label>
                        <p className="text-white bg-gray-800/40 border border-gray-700/50 p-2.5 rounded-lg">{submission.catatan_siswa || '-'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-gray-400 text-xs">Catatan Guru</label>
                        <p className="text-white bg-gray-800/40 border border-gray-700/50 p-2.5 rounded-lg">{submission.catatan_guru || '-'}</p>
                      </div>
                    </div>

                    {/* Penilaian */}
                    <div className="border-t border-gray-500 mt-4 pt-4">
                      <h5 className="text-white font-semibold mb-2">Beri / Update Nilai</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-gray-300 text-xs mb-1">Nilai (0-100)</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={gradeInputs[submission.id]?.nilai ?? ''}
                            onChange={(e) => handleGradeInputChange(submission.id, 'nilai', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600/50 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Masukkan nilai"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-gray-300 text-xs mb-1">Catatan Guru</label>
                          <input
                            type="text"
                            value={gradeInputs[submission.id]?.catatan_guru ?? ''}
                            onChange={(e) => handleGradeInputChange(submission.id, 'catatan_guru', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600/50 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Contoh: bagus"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => handleSubmitGrade(submission.id)}
                          disabled={loadingGradeId === submission.id}
                          className={`px-4 py-2 rounded-lg transition-colors ${loadingGradeId === submission.id ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white`}
                        >
                          {loadingGradeId === submission.id ? 'Menyimpan...' : (submission.nilai > 0 ? 'Edit Nilai' : 'Simpan Nilai')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTugas;
