"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sidebarOpen])

  return (
    <div className="min-h-dvh">
      <Header onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 sm:px-4 py-3 sm:py-4 md:grid-cols-[18rem_1fr]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="pb-24 sm:pb-6">
          <ProtectedRoute>{children}</ProtectedRoute>
        </main>
      </div>
    </div>
  )
}
