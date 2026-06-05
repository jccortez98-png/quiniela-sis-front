"use client"

import { motion } from "framer-motion"
import { Crown, Trophy, Zap } from "lucide-react"

interface UserHeaderProps {
  avatar: string
  nickname: string
  globalRank: number
  totalPoints: number
  favoriteTeams?: any[]
  onProfileClick?: () => void
}

export function UserHeader({ avatar, nickname, globalRank, totalPoints, favoriteTeams, onProfileClick }: UserHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass rounded-2xl p-4 md:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="relative cursor-pointer"
            onClick={onProfileClick}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 ring-neon-purple neon-glow-purple hover:ring-4 transition-all">
              <img
                src={avatar}
                alt={nickname}
                className="w-full h-full object-cover"
              />
            </div>
            {globalRank <= 3 && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.4 }}
                className="absolute -top-2 -right-2 bg-neon-orange rounded-full p-1"
              >
                <Crown className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Nickname */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Player
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="text-xl md:text-2xl font-bold text-foreground neon-text-purple"
            >
              {nickname}
            </motion.h2>
            {/* Favorite Teams */}
            {favoriteTeams && favoriteTeams.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground"
              >
                <span>Favoritos:</span>
                {favoriteTeams.map((team: any, index: number) => (
                  <span key={team._id || index} className="inline-flex items-center gap-0.5 bg-input px-1.5 py-0.5 rounded border border-border text-foreground font-medium">
                    <span>{team.flag}</span>
                    <span className="hidden sm:inline">{team.name}</span>
                  </span>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Rank */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-neon-orange" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline">
                Rank
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-neon-orange neon-text-orange">
              #{globalRank}
            </p>
          </motion.div>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-neon-lime" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline">
                Points
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-neon-lime neon-text-lime">
              {totalPoints.toLocaleString()}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}
