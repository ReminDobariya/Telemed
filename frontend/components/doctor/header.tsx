"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bell, LogOut, User, Calendar, Menu } from "lucide-react"
import { NotificationsAPI } from "@/lib/api"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileNav } from "./sidebar"

export function Header({ doctor }: { doctor: any }) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await NotificationsAPI.list()
        if (!ignore) setUnreadCount(res.unreadCount || 0)
      } catch {}
    }
    load()
    const interval = setInterval(load, 30000)
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [])

  function handleLogout() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('tm_auth_token')
      window.localStorage.removeItem('tm_user_role')
    }
    router.push('/doctor/login')
  }

  const doctorInitials = doctor?.name 
    ? doctor.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'D'

  const handleNavClick = (href: string) => {
    router.push(href)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Doctor Portal</h2>
              </div>
              <div className="flex-1 p-4">
                <MobileNav onNavClick={handleNavClick} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-base sm:text-lg font-semibold hidden sm:block truncate">Dashboard</h2>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/doctor/notifications')}
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
              {doctor?.photo ? (
                <img src={doctor.photo} alt={doctor.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{doctorInitials}</AvatarFallback>
                </Avatar>
              )}
              <div className="hidden sm:block text-left min-w-0">
                <p className="text-sm font-medium truncate">Dr. {doctor?.name || 'Doctor'}</p>
                <p className="text-xs text-muted-foreground truncate">{doctor?.specialization || 'Specialist'}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <button onClick={() => router.push('/doctor/profile')} className="flex items-center gap-2 w-full">
                <User className="h-4 w-4" /> Profile
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button onClick={() => router.push('/doctor/appointments')} className="flex items-center gap-2 w-full">
                <Calendar className="h-4 w-4" /> Appointments
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                handleLogout()
              }}
              className="text-accent"
            >
              <LogOut className="h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}


