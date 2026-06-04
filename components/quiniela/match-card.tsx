"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Coins, Users, Clock, Check, Trophy, TrendingUp, Lock, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Match {
  id: string
  teamA: {
    name: string
    flag: string
    score?: number
  }
  teamB: {
    name: string
    flag: string
    score?: number
  }
  date: string
  time: string
  status: "upcoming" | "live" | "finished"
  pot?: number
  cuota?: number
  pointsEarned?: number
  userPrediction?: {
    scoreA: number
    scoreB: number
    joinedJackpot: boolean
  }
}

type JackpotStatus = "not_requested" | "pending" | "approved"

interface MatchCardProps {
  match: Match
  mode: "general" | "jackpot"
  isGeneralPaid?: boolean // Whether user paid for general quiniela
  jackpotStatus?: JackpotStatus // Status for this specific match jackpot
  onPredictionChange?: (matchId: string, scoreA: number, scoreB: number) => Promise<void>
  onJackpotRequest?: (matchId: string) => Promise<void>
}

export function MatchCard({ 
  match, 
  mode, 
  isGeneralPaid = true,
  jackpotStatus = "not_requested",
  onPredictionChange, 
  onJackpotRequest 
}: MatchCardProps) {
  const [scoreA, setScoreA] = useState(match.userPrediction?.scoreA ?? 0)
  const [scoreB, setScoreB] = useState(match.userPrediction?.scoreB ?? 0)
  const [isRequesting, setIsRequesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state when props change
  useEffect(() => {
    setScoreA(match.userPrediction?.scoreA ?? 0)
    setScoreB(match.userPrediction?.scoreB ?? 0)
  }, [match.userPrediction?.scoreA, match.userPrediction?.scoreB])

  const handleScoreChange = (team: "A" | "B", value: string) => {
    const numValue = Math.max(0, Math.min(99, parseInt(value) || 0))
    if (team === "A") {
      setScoreA(numValue)
    } else {
      setScoreB(numValue)
    }
  }

  const handleSavePrediction = async () => {
    setIsSaving(true)
    try {
      await onPredictionChange?.(match.id, scoreA, scoreB)
    } catch (err) {
      console.error('Error guardando predicción:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleJackpotRequest = async () => {
    setIsRequesting(true)
    try {
      await onJackpotRequest?.(match.id)
    } catch (err) {
      console.error('Error solicitando jackpot:', err)
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusColor = () => {
    switch (match.status) {
      case "live": return "bg-red-500"
      case "finished": return "bg-muted-foreground"
      default: return "bg-neon-lime"
    }
  }

  // Determine if inputs should be locked
  const isGeneralLocked = mode === "general" && !isGeneralPaid
  const isJackpotLocked = mode === "jackpot" && jackpotStatus !== "approved"
  const isLocked = mode === "general" ? isGeneralLocked : isJackpotLocked

  const initialA = match.userPrediction?.scoreA ?? 0
  const initialB = match.userPrediction?.scoreB ?? 0
  const hasChanges = (scoreA !== initialA || scoreB !== initialB) || !match.userPrediction

  const renderScoreInputs = () => {
    if (match.status !== "upcoming") {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted">
          <span className="text-2xl font-bold text-foreground">{match.teamA.score}</span>
          <span className="text-muted-foreground text-xl">-</span>
          <span className="text-2xl font-bold text-foreground">{match.teamB.score}</span>
        </div>
      )
    }

    if (isLocked) {
      return (
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-input/50 border border-border flex items-center justify-center">
              <span className="text-xl font-bold text-muted-foreground/50">-</span>
            </div>
            <span className="text-muted-foreground/50 text-xl font-bold">-</span>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-input/50 border border-border flex items-center justify-center">
              <span className="text-xl font-bold text-muted-foreground/50">-</span>
            </div>
          </div>
          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={scoreA}
          onChange={(e) => handleScoreChange("A", e.target.value)}
          className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold rounded-xl bg-input border border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 outline-none transition-all text-foreground"
          min={0}
          max={99}
        />
        <span className="text-muted-foreground text-xl font-bold">-</span>
        <input
          type="number"
          value={scoreB}
          onChange={(e) => handleScoreChange("B", e.target.value)}
          className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold rounded-xl bg-input border border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 outline-none transition-all text-foreground"
          min={0}
          max={99}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      whileHover={{ scale: 1.01 }}
      className="glass-card rounded-2xl p-4 md:p-5 relative overflow-hidden group"
    >
      {/* Status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getStatusColor()} ${match.status === 'live' ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {match.status === "live" ? "En Vivo" : match.status === "finished" ? "Finalizado" : "Próximo"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{match.date} - {match.time}</span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Team A */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-3xl">{match.teamA.flag}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{match.teamA.name}</p>
          </div>
        </div>

        {/* Score inputs / Display */}
        {renderScoreInputs()}

        {/* Team B */}
        <div className="flex-1 flex items-center gap-3 justify-end">
          <div className="flex-1 min-w-0 text-right">
            <p className="font-semibold text-foreground truncate">{match.teamB.name}</p>
          </div>
          <span className="text-3xl">{match.teamB.flag}</span>
        </div>
      </div>

      {/* Save prediction button */}
      <AnimatePresence>
        {hasChanges && match.status === "upcoming" && !isLocked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Button
              onClick={handleSavePrediction}
              disabled={isSaving}
              className="w-full h-10 bg-neon-purple hover:bg-neon-purple/90 text-white font-bold rounded-xl transition-all shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando predicción...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Predicción ({scoreA} - {scoreB})
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locked message for General Mode */}
      <AnimatePresence>
        {mode === "general" && isGeneralLocked && match.status === "upcoming" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <p className="text-xs text-yellow-500">
                Realiza tu pago inicial para desbloquear y predecir.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode specific content */}
      <AnimatePresence mode="wait">
        {mode === "jackpot" && match.status === "upcoming" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-4 border-t border-border"
          >
            <div className="flex flex-col gap-4">
              {/* Pot info row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Pot amount */}
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-neon-orange" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pozo Acumulado</p>
                      <p className="text-lg font-bold text-neon-orange neon-text-orange">
                        Q{(match.pot || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Players joined */}
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-neon-purple" />
                    <div>
                      <p className="text-xs text-muted-foreground">Jugadores</p>
                      <p className="text-lg font-bold text-neon-purple">
                        {Math.floor((match.pot || 0) / (match.cuota || 10))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cuota badge */}
                <span className="px-3 py-1.5 rounded-full bg-neon-lime/20 text-neon-lime text-sm font-bold">
                  Cuota: Q{match.cuota || 10}
                </span>
              </div>

              {/* Action row - based on jackpot status */}
              {jackpotStatus === "not_requested" && (
                <Button
                  onClick={handleJackpotRequest}
                  disabled={isRequesting}
                  className="w-full h-11 bg-neon-orange hover:bg-neon-orange/90 text-white font-bold rounded-xl transition-all"
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Solicitar Ingreso (Q{match.cuota || 10})
                    </>
                  )}
                </Button>
              )}

              {jackpotStatus === "pending" && (
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />
                  <p className="text-sm text-yellow-500 font-medium">
                    Esperando aprobación de pago...
                  </p>
                </div>
              )}

              {jackpotStatus === "approved" && (
                <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-lime/10 border border-neon-lime/20">
                  <Check className="w-4 h-4 text-neon-lime" />
                  <p className="text-sm text-neon-lime font-medium">
                    Aprobado - Predicción desbloqueada
                  </p>
                </div>
              )}

              {/* Locked message for jackpot */}
              {isJackpotLocked && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                  <Lock className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {jackpotStatus === "not_requested" 
                      ? "Solicita ingreso para habilitar tus predicciones." 
                      : "Predicción bloqueada hasta verificar tu pago."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {match.status === "finished" && match.pointsEarned !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-border flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {match.pointsEarned === 3 ? (
                <Trophy className="w-5 h-5 text-neon-orange" />
              ) : match.pointsEarned > 0 ? (
                <TrendingUp className="w-5 h-5 text-neon-lime" />
              ) : (
                <Check className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {match.pointsEarned === 3 ? "Resultado Exacto" : match.pointsEarned === 1 ? "Tendencia Correcta" : "Sin puntos"}
              </span>
            </div>
            <span className={`text-lg font-bold ${match.pointsEarned > 0 ? 'text-neon-lime neon-text-lime' : 'text-muted-foreground'}`}>
              +{match.pointsEarned} pts
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl bg-gradient-to-r from-neon-purple/5 via-transparent to-neon-lime/5" />
    </motion.div>
  )
}
