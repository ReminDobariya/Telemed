"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Calendar, Bell, User } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { href: '/doctor/notifications', label: 'Notifications', icon: Bell },
    { href: '/doctor/profile', label: 'Profile', icon: User },
  ]

  return (
    <aside className="w-64 border-r bg-card hidden md:flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Doctor Portal</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export function MobileNav({ onNavClick }: { onNavClick: (href: string) => void }) {
  const pathname = usePathname()
  const navItems = [
    { href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { href: '/doctor/notifications', label: 'Notifications', icon: Bell },
    { href: '/doctor/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <button
            key={item.href}
            onClick={() => onNavClick(item.href)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}


