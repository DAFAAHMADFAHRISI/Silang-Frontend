import React, { useEffect, useState } from 'react'

interface StreakData {
  current_streak: number
  best_streak: number
  last_activity_date: string | null
}

interface PointsSummary {
  total_points: number
  koin: number
  streak: StreakData
  max_points?: number
  diff_days?: number
}

interface PointsHistoryItem {
  id: number
  source_type: 'absensi' | 'tugas'
  source_id: number
  points: number
  reason: string
  event_date: string
  created_at: string
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000'

const PetStreak: React.FC = () => {
  const [data, setData] = useState<PointsSummary>({ total_points: 0, koin: 0, streak: { current_streak: 0, best_streak: 0, last_activity_date: null } })
  const [hidden, setHidden] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [ranking, setRanking] = useState<{ rank: number; total_siswa: number } | null>(null)
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Compute pet growth (evolution) from streak and points
  const computePetMetrics = (streakVal: number, totalPoints: number, maxPointsVal?: number) => {
    const s = Number(streakVal) || 0
    const p = Number(totalPoints) || 0
    const maxPoints = Number(maxPointsVal) || 750

    // Level via streak (kejar konsistensi)
    let levelFromStreak = 1
    if (s >= 35) levelFromStreak = 5
    else if (s >= 20) levelFromStreak = 4
    else if (s >= 10) levelFromStreak = 3
    else if (s >= 5) levelFromStreak = 2

    // Level via points (sesuai ketentuan, diskalakan berdasarkan maksimal poin):
    // L1: 13%, L2: 26%, L3: 46%, L4: 66%, L5: 90%
    let levelFromPoints = 1
    const l5 = Math.round(maxPoints * 0.9)
    const l4 = Math.round(maxPoints * 0.66)
    const l3 = Math.round(maxPoints * 0.46)
    const l2 = Math.round(maxPoints * 0.26)
    const l1 = Math.round(maxPoints * 0.13)

    if (p >= l5) levelFromPoints = 5
    else if (p >= l4) levelFromPoints = 4
    else if (p >= l3) levelFromPoints = 3
    else if (p >= l2) levelFromPoints = 2
    else if (p >= l1) levelFromPoints = 1

    // Ambil level tertinggi agar progres terasa rewarding
    const level = Math.max(levelFromStreak, levelFromPoints)

    const sizeMap = { 1: 40, 2: 52, 3: 66, 4: 82, 5: 100 }
    const petSizePx = sizeMap[level as 1 | 2 | 3 | 4 | 5]
    const emojiSizePx = Math.round(petSizePx * 0.55)
    // Skin: telur -> anak ayam -> ayam kecil -> ayam sedang -> ayam besar
    const skinMap: Record<number, string> = {
      1: '🥚',
      2: '🐣',
      3: '🐥',
      4: '🐔',
      5: '🐓',
    }
    // Path gambar pet (jika menggunakan gambar, uncomment dan sesuaikan path)
    // const imageMap: Record<number, string> = {
    //   1: '/images/pets/level1.png',
    //   2: '/images/pets/level2.png',
    //   3: '/images/pets/level3.png',
    //   4: '/images/pets/level4.png',
    //   5: '/images/pets/level5.png',
    // }
    const emoji = skinMap[level] || '🐔'
    // const petImage = imageMap[level] || null // Uncomment jika menggunakan gambar
    return { level, petSizePx, emojiSizePx, emoji }
  }

  const metrics = computePetMetrics(data.streak.current_streak, data.total_points, data.max_points)

  const fetchPoints = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Token tidak ditemukan')
        return
      }

      const res = await fetch(`${API_BASE_URL}/api/siswa/points/me`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const json = await res.json()
      if (json && json.success && json.data) {
        setData({
          total_points: json.data.total_points || 0,
          koin: json.data.koin || 0,
          max_points: json.data.max_points || 0,
          diff_days: json.data.diff_days || 0,
          streak: json.data.streak || {
            current_streak: 0,
            best_streak: 0,
            last_activity_date: null
          }
        })
      }
    } catch (e) {
      console.error('Error fetching points:', e)
      setError('Gagal memuat data poin')
    } finally {
      setLoading(false)
    }
  }

  const fetchRanking = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const res = await fetch(`${API_BASE_URL}/api/siswa/streak/ranking`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) return

      const json = await res.json()
      if (json && json.success && json.data) {
        setRanking({
          rank: json.data.rank || 0,
          total_siswa: json.data.total_siswa || 0
        })
      }
    } catch (e) {
      console.error('Error fetching ranking:', e)
    }
  }

  const fetchPointsHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Fetch only today's points
      const res = await fetch(`${API_BASE_URL}/api/siswa/points/history?today=true`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) return

      const json = await res.json()
      if (json && json.success && json.data) {
        setPointsHistory(json.data || [])
      }
    } catch (e) {
      console.error('Error fetching points history:', e)
    }
  }

  useEffect(() => {
    fetchPoints()
    fetchRanking()
  }, [])

  // Auto-refresh data every 30 seconds when expanded
  useEffect(() => {
    if (!expanded) return

    const interval = setInterval(() => {
      fetchPoints()
      fetchRanking()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [expanded])

  // Fetch history when showHistory is toggled
  useEffect(() => {
    if (showHistory && pointsHistory.length === 0) {
      fetchPointsHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHistory])

  // Periodic gentle jump animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(true)
      const timeout = setTimeout(() => setIsBouncing(false), 900)
      return () => clearTimeout(timeout)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (hidden) return null

  // Jika belum expanded, hanya tampilkan icon saja
  if (!expanded) {
    return (
      <div className="fixed z-50 bottom-6 right-6">
        <div className="relative">
          <button
            onClick={() => setExpanded(true)}
            className={`flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 ${isBouncing ? 'animate-bounce' : ''}`}
            style={{ width: metrics.petSizePx, height: metrics.petSizePx }}
            title={`Klik untuk melihat detail - Level ${metrics.level}`}
          >
            <span style={{ fontSize: metrics.emojiSizePx }}>{metrics.emoji}</span>
            {/* Jika menggunakan gambar, uncomment dan sesuaikan:
            <img 
              src={petImage} 
              alt={`Pet Level ${metrics.level}`}
              style={{ width: metrics.petSizePx, height: metrics.petSizePx, objectFit: 'contain' }}
            />
            */}
          </button>
          {/* Floating hint circle */}
          <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-lg">🔥</div>
        </div>
      </div>
    )
  }

  // Jika expanded, tampilkan detail lengkap
  return (
    <div className="fixed z-50 bottom-6 right-6">
      <div className="relative">
        {/* Pet bubble */}
        <div className="rounded-2xl shadow-xl border border-gray-700/60 bg-gray-900/95 backdrop-blur-md text-white w-[min(18rem,calc(100vw-2rem))] max-w-sm p-3 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center ${isBouncing ? 'animate-bounce' : ''}`}
                style={{ width: metrics.petSizePx, height: metrics.petSizePx, transition: 'all 300ms ease' }}
                title={`Level ${metrics.level}`}
              >
                <span style={{ fontSize: metrics.emojiSizePx }}>{metrics.emoji}</span>
                {/* Jika menggunakan gambar, uncomment dan sesuaikan:
                <img 
                  src={petImage} 
                  alt={`Pet Level ${metrics.level}`}
                  style={{ width: metrics.petSizePx, height: metrics.petSizePx, objectFit: 'contain' }}
                />
                */}
              </div>
              <div>
                <div className="text-sm font-semibold">Pet Streak</div>
                <div className="text-xs text-gray-400">Semangat jaga konsistensi!</div>
                <div className="text-[10px] text-pink-300/80">Level {metrics.level}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setShowHistory(!showHistory)
                  if (!showHistory) fetchPointsHistory()
                }}
                className="text-gray-300 hover:text-white px-2"
                title="Riwayat poin"
              >
                📜
              </button>
              <button onClick={() => setShowInfo(!showInfo)} className="text-gray-300 hover:text-white px-2" title="Info poin & level">ℹ️</button>
              <button onClick={() => setExpanded(false)} className="text-gray-300 hover:text-white px-2" title="Minimize">—</button>
              {/* <button onClick={() => setHidden(true)} className="text-gray-400 hover:text-white px-2">✕</button> */}
            </div>
          </div>

          {showInfo && (
            <div className="mt-2 text-xs bg-gray-800/80 border border-gray-700/70 rounded-lg p-3 space-y-2">
              <div className="font-semibold text-white/90">Aturan Level (berdasar poin)</div>
              <ul className="list-disc list-inside text-gray-300/90 space-y-0.5">
                <li> 🥚 Level 1: ≥ {Math.round((data.max_points || 750) * 0.13)} poin</li>
                <li> 🐣 Level 2: ≥ {Math.round((data.max_points || 750) * 0.26)} poin</li>
                <li> 🐥 Level 3: ≥ {Math.round((data.max_points || 750) * 0.46)} poin</li>
                <li> 🐔 Level 4: ≥ {Math.round((data.max_points || 750) * 0.66)} poin</li>
                <li> 🐓 Level 5: ≥ {Math.round((data.max_points || 750) * 0.9)} poin</li>
              </ul>
              <div className="font-semibold text-white/90 pt-1">Aturan Poin</div>
              <ul className="list-disc list-inside text-gray-300/90 space-y-0.5">
                <li>Absensi: Masuk 10 poin, Terlambat 5 poin, Tidak masuk 0 poin</li>
                <li>Tugas: Tepat waktu 20 poin, Terlambat 10 poin, Tidak mengumpulkan 0 poin</li>
                <li>Total Poin: akumulasi seluruh poin yang pernah didapat</li>
                <li>Poin Tersedia: sisa poin yang bisa dipakai (total dikurangi poin terpakai)</li>
              </ul>
              {data.max_points && (
                <div className="text-[10px] text-yellow-400 font-semibold pt-1 border-t border-gray-700/50 mt-1">
                  Maksimal Poin Magang Anda: {data.max_points} poin ({data.diff_days} Hari)
                </div>
              )}
            </div>
          )}

          {showHistory && (
            <div className="mt-2 text-xs bg-gray-800/80 border border-gray-700/70 rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="font-semibold text-white/90 mb-2">Riwayat Poin Hari Ini</div>
              {pointsHistory.length === 0 ? (
                <div className="text-gray-400 text-center py-2">Belum ada poin hari ini</div>
              ) : (
                <div className="space-y-2">
                  {pointsHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1 border-b border-gray-700/50">
                      <div className="flex-1">
                        <div className="text-white/90">{item.reason}</div>
                        <div className="text-gray-400 text-[10px]">
                          {(() => {
                            const d = new Date(item.created_at || item.event_date);
                            return isNaN(d.getTime())
                              ? 'Tanggal tidak valid'
                              : d.toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                          })()}
                          {' • '}
                          {item.source_type === 'absensi' ? '📅 Absensi' : '📝 Tugas'}
                        </div>
                      </div>
                      <div className={`font-semibold ${item.points > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-2 text-xs bg-red-900/50 border border-red-700/70 rounded-lg p-2 text-red-300">
              {error}
            </div>
          )}

          <div className="mt-3">
            <div className="flex items-center justify-between bg-gray-800/70 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-400">🔥</span>
                <span className="text-sm">Streak</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold">{data.streak.current_streak}</div>
                <div className="text-[10px] text-gray-400">

                  {ranking && ranking.total_siswa > 0 && (
                    <span className="block mt-0.5">{ranking.rank} dari {ranking.total_siswa} siswa</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-800/70 rounded-lg p-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">🏅</span>
                <div>
                  <span className="text-sm">Total Poin</span>
                  <div className="text-[10px] text-gray-400">Akumulasi sepanjang waktu</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold">{data.total_points}</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-800/70 rounded-lg p-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✨</span>
                <div>
                  <span className="text-sm">Poin Tersedia</span>
                  <div className="text-[10px] text-gray-400">Sisa setelah poin dipakai</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold text-emerald-400">{data.koin}</div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-gray-400">
              {loading ? (
                <span className="text-blue-400">Memuat data...</span>
              ) : (
                <>
                  Raih +10 poin per hari untuk mempertahankan streak.
                  {data.streak.current_streak === 0 && data.total_points === 0 && (
                    <span className="block mt-1 text-yellow-400">Mulai absensi atau kumpulkan tugas untuk mulai mendapatkan poin!</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Floating hint circle */}
        <div className="absolute -top-3 -right-3 bg-red-600 text-white text-xs rounded-full px-2 py-0.5 shadow-lg">🔥</div>
      </div>
    </div>
  )
}

export default PetStreak


