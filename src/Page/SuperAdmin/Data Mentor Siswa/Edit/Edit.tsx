import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users } from 'lucide-react';

interface MentorOption { id: number; nama: string }
interface SiswaOption { id: number; nama: string; institusi: string }

interface MentorSiswaForm {
  mentor_id: string;
  siswa_id: string;
}

interface MentorSiswaDetail {
  id: number;
  nama_mentor: string;
  nama_siswa: string;
}

const EditMentorSiswa: React.FC = () => {
  const [formData, setFormData] = useState<MentorSiswaForm>({ mentor_id: '', siswa_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [siswaOptions, setSiswaOptions] = useState<SiswaOption[]>([]);
  const [detail, setDetail] = useState<MentorSiswaDetail | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      setError('Anda harus login terlebih dahulu.');
      return;
    }

    if (role !== 'superadmin') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      return;
    }

    if (!id) {
      setError('ID tidak ditemukan.');
      return;
    }

    const loadData = async () => {
      try {
        setLoadingOptions(true);
        setLoadingDetail(true);
        const headers = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        } as HeadersInit;

        // Fetch detail data
        const detailRes = await fetch(`http://localhost:3000/api/mentor-siswa/${id}`, { headers });
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          console.log('Detail data from API:', detailData);
          setDetail(detailData);
        } else {
          console.error('Failed to fetch detail data:', detailRes.status, detailRes.statusText);
          setError('Gagal memuat data detail.');
        }

        // Fetch mentor data
        const mentorRes = await fetch('http://localhost:3000/api/mentors', { headers });
        if (mentorRes.ok) {
          const mentorData = await mentorRes.json();
          console.log('Raw mentor data from API:', mentorData);
          const mapped: MentorOption[] = Array.isArray(mentorData)
            ? mentorData.map((m: any) => ({ id: m.id ?? m.mentor_id ?? m.id_mentor, nama: m.nama ?? m.nama_mentor ?? m.name }))
            : [];
          console.log('Mapped mentor options:', mapped);
          const filtered = mapped.filter(opt => opt.id && opt.nama);
          console.log('Filtered mentor options:', filtered);
          setMentorOptions(filtered);
        } else {
          console.error('Failed to fetch mentor data:', mentorRes.status, mentorRes.statusText);
        }

        // Fetch siswa data
        const siswaRes = await fetch('http://localhost:3000/api/students', { headers });
        if (siswaRes.ok) {
          const siswaData = await siswaRes.json();
          console.log('Raw siswa data from API:', siswaData);
          const mapped: SiswaOption[] = Array.isArray(siswaData)
            ? siswaData.map((s: any) => ({ 
                id: s.id ?? s.siswa_id ?? s.id_siswa, 
                nama: s.nama ?? s.nama_siswa ?? s.name,
                institusi: s.institusi ?? s.nama_institusi ?? ''
              }))
            : [];
          console.log('Mapped siswa options:', mapped);
          const filtered = mapped.filter(opt => opt.id && opt.nama);
          console.log('Filtered siswa options:', filtered);
          setSiswaOptions(filtered);
        } else {
          console.error('Failed to fetch siswa data:', siswaRes.status, siswaRes.statusText);
        }

        // Fallback: only if primary endpoints failed to return data
        let needFallback = false;
        if (!mentorRes.ok || !siswaRes.ok) {
          needFallback = true;
        }

        if (needFallback) {
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            if (Array.isArray(rekap)) {
              // Fallback for mentor if primary failed
              if (!mentorRes.ok) {
                const mentorFromRekap: MentorOption[] = rekap.map((m: any) => ({ id: m.mentor_id, nama: m.nama_mentor })).filter((m: MentorOption) => m.id && m.nama);
                if (mentorFromRekap.length) setMentorOptions(mentorFromRekap);
              }
              
              // Fallback for siswa if primary failed
              if (!siswaRes.ok) {
                const siswaSet: Record<number, { nama: string; institusi: string }> = {};
                rekap.forEach((m: any) => {
                  (m.siswa || []).forEach((s: any) => {
                    if (s && (s.id ?? s.siswa_id)) {
                      const sid = Number(s.id ?? s.siswa_id);
                      siswaSet[sid] = { 
                        nama: s.nama_siswa ?? s.nama ?? '',
                        institusi: s.institusi ?? s.nama_institusi ?? ''
                      };
                    }
                  });
                });
                const siswaFromRekap: SiswaOption[] = Object.entries(siswaSet).map(([id, data]) => ({ 
                  id: Number(id), 
                  nama: data.nama,
                  institusi: data.institusi
                })).filter(x => x.id && x.nama);
                if (siswaFromRekap.length) setSiswaOptions(siswaFromRekap);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Gagal memuat data, pastikan endpoint tersedia.');
        setError('Gagal memuat data.');
      } finally {
        setLoadingOptions(false);
        setLoadingDetail(false);
      }
    };

    loadData();
  }, [id]);

  // Pre-select values when detail and options are loaded
  useEffect(() => {
    if (detail && mentorOptions.length > 0 && siswaOptions.length > 0) {
      console.log('Pre-selecting values for:', detail);
      
      // Find mentor ID by name
      const mentorOption = mentorOptions.find(m => 
        m.nama.toLowerCase().trim() === detail.nama_mentor.toLowerCase().trim()
      );
      
      // Find siswa ID by name
      const siswaOption = siswaOptions.find(s => 
        s.nama.toLowerCase().trim() === detail.nama_siswa.toLowerCase().trim()
      );
      
      console.log('Found mentor option:', mentorOption);
      console.log('Found siswa option:', siswaOption);
      
      setFormData({
        mentor_id: mentorOption ? String(mentorOption.id) : '',
        siswa_id: siswaOption ? String(siswaOption.id) : ''
      });
    }
  }, [detail, mentorOptions, siswaOptions]);

  // Debug: log when options change
  useEffect(() => {
    console.log('mentorOptions state updated:', mentorOptions);
  }, [mentorOptions]);

  useEffect(() => {
    console.log('siswaOptions state updated:', siswaOptions);
  }, [siswaOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');

      // Resolve canonical IDs by NAME from live endpoints to avoid stale IDs
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      } as HeadersInit;
      const [mentorLiveRes, siswaLiveRes] = await Promise.all([
        fetch('http://localhost:3000/api/mentors', { headers }),
        fetch('http://localhost:3000/api/students', { headers }),
      ]);

      const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
      const selectedMentorName = normalize(mentorOptions.find(m => String(m.id) === formData.mentor_id)?.nama);
      const selectedSiswaName = normalize(siswaOptions.find(s => String(s.id) === formData.siswa_id)?.nama);

      let mentorIdToSend = formData.mentor_id;
      let siswaIdToSend = formData.siswa_id;

      if (mentorLiveRes.ok && selectedMentorName) {
        const mentorLive = await mentorLiveRes.json();
        const foundMentor = Array.isArray(mentorLive)
          ? mentorLive.find((m: any) => normalize(m.nama ?? m.nama_mentor ?? m.name) === selectedMentorName)
          : undefined;
        if (foundMentor) mentorIdToSend = String(foundMentor.id ?? foundMentor.mentor_id ?? foundMentor.id_mentor);
        else {
          // Fallback to rekap for mentor
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            const m = Array.isArray(rekap) ? rekap.find((x: any) => normalize(x.nama_mentor) === selectedMentorName) : undefined;
            if (m) mentorIdToSend = String(m.mentor_id);
          }
        }
      }

      if (siswaLiveRes.ok && selectedSiswaName) {
        const siswaLive = await siswaLiveRes.json();
        let foundSiswa = Array.isArray(siswaLive)
          ? siswaLive.find((s: any) => normalize(s.nama ?? s.nama_siswa ?? s.name) === selectedSiswaName)
          : undefined;
        if (!foundSiswa) {
          // Fallback to rekap
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            let sid: number | undefined;
            if (Array.isArray(rekap)) {
              rekap.some((m: any) => {
                const hit = (m.siswa || []).find((s: any) => normalize(s.nama_siswa ?? s.nama ?? s.name) === selectedSiswaName);
                if (hit) { sid = Number(hit.id ?? hit.siswa_id); return true; }
                return false;
              });
            }
            if (sid) siswaIdToSend = String(sid);
          }
        } else {
          siswaIdToSend = String(foundSiswa.id ?? foundSiswa.siswa_id ?? foundSiswa.id_siswa);
        }
      }

      const body = new URLSearchParams();
      body.append('mentor_id', mentorIdToSend);
      body.append('siswa_id', siswaIdToSend);

      const res = await fetch(`http://localhost:3000/api/mentor-siswa/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body,
      } as RequestInit);

      if (!res.ok) throw new Error(`Gagal mengupdate data: ${res.status} ${res.statusText}`);

      navigate('/DataMentorSiswa');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengupdate data mentor-siswa.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDetail) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
        <button onClick={() => navigate('/DataMentorSiswa')} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4 flex items-center space-x-2">
        <Users className="w-6 h-6 text-blue-400" />
        <span>Edit Mentor - Siswa</span>
      </h1>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mentor {mentorOptions.length > 0 && `(${mentorOptions.length} tersedia)`}
            </label>
            <select
              value={formData.mentor_id}
              onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
              disabled={loadingOptions}
            >
              <option value="">{loadingOptions ? 'Memuat...' : 'Pilih Mentor'}</option>
              {mentorOptions.map((m) => (
                <option key={m.id} value={String(m.id)}>{m.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Siswa {siswaOptions.length > 0 && `(${siswaOptions.length} tersedia)`}
            </label>
            <select
              value={formData.siswa_id}
              onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
              disabled={loadingOptions}
            >
              <option value="">{loadingOptions ? 'Memuat...' : 'Pilih Siswa'}</option>
              {siswaOptions.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.nama} - {s.institusi}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => navigate('/DataMentorSiswa')} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
              Kembali
            </button>
            <button type="submit" disabled={submitting || loadingOptions} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
              {submitting ? 'Mengupdate...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMentorSiswa;
