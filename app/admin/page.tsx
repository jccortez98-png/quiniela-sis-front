"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { matchesApi, jackpotRequestsApi, authApi } from "@/lib/api"
import { 
  Trophy, Shield, Users, CreditCard, 
  Search, CheckCircle, Clock, X, AlertCircle,
  ChevronDown, Coins, Loader2, LogOut, ArrowLeft, RefreshCw, Calendar, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AdminDashboard() {
  const { user, token, loading, logout } = useAuth()
  const router = useRouter()

  const [usersList, setUsersList] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [jackpotRequests, setJackpotRequests] = useState<any[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [activeTab, setActiveTab] = useState<"users" | "jackpots" | "matches">("users")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  
  // Track loading status for specific sync buttons
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false)
  const [syncingMatchId, setSyncingMatchId] = useState<string | null>(null)

  // Jackpot Winners and Rollover State
  const [winnersList, setWinnersList] = useState<Record<string, any[]>>({})

  // Reset Password State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null)
  const [newPasswordInput, setNewPasswordInput] = useState("")
  const [isSavingReset, setIsSavingReset] = useState(false)
  const [resetSuccessPassword, setResetSuccessPassword] = useState<string | null>(null)

  const fetchWinners = async (matchId: string) => {
    try {
      const res = await matchesApi.getJackpotWinners(matchId)
      setWinnersList(prev => ({ ...prev, [matchId]: res }))
    } catch (err: any) {
      console.error("Error al obtener ganadores del jackpot:", err)
    }
  }

  useEffect(() => {
    matches.forEach(m => {
      if (m.status === 'finished' && m.jackpotStatus === 'open' && !winnersList[m._id]) {
        fetchWinners(m._id)
      }
    })
  }, [matches])

  const handleSaveJackpotFee = async (matchId: string, fee: number) => {
    try {
      await matchesApi.updateJackpotFee(matchId, fee)
      alert("Cuota de jackpot actualizada correctamente.")
      // Refresh matches
      const matchesRes = await matchesApi.getAll()
      setMatches(matchesRes)
    } catch (err: any) {
      alert(err.message || "Error al actualizar la cuota.")
    }
  }

  const handlePayoutJackpot = async (matchId: string) => {
    try {
      await jackpotRequestsApi.payout(matchId)
      alert("Jackpot marcado como pagado exitosamente.")
      // Refresh matches
      const matchesRes = await matchesApi.getAll()
      setMatches(matchesRes)
    } catch (err: any) {
      alert(err.message || "Error al pagar el jackpot.")
    }
  }

  const handleRolloverJackpot = async (fromMatchId: string, toMatchId: string) => {
    try {
      const res = await jackpotRequestsApi.rollover(fromMatchId, toMatchId)
      alert(`Traslado de pozo exitoso. Pozo acumulado: Q${res.rolledOverAmount}.`)
      // Refresh matches and jackpot requests
      const [matchesRes, requestsRes] = await Promise.all([
        matchesApi.getAll(),
        jackpotRequestsApi.getAll()
      ])
      setMatches(matchesRes)
      setJackpotRequests(requestsRes)
    } catch (err: any) {
      alert(err.message || "Error al realizar el traslado del pozo.")
    }
  }

  // Fetch admin dashboard data
  const fetchAdminData = async () => {
    if (!token) return
    setIsLoadingData(true)
    try {
      const [usersRes, matchesRes, requestsRes] = await Promise.all([
        authApi.getLeaderboard(),
        matchesApi.getAll(),
        jackpotRequestsApi.getAll()
      ])
      setUsersList(usersRes)
      setMatches(matchesRes)
      setJackpotRequests(requestsRes)
    } catch (err) {
      console.error("Error al cargar datos de administración:", err)
    } finally {
      setIsLoadingData(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (user.role !== "admin") {
        router.push("/")
      } else {
        fetchAdminData()
      }
    }
  }, [user, loading, router])

  // Toggle general enrollment via API
  const handleTogglePayment = async (userId: string, newStatus: boolean) => {
    try {
      await authApi.toggleEnrollment(userId, newStatus)
      // Refresh user list
      const usersRes = await authApi.getLeaderboard()
      setUsersList(usersRes)
    } catch (err: any) {
      alert(err.message || "Error al cambiar estado de inscripción")
    }
  }

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!selectedUserForReset) return
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setIsSavingReset(true)
    try {
      await authApi.resetPassword(selectedUserForReset._id, { password: newPasswordInput })
      setResetSuccessPassword(newPasswordInput)
    } catch (err: any) {
      alert(err.message || "Error al restablecer la contraseña")
    } finally {
      setIsSavingReset(false)
    }
  }

  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let rand = ""
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const generated = `QN-${rand}`
    setNewPasswordInput(generated)
  }

  // Approve jackpot request via API
  const handleApproveJackpot = async (requestId: string) => {
    try {
      await jackpotRequestsApi.approve(requestId)
      // Refresh requests and matches
      const [requestsRes, matchesRes] = await Promise.all([
        jackpotRequestsApi.getAll(),
        matchesApi.getAll()
      ])
      setJackpotRequests(requestsRes)
      setMatches(matchesRes)
    } catch (err: any) {
      alert(err.message || "Error al aprobar solicitud de jackpot")
    }
  }

  // Reject jackpot request via API
  const handleRejectJackpot = async (requestId: string) => {
    try {
      await jackpotRequestsApi.reject(requestId)
      const requestsRes = await jackpotRequestsApi.getAll()
      setJackpotRequests(requestsRes)
    } catch (err: any) {
      alert(err.message || "Error al rechazar solicitud")
    }
  }

  // Sync entire calendar from external FIFA API
  const handleSyncCalendar = async () => {
    setIsSyncingCalendar(true)
    try {
      const res = await matchesApi.syncCalendar()
      alert(`Sincronización exitosa. Importados: ${res.imported}, Actualizados: ${res.updated}`)
      
      // Refresh matches and leaderboard
      const [matchesRes, usersRes] = await Promise.all([
        matchesApi.getAll(),
        authApi.getLeaderboard()
      ])
      setMatches(matchesRes)
      setUsersList(usersRes)
    } catch (err: any) {
      alert(err.message || "Error al sincronizar calendario")
    } finally {
      setIsSyncingCalendar(false)
    }
  }

  // Sync score for a single match
  const handleSyncMatchScore = async (matchId: string) => {
    setSyncingMatchId(matchId)
    try {
      await matchesApi.syncMatchScore(matchId)
      // Refresh matches, jackpot requests and users (leaderboard points!)
      const [matchesRes, requestsRes, usersRes] = await Promise.all([
        matchesApi.getAll(),
        jackpotRequestsApi.getAll(),
        authApi.getLeaderboard()
      ])
      setMatches(matchesRes)
      setJackpotRequests(requestsRes)
      setUsersList(usersRes)
    } catch (err: any) {
      alert(err.message || "Error al sincronizar marcador")
    } finally {
      setSyncingMatchId(null)
    }
  }

  const filteredUsers = usersList.filter(u => 
    u.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.realName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRequests = selectedMatch && selectedMatch !== "all"
    ? jackpotRequests.filter(req => req.matchId === selectedMatch)
    : jackpotRequests

  const paidCount = usersList.filter(u => u.isEnrolledGeneral).length
  const pendingCount = usersList.filter(u => !u.isEnrolledGeneral).length
  const pendingJackpots = jackpotRequests.filter(r => r.status === "pending_payment").length

  if (loading || (token && isLoadingData && usersList.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-neon-purple/20 blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-neon-purple animate-spin" />
          <p className="text-muted-foreground font-semibold text-sm tracking-wider uppercase">
            Cargando Panel de Control...
          </p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== "admin") return null

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-12">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-neon-purple/20 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-neon-orange/20 blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Top Navbar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 glass p-5 rounded-3xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Panel de Administración
              </h1>
              <p className="text-sm text-muted-foreground">
                Control y sincronización de datos de la copa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="h-10 bg-input border-border hover:bg-muted text-foreground text-xs font-semibold rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver Dashboard
            </Button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/25 transition-all text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-lime/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-neon-lime" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{paidCount}</p>
              <p className="text-sm text-muted-foreground">Inscritos General</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pagos Pendientes</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neon-orange/20 flex items-center justify-center">
              <Coins className="w-6 h-6 text-neon-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingJackpots}</p>
              <p className="text-sm text-muted-foreground">Jackpots por Aprobar</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Selection */}
        <div className="flex gap-2 p-1 mb-8 rounded-2xl bg-muted/40 glass border-white/5 w-full sm:w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`
              flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === "users"
                ? "bg-neon-purple text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Users className="w-4 h-4" />
            Usuarios General
          </button>
          <button
            onClick={() => setActiveTab("jackpots")}
            className={`
              flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === "jackpots"
                ? "bg-neon-orange text-white shadow-md"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Coins className="w-4 h-4" />
            Aprobaciones Jackpot
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`
              flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all
              ${activeTab === "matches"
                ? "bg-neon-lime text-background shadow-md"
                : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            <Calendar className="w-4 h-4" />
            Partidos FIFA 2026
          </button>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div
              key="tab-users"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-neon-purple" />
                  <h2 className="text-lg font-bold text-foreground">Inscripción General</h2>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 bg-input border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Usuario</TableHead>
                      <TableHead className="text-muted-foreground">Nombre Real</TableHead>
                      <TableHead className="text-muted-foreground text-center">Estado</TableHead>
                      <TableHead className="text-muted-foreground text-center">Inscribir</TableHead>
                      <TableHead className="text-muted-foreground text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u._id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.nickname}`}
                                alt={u.nickname}
                                className="w-10 h-10 rounded-full bg-input border border-border"
                              />
                              <span className="font-medium text-foreground">{u.nickname}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.realName}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="secondary"
                              className={
                                u.isEnrolledGeneral
                                  ? "bg-neon-lime/20 text-neon-lime border-neon-lime/30"
                                  : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                              }
                            >
                              {u.isEnrolledGeneral ? "Activo" : "Pendiente"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Switch
                              checked={u.isEnrolledGeneral}
                              onCheckedChange={(checked) => handleTogglePayment(u._id, checked)}
                              className="data-[state=checked]:bg-neon-lime"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUserForReset(u)
                                setNewPasswordInput("")
                                setResetSuccessPassword(null)
                                setIsResetModalOpen(true)
                              }}
                              className="text-neon-purple hover:text-white hover:bg-neon-purple/20 transition-all text-xs rounded-lg border border-neon-purple/20 h-8 px-3 font-semibold"
                            >
                              Restablecer
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}

          {activeTab === "jackpots" && (
            <motion.div
              key="tab-jackpots"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Coins className="w-5 h-5 text-neon-orange" />
                <h2 className="text-lg font-bold text-foreground">Solicitudes de Jackpot</h2>
              </div>

              {/* Match Selector */}
              <div className="mb-6 max-w-md">
                <label className="text-xs text-muted-foreground block mb-2">Filtrar por partido</label>
                <Select value={selectedMatch || "all"} onValueChange={(val) => setSelectedMatch(val)}>
                  <SelectTrigger className="w-full h-11 bg-input border-border rounded-xl text-foreground">
                    <SelectValue placeholder="Todos los partidos" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-foreground">
                    <SelectItem value="all">Todos los partidos</SelectItem>
                    {matches.map(match => (
                      <SelectItem key={match._id} value={match._id}>
                        {match.homeTeam.flag} {match.homeTeam.name} vs {match.awayTeam.name} {match.awayTeam.flag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Match Info Box */}
              {selectedMatch && selectedMatch !== "all" && (
                <div className="glass-card rounded-xl p-4 mb-6 border border-neon-orange/30 max-w-md">
                  {(() => {
                    const match = matches.find(m => m._id === selectedMatch)
                    if (!match) return null
                    return (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">{match.homeTeam.flag}</span>
                          <span className="font-semibold text-foreground">{match.homeTeam.name}</span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-semibold text-foreground">{match.awayTeam.name}</span>
                          <span className="text-lg">{match.awayTeam.flag}</span>
                        </div>
                        <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">
                          Pozo: Q{match.jackpotPot || 0}
                        </Badge>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Requests List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[500px] pr-1">
                {filteredRequests.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Coins className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Sin solicitudes registradas</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => {
                    const match = matches.find(m => m._id === request.matchId)
                    const reqUser = request.userId;
                    return (
                      <div
                        key={request._id}
                        className="glass-card rounded-xl p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={reqUser?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${reqUser?.nickname}`}
                              alt={reqUser?.nickname}
                              className="w-10 h-10 rounded-full bg-input border border-border"
                            />
                            <div>
                              <p className="font-semibold text-foreground text-sm">{reqUser?.nickname || "Usuario"}</p>
                              <p className="text-[10px] text-muted-foreground">{reqUser?.realName}</p>
                            </div>
                          </div>

                          <Badge
                            className={
                              request.status === "approved"
                                ? "bg-neon-lime/20 text-neon-lime border-neon-lime/30"
                                : request.status === "rejected"
                                ? "bg-red-500/20 text-red-500 border-red-500/30"
                                : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                            }
                          >
                            Q{match?.jackpotFee || 10}
                          </Badge>
                        </div>

                        {match && (
                          <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg">
                            {match.homeTeam.flag} {match.homeTeam.name} vs {match.awayTeam.name} {match.awayTeam.flag}
                          </p>
                        )}

                        {request.status === "pending_payment" && (
                          <div className="flex gap-2 mt-1">
                            <Button
                              onClick={() => handleApproveJackpot(request._id)}
                              size="sm"
                              className="flex-1 bg-neon-lime hover:bg-neon-lime/90 text-background font-bold text-xs rounded-lg py-1.5 h-8"
                            >
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => handleRejectJackpot(request._id)}
                              size="sm"
                              variant="destructive"
                              className="flex-1 text-white font-bold text-xs rounded-lg py-1.5 h-8"
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}

                        {request.status === "approved" && (
                          <div className="text-xs text-neon-lime font-medium text-center bg-neon-lime/10 py-1 rounded-lg">
                            ✓ Solicitud Aprobada
                          </div>
                        )}

                        {request.status === "rejected" && (
                          <div className="text-xs text-red-400 font-medium text-center bg-red-500/10 py-1 rounded-lg">
                            ✗ Solicitud Rechazada
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "matches" && (
            <motion.div
              key="tab-matches"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              {/* Sync controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-neon-lime" />
                    Sincronización de Partidos y Marcadores
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Sincroniza el calendario de partidos y actualiza los marcadores desde el API externa
                  </p>
                </div>
                
                <Button
                  onClick={handleSyncCalendar}
                  disabled={isSyncingCalendar}
                  className="bg-neon-purple hover:bg-neon-purple/90 text-white font-bold rounded-xl transition-all shadow-md h-11"
                >
                  {isSyncingCalendar ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sincronizando calendario...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sincronizar Calendario FIFA 2026
                    </>
                  )}
                </Button>
              </div>

              {/* Matches List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[500px] pr-1">
                {matches.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground glass-card rounded-xl">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay partidos en la base de datos. Haz clic en "Sincronizar Calendario" para importarlos.</p>
                  </div>
                ) : (
                  matches.map((match) => {
                    const matchDate = new Date(match.date)
                    const dateStr = matchDate.toLocaleDateString("es-GT", { 
                      day: "numeric", 
                      month: "short", 
                      timeZone: "America/Guatemala" 
                    })
                    const timeStr = matchDate.toLocaleTimeString("es-GT", { 
                      hour: "2-digit", 
                      minute: "2-digit", 
                      hour12: false, 
                      timeZone: "America/Guatemala" 
                    })

                    const isSyncingThis = syncingMatchId === match._id

                    return (
                      <div
                        key={match._id}
                        className="glass-card rounded-xl p-4 flex flex-col justify-between gap-3 relative overflow-hidden"
                      >
                        {/* Header details */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium uppercase tracking-wider">
                            {match.stage}
                          </span>
                          <span className="text-muted-foreground">
                            {dateStr} - {timeStr}
                          </span>
                        </div>

                        {/* Teams row */}
                        <div className="flex items-center justify-between gap-4 py-2 border-y border-white/5">
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-2xl">{match.homeTeam.flag}</span>
                            <span className="font-semibold text-foreground text-sm truncate">{match.homeTeam.name}</span>
                          </div>

                          {/* Score rendering */}
                          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-input font-bold text-sm">
                            {match.status === "finished" || match.actualScore ? (
                              <>
                                <span className="text-foreground">{match.actualScore?.home}</span>
                                <span className="text-muted-foreground">-</span>
                                <span className="text-foreground">{match.actualScore?.away}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">PENDIENTE</span>
                            )}
                          </div>

                          <div className="flex-1 flex items-center gap-2 justify-end">
                            <span className="font-semibold text-foreground text-sm truncate">{match.awayTeam.name}</span>
                            <span className="text-2xl">{match.awayTeam.flag}</span>
                          </div>
                        </div>

                        {/* Status details and action */}
                        <div className="flex items-center justify-between mt-1">
                          <Badge
                            className={
                              match.status === "finished"
                                ? "bg-muted text-muted-foreground"
                                : match.status === "in_progress"
                                ? "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse"
                                : "bg-neon-lime/20 text-neon-lime border-neon-lime/30"
                            }
                          >
                            {match.status === "finished" ? "Finalizado" : match.status === "in_progress" ? "En curso" : "Próximo"}
                          </Badge>

                          <Button
                            onClick={() => handleSyncMatchScore(match._id)}
                            disabled={isSyncingThis || !match.externalId}
                            size="sm"
                            className="bg-neon-lime hover:bg-neon-lime/90 text-background font-bold text-xs rounded-lg py-1.5 h-8"
                          >
                            {isSyncingThis ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Buscando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Sincronizar Marcador
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Configurar cuota de Jackpot (solo partidos próximos) */}
                        {match.status !== "finished" && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <span className="text-xs text-muted-foreground">Cuota Jackpot:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                defaultValue={match.jackpotFee || 10}
                                id={`fee-input-${match._id}`}
                                className="w-14 h-8 text-center text-xs font-bold bg-input border border-border rounded-lg text-foreground focus:border-neon-purple focus:ring-1 focus:ring-neon-purple/30 outline-none"
                              />
                              <Button
                                onClick={async () => {
                                  const input = document.getElementById(`fee-input-${match._id}`) as HTMLInputElement;
                                  const feeVal = Number(input?.value);
                                  if (feeVal > 0) {
                                    await handleSaveJackpotFee(match._id, feeVal);
                                  }
                                }}
                                size="sm"
                                className="h-8 px-2.5 bg-neon-purple hover:bg-neon-purple/90 text-white text-[11px] font-bold rounded-lg transition-all"
                              >
                                Guardar
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Procesamiento de pozo (partidos finalizados) */}
                        {match.status === "finished" && (
                          <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
                            {match.jackpotStatus === "paid_out" && (
                              <div className="flex items-center justify-between text-xs font-medium text-neon-lime bg-neon-lime/5 p-2 rounded-lg">
                                <span>✓ Jackpot Finalizado y Pagado</span>
                                <span className="font-bold">Pozo: Q{match.jackpotPot || 0}</span>
                              </div>
                            )}

                            {match.jackpotStatus === "rolled_over" && (
                              <div className="flex items-center justify-between text-xs font-medium text-yellow-500 bg-yellow-500/5 p-2 rounded-lg">
                                <span>➔ Jackpot Trasladado (Rollover)</span>
                              </div>
                            )}

                            {match.jackpotStatus === "open" && (
                              <>
                                {winnersList[match._id] && winnersList[match._id].length > 0 ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-neon-orange font-bold">🏆 Ganadores del Pozo (Q{match.jackpotPot}):</span>
                                      <span className="font-semibold text-muted-foreground">{winnersList[match._id].length} ganador(es)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {winnersList[match._id].map((w: any) => (
                                        <span key={w._id} className="bg-neon-orange/15 text-neon-orange text-[10px] px-2 py-0.5 rounded border border-neon-orange/20 font-bold">
                                          @{w.nickname}
                                        </span>
                                      ))}
                                    </div>
                                    <Button
                                      onClick={() => handlePayoutJackpot(match._id)}
                                      size="sm"
                                      className="w-full h-8 bg-neon-lime hover:bg-neon-lime/90 text-background font-bold text-xs rounded-lg mt-1"
                                    >
                                      Marcar como Pagado
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="text-[11px] text-yellow-500 font-semibold bg-yellow-500/10 p-2 rounded-lg flex items-center gap-1.5">
                                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span>Nadie acertó el marcador. Trasladar pozo (Q{match.jackpotPot}):</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                      <select
                                        id={`rollover-target-${match._id}`}
                                        className="flex-1 h-8 bg-input border border-border text-foreground text-xs rounded-lg px-2 outline-none"
                                      >
                                        <option value="">-- Seleccionar Destino --</option>
                                        {matches
                                          .filter(m => m.status === 'pending' && m._id !== match._id)
                                          .map(m => (
                                            <option key={m._id} value={m._id}>
                                              {m.homeTeam.flag} {m.homeTeam.name} vs {m.awayTeam.name} {m.awayTeam.flag}
                                            </option>
                                          ))
                                        }
                                      </select>
                                      <Button
                                        onClick={async () => {
                                          const select = document.getElementById(`rollover-target-${match._id}`) as HTMLSelectElement;
                                          const targetId = select?.value;
                                          if (targetId) {
                                            await handleRolloverJackpot(match._id, targetId);
                                          } else {
                                            alert("Por favor selecciona un partido destino.");
                                          }
                                        }}
                                        size="sm"
                                        className="h-8 bg-neon-orange hover:bg-neon-orange/90 text-white font-bold text-xs rounded-lg px-3"
                                      >
                                        Trasladar
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Password Modal */}
        <AnimatePresence>
          {isResetModalOpen && selectedUserForReset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="w-full max-w-md glass-card rounded-2xl p-6 border border-border bg-background/80 shadow-2xl relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {!resetSuccessPassword ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-6 h-6 text-neon-purple" />
                      <h3 className="text-lg font-bold text-foreground">Restablecer Contraseña</h3>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Estás a punto de restablecer la contraseña para el usuario{" "}
                      <span className="font-semibold text-foreground">
                        @{selectedUserForReset.nickname}
                      </span>{" "}
                      ({selectedUserForReset.realName}).
                    </p>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                        Nueva Contraseña (mín. 6 caracteres)
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Ingresa la nueva contraseña"
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          className="bg-input border-border rounded-xl h-11 text-foreground flex-1"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleGenerateRandomPassword}
                          className="h-11 px-3 bg-neon-purple/20 hover:bg-neon-purple/35 text-neon-purple border border-neon-purple/30 rounded-xl flex items-center gap-1 font-semibold"
                        >
                          <Sparkles className="w-4 h-4" />
                          Generar
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsResetModalOpen(false)}
                        className="rounded-xl border border-border h-11 text-foreground"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSavingReset || newPasswordInput.length < 6}
                        className="bg-neon-purple hover:bg-neon-purple/90 text-white font-bold rounded-xl h-11 px-6 shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2"
                      >
                        {isSavingReset ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          "Restablecer"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-6 h-6 text-neon-lime" />
                      <h3 className="text-lg font-bold text-foreground">¡Contraseña Restablecida!</h3>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      La contraseña de{" "}
                      <span className="font-semibold text-foreground">
                        @{selectedUserForReset.nickname}
                      </span>{" "}
                      se ha actualizado correctamente.
                    </p>

                    <div className="bg-input border border-border rounded-xl p-4 flex flex-col gap-2 relative group overflow-hidden">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Contraseña Establecida
                      </label>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-neon-lime tracking-wide">
                          {resetSuccessPassword}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(resetSuccessPassword)
                            alert("Contraseña copiada al portapapeles")
                          }}
                          className="h-8 text-xs font-bold text-neon-purple hover:bg-neon-purple/20 rounded-lg flex items-center gap-1 border border-neon-purple/20 px-2"
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>

                    <div className="bg-neon-purple/10 border border-neon-purple/20 rounded-xl p-3 text-xs text-neon-purple">
                      ⚠️ Copia esta contraseña y envíasela de forma segura al usuario. No volverá a mostrarse en claro una vez que cierres esta ventana.
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => setIsResetModalOpen(false)}
                        className="bg-neon-purple hover:bg-neon-purple/90 text-white font-bold rounded-xl h-11 px-8 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      >
                        Entendido
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-muted-foreground"
        >
          <p>Panel de Control - Guate Quiniela 2026</p>
        </motion.footer>
      </div>
    </div>
  )
}
