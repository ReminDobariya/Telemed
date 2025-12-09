"use client"

import { useEffect, useState } from "react"
import { AppointmentsAPI, PrescriptionsAPI, MedicationsAPI, NotificationsAPI } from "@/lib/api"
import { CalendarDays, Pill, ClipboardList, Bell, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

type ActivityItem = {
  id: string
  label: string
  date: string
  icon: React.ReactNode
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivities() {
      try {
        const [appointmentsRes, prescriptionsRes, medicationsRes, notificationsRes] = await Promise.all([
          AppointmentsAPI.list().catch(() => ({ appointments: [] })),
          PrescriptionsAPI.list().catch(() => ({ prescriptions: [] })),
          MedicationsAPI.list().catch(() => ({ medications: [] })),
          NotificationsAPI.list().catch(() => ({ notifications: [] })),
        ])

        const allActivities: ActivityItem[] = []

        // Add recent appointments
        const appointments = appointmentsRes.appointments || []
        appointments.slice(0, 5).forEach((apt: any) => {
          const date = apt.date || apt.appointmentDate || apt.createdAt
          const doctorName = apt.doctor?.name || apt.doctorName || "Doctor"
          const status = apt.status || "scheduled"
          
          let label = ""
          if (status === "completed") {
            label = `Completed consultation with ${doctorName}`
          } else if (status === "confirmed" || status === "accepted") {
            label = `Confirmed appointment with ${doctorName}`
          } else if (status === "pending") {
            label = `Booked appointment with ${doctorName}`
          } else {
            label = `Appointment with ${doctorName}`
          }

          allActivities.push({
            id: apt._id || apt.id || `apt-${Math.random()}`,
            label,
            date: date ? format(new Date(date), "MMM d, yyyy") : "Recently",
            icon: <CalendarDays className="h-4 w-4" />,
          })
        })

        // Add recent prescriptions
        const prescriptions = prescriptionsRes.prescriptions || []
        prescriptions.slice(0, 3).forEach((rx: any) => {
          const date = rx.createdAt || rx.date
          const doctorName = rx.doctorId?.name || "Doctor"
          allActivities.push({
            id: rx._id || rx.id || `rx-${Math.random()}`,
            label: `Prescription received from ${doctorName}`,
            date: date ? format(new Date(date), "MMM d, yyyy") : "Recently",
            icon: <ClipboardList className="h-4 w-4" />,
          })
        })

        // Add recent medications (only if taken today)
        const medications = medicationsRes.medications || []
        const today = new Date().toISOString().split('T')[0]
        medications
          .filter((med: any) => med.takenDates?.includes(today))
          .slice(0, 2)
          .forEach((med: any) => {
            allActivities.push({
              id: med._id || med.id || `med-${Math.random()}`,
              label: `Took medication: ${med.name}`,
              date: "Today",
              icon: <Pill className="h-4 w-4" />,
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
          if (a.date === "Today") return -1
          if (b.date === "Today") return 1
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
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <p className="mt-3 text-sm text-muted-foreground">No recent activity to display.</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold">Recent Activity</h2>
      <ul className="mt-3 space-y-3">
        {activities.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-6 text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
