"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Gamepad2, Coins } from "lucide-react"
import { MatchCard } from "./match-card"

type TabType = "upcoming" | "results"
type ModeType = "general" | "jackpot"
type JackpotStatus = "not_requested" | "pending" | "approved"

interface MatchFeedProps {
  matches: any[]
  predictions: any[]
  jackpotRequests: any[]
  isGeneralPaid: boolean
  onSavePrediction: (matchId: string, type: 'general' | 'jackpot', scoreHome: number, scoreAway: number) => Promise<void>
  onJackpotRequest: (matchId: string) => Promise<void>
}

export function MatchFeed({ 
  matches = [], 
  predictions = [], 
  jackpotRequests = [], 
  isGeneralPaid = false,
  onSavePrediction,
  onJackpotRequest
}: MatchFeedProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming")
  const [mode, setMode] = useState<ModeType>("general")

  // Filter matches based on tab
  const filteredMatches = matches.filter((match) => {
    const isFinished = match.status === "finished";
    return activeTab === "upcoming" ? !isFinished : isFinished;
  });

  // Map backend matches to frontend structure
  const mappedMatches = filteredMatches.map((m) => {
    // Find prediction of active mode
    const pred = predictions.find(p => p.matchId === m._id && p.type === mode);
    
    // Find jackpot request
    const jackReq = jackpotRequests.find(r => r.matchId === m._id);
    let jackpotStatus: JackpotStatus = "not_requested";
    if (jackReq) {
      if (jackReq.status === "approved") {
        jackpotStatus = "approved";
      } else if (jackReq.status === "pending_payment") {
        jackpotStatus = "pending";
      }
    }

    // Format date and time for Guatemala context (UTC-6)
    const matchDate = new Date(m.date);
    const dateStr = matchDate.toLocaleDateString("es-GT", { 
      day: "numeric", 
      month: "short", 
      timeZone: "America/Guatemala" 
    });
    const timeStr = matchDate.toLocaleTimeString("es-GT", { 
      hour: "2-digit", 
      minute: "2-digit", 
      hour12: false, 
      timeZone: "America/Guatemala" 
    });

    let cardStatus: "upcoming" | "live" | "finished" = "upcoming";
    if (m.status === "in_progress") cardStatus = "live";
    if (m.status === "finished") cardStatus = "finished";

    return {
      id: m._id,
      teamA: {
        name: m.homeTeam.name,
        flag: m.homeTeam.flag,
        score: m.actualScore?.home,
      },
      teamB: {
        name: m.awayTeam.name,
        flag: m.awayTeam.flag,
        score: m.actualScore?.away,
      },
      date: dateStr,
      time: timeStr,
      status: cardStatus,
      pot: m.jackpotPot,
      cuota: m.jackpotFee || 10,
      pointsEarned: pred?.pointsEarned,
      jackpotStatus,
      userPrediction: pred ? {
        scoreA: pred.predictedScore.home,
        scoreB: pred.predictedScore.away,
        joinedJackpot: jackpotStatus === "approved",
      } : undefined
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-4 md:p-5 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <h3 className="text-lg font-bold text-foreground">Experiencia de Juego</h3>

        {/* Mode toggle - only show for upcoming */}
        {activeTab === "upcoming" && (
          <div className="flex gap-2 p-1 rounded-xl bg-muted/50 w-full sm:w-auto">
            <button
              onClick={() => setMode("general")}
              className={`
                flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${mode === "general" 
                  ? 'bg-neon-purple text-white neon-glow-purple' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>General</span>
            </button>
            <button
              onClick={() => setMode("jackpot")}
              className={`
                flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${mode === "jackpot" 
                  ? 'bg-neon-orange text-white neon-glow-orange' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Coins className="w-4 h-4" />
              <span>Jackpot</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 mb-5 rounded-xl bg-muted/30 w-fit">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`
            px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${activeTab === "upcoming" 
              ? 'bg-neon-lime text-background' 
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Próximos
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={`
            px-5 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${activeTab === "results" 
              ? 'bg-neon-lime text-background' 
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          Resultados
        </button>
      </div>

      {/* Match cards */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[60vh] lg:max-h-[65vh]">
        {mappedMatches.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No hay partidos disponibles.
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${mode}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {mappedMatches.map((m) => (
                <MatchCard
                  key={m.id}
                  match={m as any}
                  mode={mode}
                  isGeneralPaid={isGeneralPaid}
                  jackpotStatus={m.jackpotStatus}
                  onPredictionChange={(matchId, scoreA, scoreB) => 
                    onSavePrediction(matchId, mode, scoreA, scoreB)
                  }
                  onJackpotRequest={onJackpotRequest}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
