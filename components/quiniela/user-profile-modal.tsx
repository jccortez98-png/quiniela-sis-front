"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Camera, Save, User, Trophy, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  nickname: string
  avatar: string
  email: string
  paymentStatus: "active" | "pending"
  totalPoints: number
  globalRank: number
  favoriteTeams?: any[]
  gender?: string
  age?: number
}

interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile
  onSave?: (updates: { nickname: string; avatar?: string }) => void
}

export function UserProfileModal({ isOpen, onClose, user, onSave }: UserProfileModalProps) {
  const [nickname, setNickname] = useState(user.nickname)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onSave?.({ nickname, avatar: avatarPreview || undefined })
    setIsSaving(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto neon-glow-purple">
              {/* Header */}
              <div className="relative p-6 pb-0">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 w-10 h-10 rounded-full bg-input flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-6 h-6 text-neon-purple" />
                  <h2 className="text-xl font-bold text-foreground">Mi Perfil</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu informacion y preferencias
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-neon-purple/30 shadow-lg">
                      <img
                        src={avatarPreview || user.avatar}
                        alt={user.nickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-neon-lime rounded-full flex items-center justify-center border-2 border-background cursor-pointer hover:scale-110 transition-transform"
                         onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-4 h-4 text-black" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Click para cambiar foto</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-xl p-4 text-center">
                    <Trophy className="w-6 h-6 text-neon-orange mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{user.totalPoints}</p>
                    <p className="text-xs text-muted-foreground">Puntos Totales</p>
                  </div>
                  <div className="glass-card rounded-xl p-4 text-center">
                    <div className="w-6 h-6 mx-auto mb-2 rounded-full bg-neon-purple flex items-center justify-center text-xs font-bold text-white">
                      #{user.globalRank}
                    </div>
                    <p className="text-2xl font-bold text-foreground">#{user.globalRank}</p>
                    <p className="text-xs text-muted-foreground">Ranking Global</p>
                  </div>
                </div>

                {/* Nickname Input */}
                <div className="space-y-2">
                  <Label htmlFor="edit-nickname" className="text-sm text-muted-foreground">
                    Nickname
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="edit-nickname"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="pl-11 h-12 bg-input border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 rounded-xl"
                    />
                  </div>
                </div>

                {/* Favorite Teams (read-only) */}
                {user.favoriteTeams && user.favoriteTeams.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-neon-orange" />
                      Selecciones Favoritas (No modificables)
                    </Label>
                    <div className="flex gap-2">
                      {user.favoriteTeams.map((team: any, index: number) => (
                        <div
                          key={team._id || index}
                          className="flex-1 glass-card rounded-xl p-3 flex items-center justify-center gap-2 border border-white/5 bg-input/20"
                        >
                          <span className="text-2xl">{team.flag}</span>
                          <span className="font-semibold text-foreground text-sm truncate">{team.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payment Status */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Estado de Quiniela General
                  </Label>
                  <div className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.paymentStatus === "active" ? (
                        <div className="w-10 h-10 rounded-full bg-neon-lime/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-neon-lime" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {user.paymentStatus === "active" ? "Inscripcion Activa" : "Pago Pendiente"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.paymentStatus === "active" 
                            ? "Tienes acceso completo" 
                            : "Contacta al admin para activar"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={user.paymentStatus === "active" ? "default" : "secondary"}
                      className={
                        user.paymentStatus === "active"
                          ? "bg-neon-lime/20 text-neon-lime border-neon-lime/30 hover:bg-neon-lime/30"
                          : "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30"
                      }
                    >
                      {user.paymentStatus === "active" ? "Activo" : "Pago Pendiente"}
                    </Badge>
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Email
                  </Label>
                  <div className="glass-card rounded-xl p-3 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>

                {/* Sexo y Edad (read-only) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Sexo
                    </Label>
                    <div className="glass-card rounded-xl p-3 text-sm text-muted-foreground bg-input/20">
                      {user.gender === "male"
                        ? "Masculino"
                        : user.gender === "female"
                        ? "Femenino"
                        : user.gender === "other"
                        ? "Otro"
                        : "No especificado"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Edad
                    </Label>
                    <div className="glass-card rounded-xl p-3 text-sm text-muted-foreground bg-input/20">
                      {user.age ? `${user.age} años` : "No especificada"}
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-12 bg-neon-purple hover:bg-neon-purple/90 text-white font-bold rounded-xl transition-all duration-300"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
