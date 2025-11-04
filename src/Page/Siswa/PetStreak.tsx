import React, { useEffect, useState } from 'react'

interface StreakData {
  current_streak: number
  best_streak: number
  last_activity_date: string | null
}

interface PointsSummary {
  total_points: number
  streak: StreakData
}

interface AllSiswaData {
  total_all_siswa: number
}

const PetStreak: React.FC = () => {
  const [data, setData] = useState<PointsSummary>({ total_points: 0, streak: { current_streak: 0, best_streak: 0, last_activity_date: null } })
  const [hidden, setHidden] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [ranking, setRanking] = useState<{ rank: number; total_siswa: number } | null>(null)
  const [allSiswaData, setAllSiswaData] = useState<AllSiswaData>({ total_all_siswa: 0 })

  // Compute pet growth (evolution) from streak and points
  const computePetMetrics = (streakVal: number, totalPoints: number) => {
    const s = Number(streakVal) || 0
    const p = Number(totalPoints) || 0

    // Level via streak (kejar konsistensi)
    let levelFromStreak = 1
    if (s >= 35) levelFromStreak = 5
    else if (s >= 20) levelFromStreak = 4
    else if (s >= 10) levelFromStreak = 3
    else if (s >= 5) levelFromStreak = 2

    // Level via points (sesuai ketentuan):
    // L1 ≥ 100, L2 ≥ 200, L3 ≥ 350, L4 ≥ 500, L5 ≥ 750
    let levelFromPoints = 1
    if (p >= 750) levelFromPoints = 5
    else if (p >= 500) levelFromPoints = 4
    else if (p >= 350) levelFromPoints = 3
    else if (p >= 200) levelFromPoints = 2
    else if (p >= 100) levelFromPoints = 1

    // Ambil level tertinggi agar progres terasa rewarding
    const level = Math.max(levelFromStreak, levelFromPoints)

    const sizeMap = { 1: 40, 2: 52, 3: 66, 4: 82, 5: 100 }
    const petSizePx = sizeMap[level as 1|2|3|4|5]
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

  const metrics = computePetMetrics(data.streak.current_streak, data.total_points)

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await fetch('http://localhost:3000/api/siswa/points/me', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) return
        const json = await res.json()
        if (json && json.success && json.data) {
          setData({ total_points: json.data.total_points || 0, streak: json.data.streak || { current_streak: 0, best_streak: 0, last_activity_date: null } })
        }
      } catch (e) {
        // ignore
      }
    }
    const fetchRanking = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await fetch('http://localhost:3000/api/siswa/streak/ranking', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) return
        const json = await res.json()
        if (json && json.success && json.data) {
          setRanking({ rank: json.data.rank || 0, total_siswa: json.data.total_siswa || 0 })
        }
      } catch (e) {
        // ignore
      }
    }
    const fetchAllSiswaData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await fetch('http://localhost:3000/api/dashboard-all-siswa', {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        if (!res.ok) return
        const data = await res.json()
        if (data) {
          setAllSiswaData({ total_all_siswa: data.total_all_siswa || 0 })
        }
      } catch (e) {
        // ignore
      }
    }
    fetchPoints()
    fetchRanking()
    fetchAllSiswaData()
  }, [])

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
        <div className="rounded-2xl shadow-xl border border-gray-700/60 bg-gray-900/95 backdrop-blur-md text-white w-72 p-3 select-none">
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
              <button onClick={() => setShowInfo(!showInfo)} className="text-gray-300 hover:text-white px-2" title="Info poin & level">ℹ️</button>
              <button onClick={() => setExpanded(false)} className="text-gray-300 hover:text-white px-2" title="Minimize">—</button>
              {/* <button onClick={() => setHidden(true)} className="text-gray-400 hover:text-white px-2">✕</button> */}
            </div>
          </div>

          {showInfo && (
            <div className="mt-2 text-xs bg-gray-800/80 border border-gray-700/70 rounded-lg p-3 space-y-2">
              <div className="font-semibold text-white/90">Aturan Level (berdasar poin)</div>
              <ul className="list-disc list-inside text-gray-300/90 space-y-0.5">
                <li> 🥚 Level 1: ≥ 100 poin</li>
                <li> 🐣 Level 2: ≥ 200 poin</li>
                <li> 🐥 Level 3: ≥ 350 poin</li>
                <li> 🐔 Level 4: ≥ 500 poin</li>
                <li> 🐓 Level 5: ≥ 750 poin</li>
              </ul>
              <div className="font-semibold text-white/90 pt-1">Aturan Poin</div>
              <ul className="list-disc list-inside text-gray-300/90 space-y-0.5">
                <li>Absensi: Masuk 10 poin, Terlambat 5 poin, Tidak masuk 0 poin</li>
                <li>Tugas: Tepat waktu 20 poin, Terlambat 10 poin, Tidak mengumpulkan 0 poin</li>
              </ul>
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
                  Rekor {data.streak.best_streak}
                  {allSiswaData && allSiswaData.total_all_siswa > 0 && (
                    <span className="ml-1 text-gray-500">({allSiswaData.total_all_siswa})</span>
                  )}
                  {ranking && ranking.total_siswa > 0 && (
                    <span className="block mt-0.5">#{ranking.rank} dari {ranking.total_siswa} siswa</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-800/70 rounded-lg p-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">🏅</span>
                <span className="text-sm">Total Poin</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-extrabold">{data.total_points}</div>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-gray-400">
              Raih +10 poin per hari untuk mempertahankan streak.
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


