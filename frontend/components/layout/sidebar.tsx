"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, CalendarDays, UserRound, Pill, BarChart3 } from "lucide-react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type SidebarProps = { open: boolean; onClose?: () => void }

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "AI Assistant", icon: MessageSquare },
  { href: "/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/find-doctors", label: "Find Doctors", icon: UserRound },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/prescriptions", label: "Prescriptions", icon: Pill },
  { href: "/reports", label: "Health Reports", icon: BarChart3 },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-card transition-transform duration-200",
        "md:relative md:z-auto md:h-auto md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      )}
      aria-label="Sidebar"
      aria-hidden={!open && typeof window !== "undefined" && window.innerWidth < 768}
    >
      <div className="flex flex-col h-full md:sticky md:top-16 md:max-h-[calc(100vh-4rem)] md:overflow-y-auto">
        <div className="mb-1.5 flex items-center justify-end md:hidden p-3 sm:p-4">
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3 sm:p-4" aria-label="Sidebar navigation">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose /* close drawer on link click (mobile) */}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm sm:text-base font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
        </nav>
      </div>
    </aside>
  )
} 
