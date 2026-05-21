import React, { useEffect, useState } from 'react'
import { Award, CheckCircle, AlertCircle, Download, Flame } from 'lucide-react'
import { certificateAPI } from '../../../services/api'
import {
  SISWA_PAGE_CLASS,
  SiswaPageHeader,
  SiswaDivider,
  SiswaLoading,
  SiswaError,
  SiswaStatCard,
  SISWA_STATS_GRID,
} from '../components/SiswaLayout'

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

        const fetchStreakData = async () => {
            try {
                setStreakLoading(true)
                const token = localStorage.getItem('token')
                if (!token) return

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

    if (loading) {
        return <SiswaLoading message="Memuat data sertifikat..." />
    }

    if (error && !nama) {
        return <SiswaError error={error} />
    }

    return (
        <div className={SISWA_PAGE_CLASS}>
            <SiswaPageHeader title="Sertifikat Saya" subtitle="Status magang, poin, dan unduhan sertifikat kelulusan." />

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-600/40 text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-gray-800/70 rounded-xl border border-gray-700/60 overflow-hidden mb-6">
                <div className="px-4 sm:px-5 py-4 border-b border-gray-700/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="text-gray-400 text-xs sm:text-sm">Nama</div>
                        <div className="text-white text-lg sm:text-xl font-semibold truncate">{nama || '-'}</div>
                    </div>
                    <span className={`self-start px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        statusMagang === 'Selesai'
                            ? 'bg-green-900/50 text-green-400 border border-green-600/40'
                            : 'bg-yellow-900/50 text-yellow-400 border border-yellow-600/40'
                    }`}>
                        {statusMagang || '-'}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    <div className="px-4 sm:px-5 py-4 border-b sm:border-b-0 sm:border-r border-gray-700/60">
                        <div className="text-gray-400 text-xs sm:text-sm mb-1">Periode Magang</div>
                        <div className="text-gray-200 font-medium text-sm sm:text-base">
                            {format(mulai)} <span className="text-gray-500">–</span> {format(selesai)}
                        </div>
                    </div>
                    <div className="px-4 sm:px-5 py-4">
                        <div className="text-gray-400 text-xs sm:text-sm mb-1">Status Akhir</div>
                        <div className="text-gray-200 font-medium capitalize text-sm sm:text-base">{status || '-'}</div>
                    </div>
                </div>

                <div className="px-4 sm:px-5 py-4 bg-gray-900/50 border-t border-gray-700/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-gray-400 text-xs sm:text-sm">
                        Unduh sertifikat kelulusan dalam format PDF.
                    </p>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={status !== 'lulus'}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                            status === 'lulus'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Download className="w-4 h-4" />
                        Download Sertifikat
                    </button>
                </div>
            </div>

            <SiswaDivider />

            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Pet Streak & Poin
            </h2>

            {streakLoading ? (
                <p className="text-gray-400 text-sm text-center py-6">Memuat data streak...</p>
            ) : (
                <>
                    <div className={SISWA_STATS_GRID}>
                        <SiswaStatCard
                            label="Total Poin"
                            value={pointsSummary.total_points}
                            valueClassName="text-yellow-400"
                            icon={<Award className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-400" />}
                        />
                        <SiswaStatCard
                            label="Streak"
                            value={`${pointsSummary.streak.current_streak} hari`}
                            valueClassName="text-orange-400"
                            icon={<Flame className="w-7 h-7 sm:w-8 sm:h-8 text-orange-400" />}
                        />
                        <SiswaStatCard
                            label="Streak Terbaik"
                            value={`${pointsSummary.streak.best_streak} hari`}
                            valueClassName="text-purple-400"
                            icon={<CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />}
                        />
                        {ranking && ranking.total_siswa > 0 && (
                            <SiswaStatCard
                                label="Peringkat"
                                value={`${ranking.rank} / ${ranking.total_siswa}`}
                                icon={<AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default SiswaSertifikat
