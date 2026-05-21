import React, { useState } from 'react';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
  selectedTask: { id: number; judul: string } | null;
}

const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose, onSubmitSuccess, selectedTask }) => {
  const [file, setFile] = useState<File | null>(null);
  const [catatanSiswa, setCatatanSiswa] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const task = selectedTask;
    if (!task) {
      setError('Task not selected');
      return;
    }

    if (!file) {
      setError('Please upload a file');
      return;
    }
    if (!catatanSiswa.trim()) {
      setError('Please add a comment');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file_jawaban', file);
      formData.append('catatan_siswa', catatanSiswa);

      const response = await fetch(`http://localhost:3000/api/tugas-siswa/${task.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok && (data.success ?? true)) {
        setSuccess(true);
        onSubmitSuccess();
        // close after a short delay to show success state
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFile(null);
          setCatatanSiswa('');
        }, 800);
      } else {
        setError(data.message || `Failed to submit task (status ${response.status})`);
      }
    } catch (err) {
      console.error('Error submitting task:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">{selectedTask ? `Submit: ${selectedTask.judul}` : 'Submit Task'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {success ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-300">Task submitted successfully!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">File Jawaban</label>
              <input type="file" onChange={handleFileChange} className="w-full text-gray-300" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Catatan Siswa</label>
              <textarea
                value={catatanSiswa}
                onChange={(e) => setCatatanSiswa(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400"
                placeholder="Contoh: Jawaban terlampir"
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-300">{error}</div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white">Batal</button>
              <button
                type="submit"
                disabled={submitting || !file || !catatanSiswa.trim()}
                className={`px-4 py-2 rounded-lg text-white ${submitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {submitting ? 'Mengirim...' : 'Kirim Tugas'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SubmitModal; 