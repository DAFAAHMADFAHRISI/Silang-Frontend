import React, { useEffect, useState } from 'react'
import { certificateAPI } from '../../../services/api'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000'

interface StreakData {
    current_streak: number
    best_streak: number
    last_activity_date: string | null
}

interface PointsSummary {
    total_points: number
    streak: StreakData
}

interface RankingData {
    rank: number
    total_siswa: number
}

const SiswaSertifikat: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [statusMagang, setStatusMagang] = useState<string>('')
    const [mulai, setMulai] = useState<string | undefined>()
    const [selesai, setSelesai] = useState<string | undefined>()
    const [nama, setNama] = useState<string>('')
    const [status, setStatus] = useState<string>('')

    // Pet Streak state
    const [pointsSummary, setPointsSummary] = useState<PointsSummary>({
        total_points: 0,
        streak: { current_streak: 0, best_streak: 0, last_activity_date: null }
    })
    const [ranking, setRanking] = useState<RankingData | null>(null)
    const [streakLoading, setStreakLoading] = useState<boolean>(true)

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

        // Fetch Pet Streak data
        const fetchStreakData = async () => {
            try {
                setStreakLoading(true)
                const token = localStorage.getItem('token')
                if (!token) return

                // Fetch points & streak
                const pointsRes = await fetch(`${API_BASE_URL}/api/siswa/points/me`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (pointsRes.ok) {
                    const pointsJson = await pointsRes.json()
                    if (pointsJson?.success && pointsJson?.data) {
                        const streakRaw = pointsJson.data.streak || {}
                        setPointsSummary({
                            total_points: pointsJson.data.total_points || 0,
                            streak: {
                                current_streak: streakRaw.current_streak ?? streakRaw.streak_saat_ini ?? 0,
                                best_streak: streakRaw.best_streak ?? streakRaw.streak_terbaik ?? 0,
                                last_activity_date: streakRaw.last_activity_date ?? streakRaw.tanggal_aktivitas_terakhir ?? null
                            }
                        })
                    }
                }

                // Fetch ranking
                const rankRes = await fetch(`${API_BASE_URL}/api/siswa/streak/ranking`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (rankRes.ok) {
                    const rankJson = await rankRes.json()
                    if (rankJson?.success && rankJson?.data) {
                        setRanking({
                            rank: rankJson.data.rank || 0,
                            total_siswa: rankJson.data.total_siswa || 0
                        })
                    }
                }
            } catch (e) {
                console.error('Error fetching streak data:', e)
            } finally {
                setStreakLoading(false)
            }
        }

        fetchStreakData()

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
                <>
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

                    {/* Pet Streak Section */}
                    <div className="mt-6 border border-gray-800 rounded-lg bg-gray-900/40 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-800">
                            <h2 className="text-white text-lg font-semibold flex items-center gap-2">
                                <span>🐾</span> Pet Streak & Poin
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">Ringkasan poin dan streak selama magang</p>
                        </div>

                        {streakLoading ? (
                            <div className="px-5 py-6 text-gray-400 text-sm text-center">Memuat data streak...</div>
                        ) : (
                            <>
                                <div className="grid md:grid-cols-3 gap-0">
                                    {/* Total Poin */}
                                    <div className="px-5 py-4 border-b md:border-b-0 md:border-r border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-yellow-300 text-lg">🏅</span>
                                            <div className="text-gray-400 text-sm">Total Poin</div>
                                        </div>
                                        <div className="text-white text-2xl font-bold">{pointsSummary.total_points}</div>
                                    </div>

                                    {/* Current Streak */}
                                    <div className="px-5 py-4 border-b md:border-b-0 md:border-r border-gray-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-orange-400 text-lg">🔥</span>
                                            <div className="text-gray-400 text-sm">Streak</div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-white text-2xl font-bold">{pointsSummary.streak.current_streak}</span>
                                            <span className="text-gray-400 text-sm">hari</span>
                                        </div>
                                        {ranking && ranking.total_siswa > 0 && (
                                            <div className="mt-1 text-xs text-gray-400">
                                                {ranking.rank} dari {ranking.total_siswa} siswa
                                            </div>
                                        )}
                                    </div>

                                    {/* Best Streak */}
                                    <div className="px-5 py-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-purple-400 text-lg">⭐</span>
                                            <div className="text-gray-400 text-sm">Streak Terbaik</div>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-white text-2xl font-bold">{pointsSummary.streak.best_streak}</span>
                                            <span className="text-gray-400 text-sm">hari</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ranking Banner */}
                                {ranking && ranking.total_siswa > 0 && (
                                    <div className="px-5 py-3 bg-gray-900/50 border-t border-gray-800 flex items-center gap-3">
                                        <span className="text-orange-400">🔥</span>
                                        <span className="text-gray-300 text-sm font-medium">Streak</span>
                                        <span className="text-gray-500 text-sm ml-auto">{ranking.rank} dari {ranking.total_siswa} siswa</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default SiswaSertifikat


