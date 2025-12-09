"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Allow auth pages without redirect
    const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password"
    if (!initializing && !user && !isAuthPage) {
      router.replace("/login")
    }
  }, [user, router, pathname, initializing])

  if (initializing) {
    return <div className="p-6 text-sm text-muted-foreground">Checking your session…</div>
  }

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password"
  if (!user && !isAuthPage) {
    return <div className="p-6 text-sm text-muted-foreground">Redirecting to login…</div>
  }

  return <>{children}</>
}
