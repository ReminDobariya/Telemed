"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Stethoscope, MessageCircle, CalendarDays, User, LogOut, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { UserAPI, NotificationsAPI } from "@/lib/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/auth-context"

type HeaderProps = { onToggleSidebar?: () => void }

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/chat", label: "Chat Assistant" },
  { href: "/appointments", label: "Appointments" },
  { href: "/doctors", label: "Doctors" },
  { href: "/profile", label: "Profile" },
]

export function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const [photo, setPhoto] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    (async () => {
      try {
        const res = await UserAPI.getProfile()
        if (res?.profile?.profilePhotoUrl) setPhoto(res.profile.profilePhotoUrl)
      } catch {}
    })()
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await NotificationsAPI.list()
        if (!ignore) setUnreadCount(res.unreadCount || 0)
      } catch {}
    }
    load()
    const interval = setInterval(load, 30000) // Refresh every 30 seconds
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [])
  
  // Get user initials and display name
  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'
  const displayName = user?.name || 'User'
  
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Link href="/" className="flex items-center gap-2" aria-label="Telemedicine Home">
            <Stethoscope className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="font-semibold text-base sm:text-lg">Telemed</span>
          </Link>
        </div>

        <nav className="hidden" aria-label="Primary"></nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/notifications')}
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div role="button" tabIndex={0} className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  {photo ? <img src={photo} alt="profile" className="h-full w-full rounded-full object-cover" /> : <AvatarFallback>{userInitials}</AvatarFallback>}
                </Avatar>
                <span className="hidden text-sm md:inline">{displayName}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/appointments" className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" /> Appointments
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Chat Assistant
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  logout()
                }}
                className="text-accent"
              >
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
