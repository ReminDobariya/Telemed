"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { DoctorAuthAPI } from "@/lib/api"
import { Sidebar } from "@/components/doctor/sidebar"
import { Header } from "@/components/doctor/header"

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function checkAuth() {
      try {
        const res = await DoctorAuthAPI.me()
        if (!ignore) {
          setDoctor(res.doctor)
        }
      } catch {
        if (!ignore && !pathname.includes('/login') && !pathname.includes('/register')) {
          router.push('/doctor/login')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (!pathname.includes('/login') && !pathname.includes('/register')) {
      checkAuth()
    } else {
      setLoading(false)
    }
    return () => { ignore = true }
  }, [router, pathname])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (pathname.includes('/login') || pathname.includes('/register')) {
    return <>{children}</>
  }

  if (!doctor) {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header doctor={doctor} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


