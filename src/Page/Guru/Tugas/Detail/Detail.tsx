import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Eye, Search } from 'lucide-react';

interface TaskSubmission {
  siswa_id: number;
  siswa_nama: string;
  file_jawaban: string;
  tanggal_mengumpulkan: string;
  nilai: number;
  catatan_siswa: string;
  catatan_guru: string;
  status: string;
}

interface Task {
  id: number;
  judul: string;
  deskripsi: string;
  priority: string;
  file_tugas: string;
  waktu_diberikan: string;
  batas_waktu: string;
  created_at: string;
  updated_at: string;
  mentor_nama: string;
  total_submissions: number;
  total_graded: number;
  penerima_tugas: TaskSubmission[];
}

interface DetailProps {
  selectedTask: Task | null;
  showDetailModal: boolean;
  setShowDetailModal: (show: boolean) => void;
}

const Detail: React.FC<DetailProps> = ({ selectedTask, showDetailModal, setShowDetailModal }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sudah Dinilai':
        return 'bg-green-500 text-white';
      case 'Belum Dinilai':
        return 'bg-yellow-500 text-white';
      case 'Belum Dikumpulkan':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (!showDetailModal || !selectedTask) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{selectedTask.judul}</h2>
          <button
            onClick={() => setShowDetailModal(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Task Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-400">Informasi Tugas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Deskripsi:</span>
                <p className="text-white mt-1">{selectedTask.deskripsi}</p>
              </div>
              <div>
                <span className="text-gray-400">File Tugas:</span>
                <p className="text-white mt-1">{selectedTask.file_tugas}</p>
              </div>
              <div>
                <span className="text-gray-400">Priority:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Mentor:</span>
                <p className="text-white mt-1">{selectedTask.mentor_nama}</p>
              </div>
              <div>
                <span className="text-gray-400">Waktu Diberikan:</span>
                <p className="text-white mt-1">{formatDate(selectedTask.waktu_diberikan)}</p>
              </div>
              <div>
                <span className="text-gray-400">Batas Waktu:</span>
                <p className="text-white mt-1">{formatDate(selectedTask.batas_waktu)}</p>
              </div>
              <div>
                <span className="text-gray-400">Progress:</span>
                <p className="text-white mt-1">{selectedTask.total_graded}/{selectedTask.total_submissions} dinilai</p>
              </div>
              <div>
                <span className="text-gray-400">Created:</span>
                <p className="text-white mt-1">{formatDate(selectedTask.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Submissions Section */}
          {selectedTask.penerima_tugas.length > 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-green-400">
                Submissions ({selectedTask.penerima_tugas.length})
              </h3>
              <div className="space-y-4">
                {selectedTask.penerima_tugas.map((submission, index) => (
                  <div key={index} className="bg-gray-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{submission.siswa_nama}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        {submission.nilai > 0 && (
                          <span className="bg-white/20 px-3 py-1 rounded text-sm font-medium">
                            Nilai: {submission.nilai}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">File Jawaban:</span>
                        <p className="text-white mt-1">{submission.file_jawaban || 'Belum ada file'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Tanggal Submit:</span>
                        <p className="text-white mt-1">
                          {submission.tanggal_mengumpulkan 
                            ? formatDate(submission.tanggal_mengumpulkan)
                            : 'Belum dikumpulkan'
                          }
                        </p>
                      </div>
                      {submission.catatan_siswa && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Catatan Siswa:</span>
                          <p className="text-blue-300 mt-1">{submission.catatan_siswa}</p>
                        </div>
                      )}
                      {submission.catatan_guru && (
                        <div className="md:col-span-2">
                          <span className="text-gray-400">Catatan Guru:</span>
                          <p className="text-yellow-300 mt-1">{submission.catatan_guru}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTask.penerima_tugas.length === 0 && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">Submissions</h3>
              <p className="text-gray-400">Belum ada siswa yang mengumpulkan tugas ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
