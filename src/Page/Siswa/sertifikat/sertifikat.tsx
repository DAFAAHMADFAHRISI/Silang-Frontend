import React, { useEffect, useState } from 'react'
import { certificateAPI } from '../../../services/api'

const SiswaSertifikat: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [statusMagang, setStatusMagang] = useState<string>('')
    const [mulai, setMulai] = useState<string | undefined>()
    const [selesai, setSelesai] = useState<string | undefined>()
    const [nama, setNama] = useState<string>('')
    const [status, setStatus] = useState<string>('')

    useEffect(() => {
        let mounted = true
        setLoading(true)
        setError('')
        certificateAPI
            .getSiswaMagangStatus()
            .then((res) => {
                if (!mounted) return
                const d = res.data
                setStatusMagang(d.status_magang)
                setMulai(d.tanggal_mulai_magang)
                setSelesai(d.tanggal_selesai_magang)
                setNama(d.nama)
                setStatus(d.status)
            })
            .catch((e) => setError(e?.response?.data?.message || 'Gagal memuat status magang'))
            .finally(() => setLoading(false))
        return () => {
            mounted = false
        }
    }, [])

    const handleDownload = () => {
        const url = certificateAPI.getOwnCertificatePdfUrl()
        const token = localStorage.getItem('token')
        fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
            .then(async (resp) => {
                if (!resp.ok) throw new Error((await resp.text()) || 'Gagal mengunduh sertifikat')
                return resp.blob()
            })
            .then((blob) => {
                const objectUrl = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = objectUrl
                a.download = `sertifikat-${nama || 'saya'}.pdf`
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(objectUrl)
            })
            .catch((e) => setError(e.message || 'Gagal mengunduh sertifikat'))
    }

    const format = (d?: string) =>
        d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'

    return (
        <div className="p-4">
            <h1 className="text-2xl font-semibold mb-6 text-white">Sertifikat Saya</h1>
            {loading && <div className="text-gray-200">Memuat data...</div>}
            {error && !loading && <div className="text-red-400 mb-3">{error}</div>}
            {!loading && (
                <div className="border border-gray-800 rounded-lg bg-gray-900/40 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                        <div>
                            <div className="text-gray-300 text-sm">Nama</div>
                            <div className="text-white text-lg font-semibold">{nama || '-'}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${statusMagang === 'Selesai' ? 'bg-green-600/20 text-green-300 border border-green-600/40' : 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/40'}`}>
                            {statusMagang || '-'}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-0">
                        <div className="px-5 py-4 border-b md:border-b-0 md:border-r border-gray-800">
                            <div className="text-gray-400 text-sm mb-1">Periode Magang</div>
                            <div className="text-gray-200 font-medium">{format(mulai)} <span className="text-gray-500">-</span> {format(selesai)}</div>
                        </div>
                        <div className="px-5 py-4">
                            <div className="text-gray-400 text-sm mb-1">Status Akhir</div>
                            <div className="text-gray-200 font-medium capitalize">{status || '-'}</div>
                        </div>
                    </div>

                    <div className="px-5 py-4 bg-gray-900/50 border-t border-gray-800 flex items-center justify-between">
                        <div className="text-gray-400 text-sm">Unduh sertifikat kelulusan Anda dalam format PDF.</div>
                        <button
                            onClick={handleDownload}
                            disabled={status !== 'lulus'}
                            className={`px-4 py-2 rounded shadow ${status === 'lulus' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                        >
                            Download Sertifikat
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SiswaSertifikat


