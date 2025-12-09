import Link from "next/link"
import { MessageSquare, CalendarPlus, Pill } from "lucide-react"

export function QuickActions() {
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Link
          href="/chat"
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-opacity hover:opacity-90"
        >
          <MessageSquare className="h-4 w-4" /> Chat with AI Assistant
        </Link>
        <Link
          href="/appointments"
          className="flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-opacity hover:opacity-90"
        >
          <CalendarPlus className="h-4 w-4" /> Book New Appointment
        </Link>
        <Link
          href="/prescriptions"
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-accent-foreground transition-opacity hover:opacity-90"
        >
          <Pill className="h-4 w-4" /> View Prescriptions
        </Link>
      </div>
    </div>
  )
}
