"use client"

import { useRouter } from "next/navigation"
import { AuthScreen } from "@/components/quiniela/auth-screen"

export default function LoginPage() {
  const router = useRouter()

  const handleAuthSuccess = () => {
    router.push("/")
  }

  return <AuthScreen onAuthSuccess={handleAuthSuccess} />
}
