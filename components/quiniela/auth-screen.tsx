"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, User, Upload, Camera, Trophy, Eye, EyeOff, AlertCircle, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { teamsApi } from "@/lib/api"

interface AuthScreenProps {
  onAuthSuccess?: () => void
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [realName, setRealName] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("")
  const [age, setAge] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { login, register } = useAuth()

  // Register Stepper State
  const [registerStep, setRegisterStep] = useState(1)
  const [teams, setTeams] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])

  // Fetch teams when entering register mode
  useEffect(() => {
    if (mode === "register" && teams.length === 0) {
      teamsApi.getAll()
        .then(res => setTeams(res))
        .catch(err => console.error("Error al obtener selecciones:", err))
    }
  }, [mode, teams.length])

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

  const handleTeamSelect = (teamId: string) => {
    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId))
    } else {
      if (selectedTeams.length < 2) {
        setSelectedTeams([...selectedTeams, teamId])
      }
    }
  }

  const handleNextStep = () => {
    if (registerStep === 1) {
      if (!email || !password) {
        setError("Por favor ingresa tu correo y contraseña.")
        return
      }
      setRegisterStep(2)
    } else if (registerStep === 2) {
      if (!realName || !nickname || !gender || !age) {
        setError("Por favor completa todos los campos del perfil (incluyendo sexo y edad).")
        return
      }
      setRegisterStep(3)
    }
    setError("")
  }

  const handlePrevStep = () => {
    if (registerStep > 1) {
      setRegisterStep(registerStep - 1)
    }
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    try {
      if (mode === "login") {
        setIsLoading(true)
        await login(email, password)
        onAuthSuccess?.()
      } else {
        if (registerStep < 3) {
          handleNextStep()
          return
        }
        if (selectedTeams.length !== 2) {
          setError("Por favor selecciona exactamente 2 selecciones favoritas.")
          return
        }
        setIsLoading(true)
        await register({
          email,
          password,
          realName,
          nickname,
          avatarUrl: avatarPreview || undefined,
          favoriteTeams: selectedTeams,
          gender,
          age: Number(age)
        })
        onAuthSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado. Revisa tus datos.')
      setIsLoading(false)
    } finally {
      if (mode === "login") {
        setIsLoading(false)
      }
    }
  }

  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
              onClick={() => {
                setMode("login")
                setError("")
                setRegisterStep(1)
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                mode === "login"
                  ? "bg-neon-purple text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setMode("register")
                setError("")
                setRegisterStep(1)
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                mode === "register"
                  ? "bg-neon-purple text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {/* Stepper Steps (Visible only in register mode) */}
          {mode === "register" && (
            <div className="flex items-center justify-between mb-8 px-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center gap-2 flex-1 last:flex-initial">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    registerStep === step
                      ? "bg-neon-purple text-white ring-4 ring-neon-purple/20 scale-105"
                      : registerStep > step
                      ? "bg-neon-lime text-background font-black"
                      : "bg-input text-muted-foreground"
                  }`}>
                    {registerStep > step ? "✓" : step}
                  </div>
                  {step < 3 && (
                    <div className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                      registerStep > step ? "bg-neon-lime" : "bg-input"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          )}

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
              {/* LOGIN MODE */}
              {mode === "login" && (
                <motion.div
                  key="login-fields"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
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
                </motion.div>
              )}

              {/* REGISTER MODE */}
              {mode === "register" && (
                <motion.div
                  key={`register-step-${registerStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* STEP 1: Account Info */}
                  {registerStep === 1 && (
                    <div className="space-y-5">
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
                    </div>
                  )}

                  {/* STEP 2: Profile Details */}
                  {registerStep === 2 && (
                    <div className="space-y-5">
                      <div className="flex justify-center">
                        <div className="relative">
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
                            className="w-24 h-24 rounded-full border-2 border-dashed border-neon-purple/50 flex items-center justify-center overflow-hidden bg-input hover:border-neon-purple transition-colors group relative"
                          >
                            {avatarPreview ? (
                              <>
                                <img
                                  src={avatarPreview}
                                  alt="Avatar preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Camera className="w-5 h-5 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5 text-muted-foreground group-hover:text-neon-purple transition-colors">
                                <Upload className="w-6 h-6" />
                                <span className="text-[10px]">Avatar</span>
                              </div>
                            )}
                          </button>
                          {avatarPreview && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-neon-lime rounded-full flex items-center justify-center border-2 border-background">
                              <Camera className="w-3.5 h-3.5 text-black" />
                            </div>
                          )}
                        </div>
                      </div>

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

                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">
                          Sexo
                        </Label>
                        <div className="flex gap-2">
                          {[
                            { value: "male", label: "Masculino" },
                            { value: "female", label: "Femenino" },
                            { value: "other", label: "Otro" }
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setGender(opt.value as any)}
                              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                                gender === opt.value
                                  ? "bg-neon-purple/20 border-neon-purple text-foreground ring-2 ring-neon-purple/30"
                                  : "bg-input border-border text-muted-foreground hover:bg-input/80"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-sm text-muted-foreground">
                          Edad
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="age"
                            type="number"
                            placeholder="Ingresa tu edad"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            min={1}
                            max={120}
                            className="pl-11 h-12 bg-input border-border focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30 rounded-xl"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Favorite Selections */}
                  {registerStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[11px] leading-relaxed">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Solo puedes elegir tus selecciones favoritas durante el registro. No podrán cambiarse después.</span>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Buscar selección..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 h-10 bg-input border-border rounded-xl text-xs text-foreground focus:border-neon-purple focus:ring-2 focus:ring-neon-purple/30"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[190px] pr-1 scrollbar-thin scrollbar-thumb-muted">
                        {filteredTeams.length === 0 ? (
                          <div className="col-span-3 text-center py-4 text-xs text-muted-foreground">
                            No se encontraron selecciones
                          </div>
                        ) : (
                          filteredTeams.map((team) => {
                            const isSelected = selectedTeams.includes(team._id)
                            return (
                              <button
                                key={team._id}
                                type="button"
                                onClick={() => handleTeamSelect(team._id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                                  isSelected
                                    ? "bg-neon-purple/20 border-neon-purple ring-2 ring-neon-purple/30"
                                    : "bg-input/40 border-border hover:bg-input/70"
                                }`}
                              >
                                <span className="text-2xl">{team.flag}</span>
                                <span className="text-[10px] font-semibold truncate max-w-full text-foreground">{team.name}</span>
                              </button>
                            )
                          })
                        )}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Elige exactamente 2</span>
                        <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
                          {selectedTeams.length} / 2
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form actions and navigation */}
            <div className="flex gap-3 pt-2">
              {mode === "register" && registerStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePrevStep}
                  variant="outline"
                  className="w-1/3 h-12 bg-input border-border hover:bg-muted text-foreground font-bold rounded-xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Atrás
                </Button>
              )}

              <Button
                type="submit"
                disabled={isLoading || (mode === "register" && registerStep === 3 && selectedTeams.length !== 2)}
                className={`h-12 font-bold rounded-xl transition-all duration-300 disabled:opacity-50 ${
                  mode === "register" && registerStep > 1 ? "flex-1" : "w-full"
                } bg-neon-purple hover:bg-neon-purple/90 text-white neon-glow-purple`}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : mode === "login" ? (
                  "Entrar al Juego"
                ) : registerStep < 3 ? (
                  <span className="flex items-center justify-center gap-1">
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </span>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </div>
          </form>

          {/* Switch mode label */}
          {mode === "login" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-6 text-sm text-muted-foreground"
            >
              ¿No tienes una cuenta?{" "}
              <button
                onClick={() => {
                  setMode("register")
                  setError("")
                  setRegisterStep(1)
                }}
                className="text-neon-purple hover:underline font-bold"
              >
                Regístrate
              </button>
            </motion.p>
          )}

          {mode === "register" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mt-6 text-sm text-muted-foreground"
            >
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => {
                  setMode("login")
                  setError("")
                  setRegisterStep(1)
                }}
                className="text-neon-purple hover:underline font-bold"
              >
                Inicia Sesión
              </button>
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
