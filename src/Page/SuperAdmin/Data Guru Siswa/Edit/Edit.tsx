import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3 } from 'lucide-react';

interface GuruOption { id: number; nama: string }
interface SiswaOption { id: number; nama: string }
interface MentorOption { id: number; nama: string }
interface MentorSiswaMap { mentor_id: number; siswa_id: number }

interface GuruSiswaForm {
  guru_id: string;
  siswa_id: string;
}

interface DetailPayload {
  guru_id?: number;
  siswa_id?: number;
  nama_guru?: string;
  nama_siswa?: string;
  guru?: { id?: number; nama?: string; nama_guru?: string };
  siswa?: { id?: number; nama?: string; nama_siswa?: string };
}

const EditGuruSiswa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<GuruSiswaForm>({ guru_id: '', siswa_id: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [guruOptions, setGuruOptions] = useState<GuruOption[]>([]);
  const [siswaOptions, setSiswaOptions] = useState<SiswaOption[]>([]);
  const [mentorOptions, setMentorOptions] = useState<MentorOption[]>([]);
  const [mentorSiswaMaps, setMentorSiswaMaps] = useState<MentorSiswaMap[]>([]);
  const [detailData, setDetailData] = useState<DetailPayload | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      setError('Anda harus login terlebih dahulu.');
      setLoading(false);
      return;
    }

    if (role !== 'superadmin') {
      setError('Anda tidak memiliki akses ke halaman ini.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        if (!id) throw new Error('ID tidak ditemukan');
        const headers = {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        } as HeadersInit;

        // Load current detail
        const detailRes = await fetch(`http://localhost:3000/api/guru-siswa/${id}`, { headers });
        if (detailRes.ok) {
          const data: DetailPayload = await detailRes.json();
          setDetailData(data);
          setFormData({
            guru_id: String(data.guru_id ?? data.guru?.id ?? ''),
            siswa_id: String(data.siswa_id ?? data.siswa?.id ?? ''),
          });
        }

        // Load options
        setLoadingOptions(true);
        const [guruRes, siswaRes, mentorsRes, mentorSiswaRes] = await Promise.all([
          fetch('http://localhost:3000/api/guru', { headers }),
          fetch('http://localhost:3000/api/siswa', { headers }),
          fetch('http://localhost:3000/api/mentors', { headers }),
          fetch('http://localhost:3000/api/mentor-siswa', { headers }),
        ]);
        if (guruRes.ok) {
          const guruData = await guruRes.json();
          const mapped: GuruOption[] = Array.isArray(guruData)
            ? guruData.map((g: any) => ({ id: g.id ?? g.guru_id ?? g.id_guru, nama: g.nama ?? g.nama_guru ?? g.name }))
            : [];
          setGuruOptions(mapped.filter(opt => opt.id && opt.nama));
        }
        if (siswaRes.ok) {
          const siswaData = await siswaRes.json();
          const mapped: SiswaOption[] = Array.isArray(siswaData)
            ? siswaData.map((s: any) => ({ id: s.id ?? s.siswa_id ?? s.id_siswa, nama: s.nama ?? s.nama_siswa ?? s.name }))
            : [];
          setSiswaOptions(mapped.filter(opt => opt.id && opt.nama));
        }
        if (mentorsRes.ok) {
          const mentorData = await mentorsRes.json();
          const mapped: MentorOption[] = Array.isArray(mentorData)
            ? mentorData.map((m: any) => ({ id: m.id ?? m.mentor_id ?? m.id_mentor, nama: m.nama ?? m.nama_mentor ?? m.name }))
            : [];
          setMentorOptions(mapped.filter(opt => opt.id && opt.nama));
        }
        if (mentorSiswaRes.ok) {
          const msData = await mentorSiswaRes.json();
          const mapped: MentorSiswaMap[] = Array.isArray(msData)
            ? msData.map((r: any) => ({ mentor_id: Number(r.mentor_id ?? r.id_mentor ?? r.mentor?.id), siswa_id: Number(r.siswa_id ?? r.id_siswa ?? r.siswa?.id) }))
            : [];
          setMentorSiswaMaps(mapped.filter(r => r.mentor_id && r.siswa_id));
        }

        // Fallback via /api/rekap when lists are empty
        const needGuru = guruOptions.length === 0;
        const needSiswa = siswaOptions.length === 0;
        const needMentorMap = mentorSiswaMaps.length === 0;
        if (needGuru || needSiswa || needMentorMap) {
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            if (Array.isArray(rekap)) {
              if (needGuru) {
                const guruFromRekap: GuruOption[] = rekap.map((g: any) => ({ id: g.guru_id, nama: g.nama_guru })).filter((g: GuruOption) => g.id && g.nama);
                if (guruFromRekap.length) setGuruOptions(guruFromRekap);
              }
              if (needSiswa || needMentorMap) {
                const siswaSet: Record<number, string> = {};
                const maps: MentorSiswaMap[] = [];
                rekap.forEach((g: any) => {
                  const gid = g.guru_id; const gname = g.nama_guru;
                  (g.siswa || []).forEach((s: any) => {
                    if (s && (s.id ?? s.siswa_id)) {
                      const sid = Number(s.id ?? s.siswa_id);
                      siswaSet[sid] = s.nama_siswa ?? s.nama ?? '';
                      if (gid) maps.push({ mentor_id: Number(gid), siswa_id: sid });
                    }
                  });
                });
                if (needSiswa) {
                  const siswaFromRekap: SiswaOption[] = Object.entries(siswaSet).map(([id, nama]) => ({ id: Number(id), nama: String(nama) })).filter(x => x.id && x.nama);
                  if (siswaFromRekap.length) setSiswaOptions(siswaFromRekap);
                }
                if (needMentorMap && maps.length) setMentorSiswaMaps(maps);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Gagal memuat data/options:', e);
      } finally {
        setLoading(false);
        setLoadingOptions(false);
      }
    };

    load();
  }, [id]);

  // After options load, if IDs are empty but names exist from detail, map names to IDs for preselect
  useEffect(() => {
    if (loadingOptions) return;
    if (!detailData) return;
    const currentGuruId = formData.guru_id;
    const currentSiswaId = formData.siswa_id;

    let nextGuruId = currentGuruId;
    let nextSiswaId = currentSiswaId;

    if (!nextGuruId && (detailData.nama_guru || detailData.guru?.nama || detailData.guru?.nama_guru)) {
      const name = detailData.nama_guru || detailData.guru?.nama || detailData.guru?.nama_guru || '';
      const found = guruOptions.find(g => g.nama === name);
      if (found) nextGuruId = String(found.id);
    }

    if (!nextSiswaId && (detailData.nama_siswa || detailData.siswa?.nama || detailData.siswa?.nama_siswa)) {
      const name = detailData.nama_siswa || detailData.siswa?.nama || detailData.siswa?.nama_siswa || '';
      const found = siswaOptions.find(s => s.nama === name);
      if (found) nextSiswaId = String(found.id);
    }

    if (nextGuruId !== currentGuruId || nextSiswaId !== currentSiswaId) {
      setFormData(prev => ({ ...prev, guru_id: nextGuruId, siswa_id: nextSiswaId }));
    }
  }, [loadingOptions, guruOptions, siswaOptions, detailData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token tidak ditemukan. Silakan login ulang.');
      if (!id) throw new Error('ID tidak ditemukan');

      // Resolve canonical IDs by NAME from live endpoints to avoid stale IDs
      const headers = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      } as HeadersInit;
      const [guruLiveRes, siswaLiveRes] = await Promise.all([
        fetch('http://localhost:3000/api/guru', { headers }),
        fetch('http://localhost:3000/api/siswa', { headers }),
      ]);

      const normalize = (s?: string) => (s ?? '').trim().toLowerCase();
      const selectedGuruName = normalize(
        guruOptions.find(g => String(g.id) === formData.guru_id)?.nama
        || detailData?.nama_guru || detailData?.guru?.nama || detailData?.guru?.nama_guru
      );
      const selectedSiswaName = normalize(
        siswaOptions.find(s => String(s.id) === formData.siswa_id)?.nama
        || detailData?.nama_siswa || detailData?.siswa?.nama || detailData?.siswa?.nama_siswa
      );

      let guruIdToSend = formData.guru_id;
      let siswaIdToSend = formData.siswa_id;

      if (guruLiveRes.ok && selectedGuruName) {
        const guruLive = await guruLiveRes.json();
        let foundGuru = Array.isArray(guruLive)
          ? guruLive.find((g: any) => normalize(g.nama ?? g.nama_guru ?? g.name) === selectedGuruName)
          : undefined;
        if (!foundGuru) {
          const rekapRes = await fetch('http://localhost:3000/api/rekap', { headers });
          if (rekapRes.ok) {
            const rekap = await rekapRes.json();
            const g = Array.isArray(rekap) ? rekap.find((x: any) => normalize(x.nama_guru) === selectedGuruName) : undefined;
            if (g) guruIdToSend = String(g.guru_id);
          }
        } else {
          guruIdToSend = String(foundGuru.id ?? foundGuru.guru_id ?? foundGuru.id_guru);
        }
      }

      if (siswaLiveRes.ok && selectedSiswaName) {
        const siswaLive = await siswaLiveRes.json();
        let foundSiswa = Array.isArray(siswaLive)
          ? siswaLive.find((s: any) => normalize(s.nama ?? s.nama_siswa ?? s.name) === selectedSiswaName)
          : undefined;
        if (!foundSiswa) {
          const siswaMentorRes = await fetch('http://localhost:3000/api/siswa-mentor', { headers });
          if (siswaMentorRes.ok) {
            const list = await siswaMentorRes.json();
            foundSiswa = Array.isArray(list)
              ? list.find((s: any) => normalize(s.nama ?? s.nama_siswa ?? s.name) === selectedSiswaName)
              : undefined;
          }
        }
        if (!foundSiswa) {
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

      const res = await fetch(`http://localhost:3000/api/guru-siswa/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}`,
        },
        body,
      } as RequestInit);

      if (!res.ok) throw new Error(`Gagal mengupdate data: ${res.status} ${res.statusText}`);

      navigate('/DataGuruSiswa');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengupdate data guru-siswa.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-4 flex items-center space-x-2">
        <Edit3 className="w-6 h-6 text-blue-400" />
        <span>Edit Guru - Siswa</span>
      </h1>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Guru</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Siswa</label>
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
              {submitting ? 'Mengupdate...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGuruSiswa;
