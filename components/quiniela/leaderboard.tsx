"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, Trophy } from "lucide-react"

interface Player {
  rank: number
  avatar: string
  nickname: string
  points: number
  trend: "up" | "down" | "same"
  isCurrentUser?: boolean
}

interface LeaderboardProps {
  players: Player[]
  currentUserNickname: string
}

export function Leaderboard({ players, currentUserNickname }: LeaderboardProps) {
  const getTrendIcon = (trend: "up" | "down" | "same") => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-neon-lime" />
      case "down": return <TrendingDown className="w-4 h-4 text-destructive" />
      default: return <Minus className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-neon-orange"
      case 2: return "text-neon-purple"
      case 3: return "text-neon-lime"
      default: return "text-muted-foreground"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass rounded-2xl p-4 md:p-5 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-neon-purple" />
        <h3 className="text-lg font-bold text-foreground">Leaderboard</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {players.map((player, index) => {
          const isCurrentUser = player.nickname === currentUserNickname
          
          return (
            <motion.div
              key={player.nickname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-3 p-3 rounded-xl transition-all
                ${isCurrentUser 
                  ? 'bg-neon-purple/20 ring-2 ring-neon-purple neon-glow-purple' 
                  : 'bg-muted/30 hover:bg-muted/50'
                }
              `}
            >
              {/* Rank */}
              <div className={`w-8 text-center font-bold ${getRankColor(player.rank)}`}>
                {player.rank <= 3 ? (
                  <span className="text-lg">{player.rank === 1 ? "🥇" : player.rank === 2 ? "🥈" : "🥉"}</span>
                ) : (
                  <span>{player.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`
                w-10 h-10 rounded-full overflow-hidden ring-2
                ${isCurrentUser ? 'ring-neon-purple' : 'ring-border'}
              `}>
                <img
                  src={player.avatar}
                  alt={player.nickname}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isCurrentUser ? 'text-neon-purple' : 'text-foreground'}`}>
                  {player.nickname}
                </p>
                <p className="text-xs text-muted-foreground">
                  {player.points.toLocaleString()} pts
                </p>
              </div>

              {/* Trend */}
              <div className="flex items-center">
                {getTrendIcon(player.trend)}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
