import React, { useEffect, useMemo, useState } from 'react'
import { certificateAPI } from '../../../services/api'

type GraduatedStudent = {
    id: number
    nama: string
    institusi?: string
    tanggal_mulai_magang?: string
    tanggal_selesai_magang?: string
    status?: string
}

const Sertifikat: React.FC = () => {
    const [students, setStudents] = useState<GraduatedStudent[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [search, setSearch] = useState<string>('')
    const [selectedYear, setSelectedYear] = useState<number | null>(null)
    const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)

    useEffect(() => {
        let mounted = true
        setLoading(true)
        setError('')
        certificateAPI
            .getGraduatedStudents()
            .then((res) => {
                if (!mounted) return
                setStudents(res.data || [])
            })
            .catch((err) => {
                if (!mounted) return
                setError(err?.response?.data?.message || 'Gagal memuat data siswa lulus')
            })
            .finally(() => mounted && setLoading(false))
        return () => {
            mounted = false
        }
    }, [])

    const years = useMemo(() => {
        const allYears = students
            .map((s) => (s.tanggal_selesai_magang ? new Date(s.tanggal_selesai_magang).getFullYear() : null))
            .filter((y): y is number => !!y)
        return Array.from(new Set(allYears)).sort((a, b) => b - a)
    }, [students])

    const institutionsByYear = useMemo(() => {
        if (selectedYear == null) return [] as string[]
        const names = students
            .filter((s) => s.tanggal_selesai_magang && new Date(s.tanggal_selesai_magang).getFullYear() === selectedYear)
            .map((s) => s.institusi || '-')
        return Array.from(new Set(names)).sort()
    }, [students, selectedYear])

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase()
        let list = students
        if (selectedYear != null) {
            list = list.filter((s) => s.tanggal_selesai_magang && new Date(s.tanggal_selesai_magang).getFullYear() === selectedYear)
        }
        if (selectedInstitution) {
            list = list.filter((s) => (s.institusi || '-') === selectedInstitution)
        }
        if (!term) return list
        return list.filter((s) =>
            s.nama.toLowerCase().includes(term) || (s.institusi || '').toLowerCase().includes(term)
        )
    }, [search, students, selectedYear, selectedInstitution])

    const handleDownload = (id: number, nama: string) => {
        const url = certificateAPI.getCertificatePdfUrl(id)
        // Force download with token in header is tricky; simplest is open in new tab, token is attached by browser? Not for headers.
        // Workaround: create hidden iframe or window.open with Authorization handled by axios is not possible.
        // We'll use an anchor and append token as query for serverless alternative is not implemented; instead we can open new window and rely on cookie-less header not sent.
        // Since backend requires Bearer, we fetch blob with fetch including headers then download.
        const token = localStorage.getItem('token')
        fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
            .then(async (resp) => {
                if (!resp.ok) {
                    const msg = await resp.text()
                    throw new Error(msg || 'Gagal mengunduh sertifikat')
                }
                return resp.blob()
            })
            .then((blob) => {
                const objectUrl = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = objectUrl
                const safe = (nama || 'sertifikat').toLowerCase().replace(/[^a-z0-9\s_-]/g, '').replace(/\s+/g, '_').slice(0, 100)
                a.download = `${safe || 'sertifikat'}.pdf`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(objectUrl)
            })
            .catch((e) => setError(e.message || 'Gagal mengunduh sertifikat'))
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-4 text-white">Sertifikat Kelulusan</h1>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau institusi..."
                    className="border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 rounded px-3 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <select
                    value={selectedYear ?? ''}
                    onChange={(e) => { const v = e.target.value ? parseInt(e.target.value) : null; setSelectedYear(v); setSelectedInstitution(null) }}
                    className="border border-gray-700 bg-gray-800 text-gray-100 rounded px-3 py-2 w-full"
                >
                    <option value="">-- Pilih Tahun --</option>
                    {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
                <select
                    value={selectedInstitution ?? ''}
                    onChange={(e) => setSelectedInstitution(e.target.value || null)}
                    disabled={selectedYear == null}
                    className={`border border-gray-700 bg-gray-800 text-gray-100 rounded px-3 py-2 w-full ${selectedYear == null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <option value="">-- Pilih Institusi --</option>
                    {institutionsByYear.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>
            {loading && <div className="text-gray-200">Memuat data...</div>}
            {error && !loading && (
                <div className="text-red-400 mb-3">{error}</div>
            )}
            {!loading && filtered.length === 0 && (
                <div className="text-gray-300">Tidak ada siswa berstatus lulus.</div>
            )}
            {!loading && filtered.length > 0 && (
                <div className="overflow-auto border border-gray-800 rounded">
                    <table className="min-w-full text-left">
                        <thead className="bg-gray-800 text-gray-100">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Nama</th>
                                <th className="px-4 py-3 font-semibold">Institusi</th>
                                <th className="px-4 py-3 font-semibold">Periode Magang</th>
                                <th className="px-4 py-3 font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-200">
                            {filtered.map((s, idx) => (
                                <tr key={s.id} className={`${idx % 2 === 0 ? 'bg-gray-900/40' : 'bg-gray-900/20'} border-t border-gray-800`}>
                                    <td className="px-4 py-2 whitespace-nowrap font-medium">{s.nama}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{s.institusi || '-'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {(s.tanggal_mulai_magang || s.tanggal_selesai_magang) ? (
                                            <>
                                                {s.tanggal_mulai_magang ? new Date(s.tanggal_mulai_magang).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                                                {' '}-{' '}
                                                {s.tanggal_selesai_magang ? new Date(s.tanggal_selesai_magang).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                                            </>
                                        ) : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => handleDownload(s.id, s.nama)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
                                        >
                                            Download Sertifikat
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Sertifikat

