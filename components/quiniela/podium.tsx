"use client"

import { motion } from "framer-motion"
import { Crown, Medal } from "lucide-react"

interface Player {
  rank: number
  avatar: string
  nickname: string
  points: number
}

interface PodiumProps {
  players: Player[]
}

const podiumConfig = [
  { position: 1, height: "h-32 md:h-40", order: 2, delay: 0.3, color: "neon-orange", glow: "neon-glow-orange" },
  { position: 2, height: "h-24 md:h-32", order: 1, delay: 0.4, color: "neon-purple", glow: "neon-glow-purple" },
  { position: 3, height: "h-20 md:h-24", order: 3, delay: 0.5, color: "neon-lime", glow: "neon-glow-lime" },
  { position: 4, height: "h-16 md:h-20", order: 4, delay: 0.6, color: "neon-cyan", glow: "" },
  { position: 5, height: "h-12 md:h-16", order: 5, delay: 0.7, color: "neon-pink", glow: "" },
]

export function Podium({ players }: PodiumProps) {
  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank).slice(0, 5)
  
  // Reorder for visual display (2, 4, 1, 3, 5)
  const displayOrder = [
    sortedPlayers[1], // 2nd place
    sortedPlayers[3], // 4th place
    sortedPlayers[0], // 1st place
    sortedPlayers[2], // 3rd place
    sortedPlayers[4], // 5th place
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="glass rounded-2xl p-4 md:p-6"
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <Crown className="w-6 h-6 text-neon-orange" />
        <h3 className="text-xl font-bold text-foreground">Top 5 Champions</h3>
      </div>

      <div className="flex items-end justify-center gap-2 md:gap-3 min-h-[280px] md:min-h-[320px]">
        {displayOrder.map((player, idx) => {
          const originalRank = player.rank
          const config = podiumConfig.find(p => p.position === originalRank) || {
            position: originalRank,
            height: "h-12 md:h-16",
            order: idx + 1,
            delay: 0.5,
            color: "neon-purple",
            glow: "",
          }
          
          return (
            <motion.div
              key={player.nickname}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20, 
                delay: config.delay 
              }}
              className="flex flex-col items-center"
            >
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: config.delay + 0.2 }}
                className="relative mb-2"
              >
                <div className={`
                  ${originalRank === 1 ? 'w-16 h-16 md:w-20 md:h-20' : 'w-12 h-12 md:w-14 md:h-14'}
                  rounded-full overflow-hidden ring-2 ring-${config.color}
                  ${config.glow}
                `}>
                  <img
                    src={player.avatar}
                    alt={player.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                {originalRank === 1 && (
                  <motion.div
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", delay: 0.8 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                  >
                    <Crown className="w-8 h-8 text-neon-orange drop-shadow-lg" fill="currentColor" />
                  </motion.div>
                )}
                {(originalRank === 2 || originalRank === 3) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: config.delay + 0.3 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Medal className={`w-5 h-5 text-${config.color}`} />
                  </motion.div>
                )}
              </motion.div>

              {/* Name */}
              <p className={`
                text-xs md:text-sm font-semibold mb-2 text-center truncate max-w-[60px] md:max-w-[80px]
                ${originalRank === 1 ? 'text-neon-orange' : 'text-muted-foreground'}
              `}>
                {player.nickname}
              </p>

              {/* Points */}
              <p className={`text-xs font-bold mb-2 text-${config.color}`}>
                {player.points.toLocaleString()} pts
              </p>

              {/* Podium Block */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.5, delay: config.delay }}
                className={`
                  ${config.height} w-14 md:w-20 rounded-t-lg
                  bg-gradient-to-t from-${config.color}/30 to-${config.color}/10
                  border-t-2 border-x border-${config.color}/50
                  flex items-start justify-center pt-2
                  ${originalRank === 1 ? config.glow : ''}
                `}
              >
                <span className={`
                  text-lg md:text-2xl font-black text-${config.color}
                `}>
                  {originalRank}
                </span>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
