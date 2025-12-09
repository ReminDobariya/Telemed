"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AuthAPI } from "@/lib/api"

type User = { id: string; email: string; name?: string }

type AuthContextType = {
  user: User | null
  initializing: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<{ ok: boolean; error?: string }>
  register: (data: Record<string, unknown>) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const SESSION_KEY = "tm_auth_session"
const TOKEN_KEY = "tm_auth_token"
const ROLE_KEY = "tm_user_role"

// removed dummy credentials

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const hydrate = async () => {
      if (typeof window === "undefined") {
        setInitializing(false)
        return
      }

      try {
        const cached = window.localStorage.getItem(SESSION_KEY)
        const token = window.localStorage.getItem(TOKEN_KEY)

        if (cached) {
          const parsed = JSON.parse(cached) as User
          if (mounted) setUser(parsed)
        } else if (token) {
          try {
            const res = await AuthAPI.me()
            const nextUser: User = { id: res.user.id, email: res.user.email, name: res.user.name }
            window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
            window.localStorage.setItem(ROLE_KEY, "patient")
            if (mounted) setUser(nextUser)
          } catch {
            window.localStorage.removeItem(TOKEN_KEY)
            window.localStorage.removeItem(SESSION_KEY)
            window.localStorage.removeItem(ROLE_KEY)
            if (mounted) setUser(null)
          }
        }
      } finally {
        if (mounted) setInitializing(false)
      }
    }

    hydrate()
    return () => {
      mounted = false
    }
  }, [])

  const login = async (email: string, password: string, _remember = true) => {
    try {
      const res = await AuthAPI.login(email, password)
      const nextUser: User = { id: res.user.id, email: res.user.email, name: res.user.name }
      setUser(nextUser)
      window.localStorage.setItem(TOKEN_KEY, res.token)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
      window.localStorage.setItem(ROLE_KEY, "patient")
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message || 'Login failed' }
    }
  }

  const register = async (data: Record<string, unknown>) => {
    try {
      const res = await AuthAPI.register(data)
      const nextUser: User = { id: res.user.id, email: res.user.email, name: res.user.name }
      setUser(nextUser)
      window.localStorage.setItem(TOKEN_KEY, res.token)
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
      window.localStorage.setItem(ROLE_KEY, "patient")
      return { ok: true }
    } catch (e: any) {
      return { ok: false, error: e.message || "Registration failed" }
    }
  }

  const logout = () => {
    setUser(null)
    try {
      window.localStorage.removeItem(SESSION_KEY)
      window.localStorage.removeItem(TOKEN_KEY)
      window.localStorage.removeItem(ROLE_KEY)
    } catch {
      // ignore
    }
    router.push("/login")
  }

  const value = useMemo(() => ({ user, initializing, login, register, logout }), [user, initializing])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
