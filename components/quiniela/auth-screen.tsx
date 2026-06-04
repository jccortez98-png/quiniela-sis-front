"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Upload, Camera, Trophy, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"

interface AuthScreenProps {
  onAuthSuccess?: () => void
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [realName, setRealName] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { login, register } = useAuth()

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register({
          email,
          password,
          realName,
          nickname,
          avatarUrl: avatarPreview || undefined
        })
      }
      onAuthSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado. Revisa tus datos.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-neon-purple/30 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.2, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-neon-lime/30 blur-[100px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-neon-orange" />
            <h1 className="text-2xl md:text-3xl font-black text-foreground">
              <span className="text-neon-purple neon-text-purple">World Cup</span>{" "}
              <span className="text-neon-lime neon-text-lime">Quiniela</span>
            </h1>
            <Trophy className="w-8 h-8 text-neon-orange" />
          </div>
        </motion.div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-6 md:p-8 neon-glow-purple">
          {/* Mode Toggle */}
          <div className="flex bg-input rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                mode === "login"
                  ? "bg-neon-purple text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Iniciar Sesion
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                mode === "register"
                  ? "bg-neon-purple text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {/* Avatar Upload */}
                  <div className="flex justify-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 rounded-full border-2 border-dashed border-neon-purple/50 flex items-center justify-center overflow-hidden bg-input hover:border-neon-purple transition-colors group relative"
                      >
                        {avatarPreview ? (
                          <>
                            <img
                              src={avatarPreview}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-neon-purple transition-colors">
                            <Upload className="w-8 h-8" />
                            <span className="text-xs">Avatar</span>
                          </div>
                        )}
                      </button>
                      {avatarPreview && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-neon-lime rounded-full flex items-center justify-center border-2 border-background">
                          <Camera className="w-4 h-4 text-black" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Real Name */}
                  <div className="space-y-2">
                    <Label htmlFor="realName" className="text-sm text-muted-foreground">
                      Nombre Completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="realName"
                        type="text"
                        placeholder="Nombre y Apellido"
                        value={realName}
                        onChange={(e) => setRealName(e.target.value)}
                        className="pl-11 h-12 bg-input border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* Nickname */}
                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="text-sm text-muted-foreground">
                      Nickname
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="nickname"
                        type="text"
                        placeholder="Tu apodo en el juego"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="pl-11 h-12 bg-input border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 bg-input border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 bg-input border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-neon-purple hover:bg-neon-purple/90 text-white font-bold rounded-xl transition-all duration-300 neon-glow-purple disabled:opacity-50"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : mode === "login" ? (
                "Entrar al Juego"
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          {/* Forgot password link */}
          {mode === "login" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-4 text-sm text-muted-foreground"
            >
              <a href="#" className="text-neon-purple hover:underline">
                Olvidaste tu password?
              </a>
            </motion.p>
          )}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-xs text-muted-foreground"
        >
          World Cup Quiniela 2026 - Play responsibly
        </motion.p>
      </motion.div>
    </div>
  )
}
