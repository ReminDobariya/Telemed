"use client"

import { useEffect, useState } from "react"
import { DoctorAppointmentsAPI, DoctorPrescriptionsAPI, NotificationsAPI } from "@/lib/api"
import { CalendarDays, ClipboardList, Bell, CheckCircle2, Clock, X } from "lucide-react"
import { format } from "date-fns"

type ActivityItem = {
  id: string
  label: string
  date: string
  icon: React.ReactNode
}

export function DoctorRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      try {
        const [appointmentsRes, notificationsRes] = await Promise.all([
          DoctorAppointmentsAPI.list().catch(() => ({ appointments: [] })),
          NotificationsAPI.list().catch(() => ({ notifications: [] })),
        ])

        const allActivities: ActivityItem[] = []

        // Add recent appointments
        const appointments = appointmentsRes.appointments || []
        appointments.slice(0, 5).forEach((apt: any) => {
          const date = apt.time || apt.createdAt
          const patientName = apt.userId?.name || "Patient"
          const status = apt.status || "pending"
          
          let label = ""
          let icon = <CalendarDays className="h-4 w-4" />
          
          if (status === "completed") {
            label = `Completed consultation with ${patientName}`
            icon = <CheckCircle2 className="h-4 w-4" />
          } else if (status === "accepted" || status === "scheduled") {
            label = `Accepted appointment with ${patientName}`
            icon = <CheckCircle2 className="h-4 w-4" />
          } else if (status === "pending") {
            label = `New appointment request from ${patientName}`
            icon = <Clock className="h-4 w-4" />
          } else if (status === "rejected") {
            label = `Rejected appointment from ${patientName}`
            icon = <X className="h-4 w-4" />
          } else {
            label = `Appointment with ${patientName}`
          }

          allActivities.push({
            id: apt._id || apt.id || `apt-${Math.random()}`,
            label,
            date: date ? format(new Date(date), "MMM d, yyyy") : "Recently",
            icon,
          })
        })

        // Add recent notifications
        const notifications = notificationsRes.notifications || []
        notifications.slice(0, 3).forEach((notif: any) => {
          allActivities.push({
            id: notif._id || notif.id || `notif-${Math.random()}`,
            label: notif.title || notif.message || "New notification",
            date: notif.createdAt ? format(new Date(notif.createdAt), "MMM d, yyyy") : "Recently",
            icon: <Bell className="h-4 w-4" />,
          })
        })

        // Sort by date (most recent first) and take top 6
        allActivities.sort((a, b) => {
          if (a.date === "Recently" && b.date !== "Recently") return -1
          if (b.date === "Recently" && a.date !== "Recently") return 1
          return 0 // Keep original order for same date strings
        })

        setActivities(allActivities.slice(0, 6))
      } catch (error) {
        console.error("Failed to load recent activity:", error)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [])

  if (loading) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold">Recent Activity</h2>
        <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="card p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold">Recent Activity</h2>
        <p className="mt-3 text-sm text-muted-foreground">No recent activity to display.</p>
      </div>
    )
  }

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-semibold">Recent Activity</h2>
      <ul className="mt-3 sm:mt-4 space-y-3">
        {activities.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground shrink-0">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-6 text-foreground break-words">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

