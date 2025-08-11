import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

interface GuruOption { id: number; nama: string }
interface SiswaOption { id: number; nama: string }
interface MentorOption { id: number; nama: string }

interface MentorSiswaMap { mentor_id: number; siswa_id: number }

interface GuruSiswaForm {
  guru_id: string;
  siswa_id: string;
}

const TambahGuruSiswa: React.FC = () => {
  const [formData, setFormData] = useState<GuruSiswaForm>({ guru_id: '', siswa_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [guruOptions, setGuruOptions] = useState<GuruOption[]>([]);
  const [siswaOptions, setSiswaOptions] = useState<SiswaOption[]>([]);
  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [mentorSiswaMaps, setMentorSiswaMaps] = useState<MentorSiswaMap[]>([]);
  const navigate = useNavigate();

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

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const headers = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        } as HeadersInit;

        // Fetch guru data
        const guruRes = await fetch('http://localhost:3000/api/guru', { headers });
        if (guruRes.ok) {
          const guruData = await guruRes.json();
          console.log('Raw guru data from API:', guruData);
          const mapped: GuruOption[] = Array.isArray(guruData)
            ? guruData.map((g: any) => ({ id: g.id ?? g.guru_id ?? g.id_guru, nama: g.nama ?? g.nama_guru ?? g.name }))
            : [];
          console.log('Mapped guru options:', mapped);
          const filtered = mapped.filter(opt => opt.id && opt.nama);
          console.log('Filtered guru options:', filtered);
          console.log('About to set guruOptions with:', filtered);
          setGuruOptions(filtered);
          console.log('setGuruOptions called with length:', filtered.length);
        } else {
          console.error('Failed to fetch guru data:', guruRes.status, guruRes.statusText);
        }

        // Fetch siswa data from students endpoint
        const siswaRes = await fetch('http://localhost:3000/api/students', { headers });
        if (siswaRes.ok) {
          const siswaData = await siswaRes.json();
          console.log('Raw siswa data from API:', siswaData);
          const mapped: SiswaOption[] = Array.isArray(siswaData)
            ? siswaData.map((s: any) => ({ id: s.id ?? s.siswa_id ?? s.id_siswa, nama: s.nama ?? s.nama_siswa ?? s.name }))
            : [];
          console.log('Mapped siswa options:', mapped);
          const filtered = mapped.filter(opt => opt.id && opt.nama);
          console.log('Filtered siswa options:', filtered);
          console.log('About to set siswaOptions with:', filtered);
          setSiswaOptions(filtered);
          console.log('setSiswaOptions called with length:', filtered.length);
        } else {
          console.error('Failed to fetch siswa data:', siswaRes.status, siswaRes.statusText);
        }

        // Fetch mentor data
        const mentorsRes = await fetch('http://localhost:3000/api/mentors', { headers });
        if (mentorsRes.ok) {
          const mentorData = await mentorsRes.json();
          const mapped: MentorOption[] = Array.isArray(mentorData)
            ? mentorData.map((m: any) => ({ id: m.id ?? m.mentor_id ?? m.id_mentor, nama: m.nama ?? m.nama_mentor ?? m.name }))
            : [];
          setMentorOptions(mapped.filter(opt => opt.id && opt.nama));
        }

        // Fetch mentor-siswa mapping
        const mentorSiswaRes = await fetch('http://localhost:3000/api/mentor-siswa', { headers });
        if (mentorSiswaRes.ok) {
          const msData = await mentorSiswaRes.json();
          const mapped: MentorSiswaMap[] = Array.isArray(msData)
            ? msData.map((r: any) => ({ mentor_id: Number(r.mentor_id ?? r.id_mentor ?? r.mentor?.id), siswa_id: Number(r.siswa_id ?? r.id_siswa ?? r.siswa?.id) }))
            : [];
          setMentorSiswaMaps(mapped.filter(r => r.mentor_id && r.siswa_id));
        }

        // Fallback: only if primary endpoints failed to return data
        let needFallback = false;
        if (!guruRes.ok || !siswaRes.ok) {
          needFallback = true;
        }

        if (needFallback) {
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            if (Array.isArray(rekap)) {
              // Fallback for guru if primary failed
              if (!guruRes.ok) {
                const guruFromRekap: GuruOption[] = rekap.map((g: any) => ({ id: g.guru_id, nama: g.nama_guru })).filter((g: GuruOption) => g.id && g.nama);
                if (guruFromRekap.length) setGuruOptions(guruFromRekap);
              }
              
              // Fallback for siswa if primary failed
              if (!siswaRes.ok) {
                const siswaSet: Record<number, string> = {};
                rekap.forEach((g: any) => {
                  (g.siswa || []).forEach((s: any) => {
                    if (s && (s.id ?? s.siswa_id)) {
                      const sid = Number(s.id ?? s.siswa_id);
                      siswaSet[sid] = s.nama_siswa ?? s.nama ?? '';
                    }
                  });
                });
                const siswaFromRekap: SiswaOption[] = Object.entries(siswaSet).map(([id, nama]) => ({ id: Number(id), nama: String(nama) })).filter(x => x.id && x.nama);
                if (siswaFromRekap.length) setSiswaOptions(siswaFromRekap);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Gagal memuat opsi guru/siswa, pastikan endpoint tersedia.');
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  // Debug: log when siswaOptions changes
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
      const [guruLiveRes, siswaLiveRes] = await Promise.all([
        fetch('http://localhost:3000/api/guru', { headers }),
        fetch('http://localhost:3000/api/students', { headers }),
      ]);

      const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
      const selectedGuruName = normalize(guruOptions.find(g => String(g.id) === formData.guru_id)?.nama);
      const selectedSiswaName = normalize(siswaOptions.find(s => String(s.id) === formData.siswa_id)?.nama);

      let guruIdToSend = formData.guru_id;
      let siswaIdToSend = formData.siswa_id;

      if (guruLiveRes.ok && selectedGuruName) {
        const guruLive = await guruLiveRes.json();
        const foundGuru = Array.isArray(guruLive)
          ? guruLive.find((g: any) => normalize(g.nama ?? g.nama_guru ?? g.name) === selectedGuruName)
          : undefined;
        if (foundGuru) guruIdToSend = String(foundGuru.id ?? foundGuru.guru_id ?? foundGuru.id_guru);
        else {
          // Fallback to rekap for guru
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            const g = Array.isArray(rekap) ? rekap.find((x: any) => normalize(x.nama_guru) === selectedGuruName) : undefined;
            if (g) guruIdToSend = String(g.guru_id);
          }
        }
      }

      if (siswaLiveRes.ok && selectedSiswaName) {
        const siswaLive = await siswaLiveRes.json();
        let foundSiswa = Array.isArray(siswaLive)
          ? siswaLive.find((s: any) => normalize(s.nama ?? s.nama_siswa ?? s.name) === selectedSiswaName)
          : undefined;
        if (!foundSiswa) {
          // Fallback to siswa-mentor
          const siswaMentorRes = await fetch('http://localhost:3000/api/siswa-mentor', { headers });
          if (siswaMentorRes.ok) {
            const list = await siswaMentorRes.json();
            foundSiswa = Array.isArray(list)
              ? list.find((s: any) => normalize(s.nama ?? s.nama_siswa ?? s.name) === selectedSiswaName)
              : undefined;
          }
        }
        if (!foundSiswa) {
          // Fallback to rekap
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            let sid: number | undefined;
            if (Array.isArray(rekap)) {
              rekap.some((g: any) => {
                const hit = (g.siswa || []).find((s: any) => normalize(s.nama_siswa ?? s.nama ?? s.name) === selectedSiswaName);
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
      body.append('guru_id', guruIdToSend);
      body.append('siswa_id', siswaIdToSend);

      const res = await fetch('http://localhost:3000/api/guru-siswa/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body,
      } as RequestInit);

      if (!res.ok) throw new Error(`Gagal menambahkan data: ${res.status} ${res.statusText}`);

      navigate('/DataGuruSiswa');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan data guru-siswa.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4 flex items-center space-x-2">
        <Users className="w-6 h-6 text-blue-400" />
        <span>Tambah Guru - Siswa</span>
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
              Guru
            </label>
            <select
              value={formData.guru_id}
              onChange={(e) => setFormData({ ...formData, guru_id: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
              disabled={loadingOptions}
            >
              <option value="">{loadingOptions ? 'Memuat...' : 'Pilih Guru'}</option>
              {guruOptions.map((g) => (
                <option key={g.id} value={String(g.id)}>{g.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Siswa 
            </label>
            <select
              value={formData.siswa_id}
              onChange={(e) => setFormData({ ...formData, siswa_id: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
              disabled={loadingOptions}
            >
              <option value="">{loadingOptions ? 'Memuat...' : 'Pilih Siswa'}</option>
              {siswaOptions.map((s) => {
                const rel = mentorSiswaMaps.find(r => r.siswa_id === s.id);
                const mentorName = rel ? mentorOptions.find(m => m.id === rel.mentor_id)?.nama : undefined;
                const label = mentorName ? `${s.nama} - Mentor: ${mentorName}` : s.nama;
                return (
                  <option key={s.id} value={String(s.id)}>{label}</option>
                );
              })}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={() => navigate('/DataGuruSiswa')} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors">
              Kembali
            </button>
            <button type="submit" disabled={submitting || loadingOptions} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
              {submitting ? 'Menambahkan...' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahGuruSiswa;
