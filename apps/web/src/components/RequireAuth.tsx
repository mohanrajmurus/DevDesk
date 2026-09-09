import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useMe } from "@/features/auth/queries"
import logo from "@/assets/logo.png"

function AuthLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <img src={logo} alt="DevDesk" className="h-[110px] w-auto object-contain animate-pulse" />
    </div>
  )
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { data, isLoading, isError } = useMe()

  if (isLoading) return <AuthLoader />
  if (isError || !data?.user) return <Navigate to="/" replace />

  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { data, isLoading } = useMe()

  if (isLoading) return <AuthLoader />
  if (data?.user) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
