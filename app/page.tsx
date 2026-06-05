"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/use-auth"
import { matchesApi, predictionsApi, jackpotRequestsApi, authApi } from "@/lib/api"
import { UserHeader } from "@/components/quiniela/user-header"
import { Podium } from "@/components/quiniela/podium"
import { MatchFeed } from "@/components/quiniela/match-feed"
import { Leaderboard } from "@/components/quiniela/leaderboard"
import { UserProfileModal } from "@/components/quiniela/user-profile-modal"
import { Trophy, LogOut, Loader2, Gamepad2, Users, Crown, Sparkles } from "lucide-react"

export default function QuinielaDashboard() {
  const { user, token, loading, logout, updateProfileState, refreshUser } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [jackpotRequests, setJackpotRequests] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<"matches" | "leaderboard" | "podium">("matches")

  // Fetch all dashboard data from backend
  const fetchDashboardData = async () => {
    if (!token) return
    setIsLoadingData(true)
    try {
      const [matchesRes, predictionsRes, requestsRes, leaderboardRes] = await Promise.all([
        matchesApi.getAll(),
        predictionsApi.getMyPredictions(),
        jackpotRequestsApi.getMyRequests(),
        authApi.getLeaderboard()
      ])

      setMatches(matchesRes)
      setPredictions(predictionsRes)
      setJackpotRequests(requestsRes)
      setLeaderboard(leaderboardRes)
    } catch (err) {
      console.error("Error cargando datos del dashboard:", err)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token])

  // Save prediction handler
  const handleSavePrediction = async (matchId: string, type: 'general' | 'jackpot', scoreHome: number, scoreAway: number) => {
    try {
      await predictionsApi.createOrUpdate({
        matchId,
        type,
        predictedScore: { home: scoreHome, away: scoreAway }
      })
      // Refresh predictions
      const predictionsRes = await predictionsApi.getMyPredictions()
      setPredictions(predictionsRes)
      await refreshUser()
    } catch (err: any) {
      alert(err.message || "Error al guardar la predicción")
      throw err
    }
  }

  // Request jackpot entry handler
  const handleJackpotRequest = async (matchId: string) => {
    try {
      await jackpotRequestsApi.request(matchId)
      // Refresh requests list
      const requestsRes = await jackpotRequestsApi.getMyRequests()
      setJackpotRequests(requestsRes)
    } catch (err: any) {
      alert(err.message || "Error al solicitar ingreso al jackpot")
      throw err
    }
  }

  // Save user profile changes
  const handleProfileSave = async (updates: { nickname: string; avatar?: string }) => {
    try {
      await authApi.updateProfile({
        nickname: updates.nickname,
        avatarUrl: updates.avatar
      })
      updateProfileState({
        nickname: updates.nickname,
        avatarUrl: updates.avatar
      })
      // Refresh leaderboard list to show updated names
      const leaderboardRes = await authApi.getLeaderboard()
      setLeaderboard(leaderboardRes)
    } catch (err: any) {
      alert(err.message || "Error al actualizar perfil")
      throw err
    }
  }

  // Calculate current user rank dynamically from leaderboard
  const getGlobalRank = () => {
    if (!user || leaderboard.length === 0) return 99
    const index = leaderboard.findIndex(u => u.nickname === user.nickname)
    return index !== -1 ? index + 1 : leaderboard.length + 1
  }

  // Map users list to Leaderboard format
  const mappedLeaderboard = leaderboard.map((u, idx) => ({
    rank: idx + 1,
    avatar: u.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.nickname}`,
    nickname: u.nickname,
    points: u.totalPoints || 0,
    trend: "same" as const,
  }))

  if (loading || (token && isLoadingData && matches.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-neon-purple/20 blur-[100px] animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-neon-purple animate-spin" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-muted-foreground font-semibold text-sm tracking-wider uppercase"
          >
            Cargando Quiniela...
          </motion.p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const currentUserProps = {
    avatar: user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.nickname}`,
    nickname: user.nickname,
    email: user.email,
    globalRank: getGlobalRank(),
    totalPoints: user.totalPoints,
    paymentStatus: user.isEnrolledGeneral ? ("active" as const) : ("pending" as const),
    favoriteTeams: user.favoriteTeams,
    gender: user.gender,
    age: user.age,
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-12">
      {/* Animated background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-neon-purple/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-neon-lime/20 blur-[120px]"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-6 md:mb-8 glass p-3.5 rounded-2xl border-white/10">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-neon-orange" />
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
              <span className="text-neon-purple neon-text-purple">Quiniela</span>
              <span className="text-neon-lime neon-text-lime">SIS 2026</span>
            </h1>
            <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce" />
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-all text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>

        {/* User Stats Summary Header */}
        <div className="mb-6">
          <UserHeader 
            {...currentUserProps} 
            onProfileClick={() => setIsProfileOpen(true)} 
          />
        </div>

        {/* Mobile Tab Switcher (Visible only below lg breakpoint) */}
        <div className="lg:hidden flex gap-2 p-1 mb-6 rounded-2xl bg-muted/40 glass border-white/5">
          <button
            onClick={() => setMobileTab("matches")}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all
              ${mobileTab === "matches"
                ? "bg-neon-purple text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Gamepad2 className="w-4 h-4" />
            Partidos
          </button>
          <button
            onClick={() => setMobileTab("leaderboard")}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all
              ${mobileTab === "leaderboard"
                ? "bg-neon-lime text-background shadow-md"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Users className="w-4 h-4" />
            Tabla
          </button>
          <button
            onClick={() => setMobileTab("podium")}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all
              ${mobileTab === "podium"
                ? "bg-neon-orange text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Crown className="w-4 h-4" />
            Podio
          </button>
        </div>

        {/* Layout for Large Screens (Desktop Grid) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column - Podium */}
          <div className="lg:col-span-4 xl:col-span-3">
            <Podium players={mappedLeaderboard} />
          </div>

          {/* Center Column - Match Feed */}
          <div className="lg:col-span-5 xl:col-span-6">
            <MatchFeed 
              matches={matches}
              predictions={predictions}
              jackpotRequests={jackpotRequests}
              isGeneralPaid={user.isEnrolledGeneral}
              onSavePrediction={handleSavePrediction}
              onJackpotRequest={handleJackpotRequest}
            />
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:col-span-3">
            <Leaderboard 
              players={mappedLeaderboard} 
              currentUserNickname={user.nickname} 
            />
          </div>
        </div>

        {/* Layout for Mobile Screens (Renders only selected tab) */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            {mobileTab === "matches" && (
              <motion.div
                key="mob-matches"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <MatchFeed 
                  matches={matches}
                  predictions={predictions}
                  jackpotRequests={jackpotRequests}
                  isGeneralPaid={user.isEnrolledGeneral}
                  onSavePrediction={handleSavePrediction}
                  onJackpotRequest={handleJackpotRequest}
                />
              </motion.div>
            )}

            {mobileTab === "leaderboard" && (
              <motion.div
                key="mob-leaderboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <Leaderboard 
                  players={mappedLeaderboard} 
                  currentUserNickname={user.nickname} 
                />
              </motion.div>
            )}

            {mobileTab === "podium" && (
              <motion.div
                key="mob-podium"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <Podium players={mappedLeaderboard} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-xs text-muted-foreground"
        >
          <p>Quiniela SIS GT 2026 • Desarrollado con Pasión • Juega Responsablemente</p>
        </motion.footer>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUserProps}
        onSave={handleProfileSave}
      />
    </div>
  )
}
