"use client"

import { useEffect, useState } from "react"
import { AppointmentsAPI, PrescriptionsAPI, MedicationsAPI, UserAPI, HealthAPI } from "@/lib/api"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { AIHealthInsights } from "@/components/dashboard/ai-health-insights"
import { NextAppointmentCard } from "@/components/dashboard/next-appointment-card"
import { MedicationReminders } from "@/components/dashboard/medication-reminders"
import { LabsSummary } from "@/components/dashboard/labs-summary"
import { ProfileCompletion } from "@/components/dashboard/profile-completion"
import { CalendarDays, Pill, CheckCircle2, ClipboardList } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [completed, setCompleted] = useState<any[]>([])
  const [rxCount, setRxCount] = useState(0)
  const [medsCount, setMedsCount] = useState(0)
  const [nextAppt, setNextAppt] = useState<any>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, medicationsRes, profileRes, healthRes] = await Promise.all([
        AppointmentsAPI.list().catch(() => ({ appointments: [] })),
        PrescriptionsAPI.list().catch(() => ({ prescriptions: [] })),
        MedicationsAPI.list().catch(() => ({ medications: [] })),
        UserAPI.getProfile().catch(() => ({ profile: {} })),
        HealthAPI.overview().catch(() => ({ health: { reports: [] } })),
      ])

      const appointments = appointmentsRes.appointments || []
      const upcomingList = appointments.filter((a: any) => a.status === "confirmed" || a.status === "pending")
      const completedList = appointments.filter((a: any) => a.status === "completed")
      
      setUpcoming(upcomingList)
      setCompleted(completedList)
      setRxCount(prescriptionsRes.prescriptions?.length || 0)
      setMedsCount(medicationsRes.medications?.length || 0)
      setMedications(medicationsRes.medications || [])
      setReports(healthRes.health?.reports || [])
      setProfile(profileRes.profile || {})

      // Find next appointment
      const parseTimeToMinutes = (t: string) => {
        if (!t) return 0
        const [time, mer] = t.split(" ")
        const [hh, mm] = time.split(":").map((n) => Number.parseInt(n, 10))
        const h24 = (mer?.toUpperCase() === "PM" ? (hh % 12) + 12 : hh % 12) || (mer?.toUpperCase() === "AM" ? hh % 12 : hh)
        return h24 * 60 + (mm || 0)
      }
      
      const byDateThenTime = (a: any, b: any) => {
        if (a.date === b.date) return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
        return a.date?.localeCompare(b.date || '') || 0
      }
      
      const sorted = [...upcomingList].sort(byDateThenTime)
      setNextAppt(sorted[0] || null)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    loadData()
    return () => { ignore = true }
  }, [])

  // Get user's first name or fallback
  const displayName = user?.name?.split(" ")[0] || "User"

  return (
    <section className="space-y-4 md:space-y-6">
      {/* Heading */}
      <header>
        <h1 className="text-pretty text-xl sm:text-2xl lg:text-3xl font-semibold">
          Welcome back, {displayName}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Your health overview</p>
      </header>

      {/* Profile Completion */}
      {!loading && profile !== null && <ProfileCompletion profile={profile || {}} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={<CalendarDays />} label="Upcoming" value={upcoming.length} />
        <KpiCard icon={<CheckCircle2 />} label="Completed" value={completed.length} />
        <KpiCard icon={<ClipboardList />} label="Prescriptions" value={rxCount} />
        <KpiCard icon={<Pill />} label="Medications" value={medsCount} />
      </div>

      {/* Primary grid: AI Health Insights + next appointment, meds & labs */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <AIHealthInsights />

          <NextAppointmentCard
            appt={
              nextAppt
                ? {
                    id: nextAppt._id || nextAppt.id,
                    date: nextAppt.date || nextAppt.appointmentDate,
                    time: nextAppt.time || nextAppt.appointmentTime,
                    mode: nextAppt.mode || (nextAppt.type === "online" ? "virtual" : "in-person"),
                    doctor: { 
                      name: nextAppt.doctor?.name || nextAppt.doctorName || "Doctor", 
                      specialty: nextAppt.doctor?.specialty || nextAppt.specialty || "" 
                    },
                  }
                : null
            }
          />
        </div>
        <div className="space-y-4">
          <MedicationReminders meds={medications} onUpdate={loadData} />
          <LabsSummary reports={reports} />
        </div>
      </div>

      {/* Secondary grid: activity */}
      <div className="grid gap-4">
        <RecentActivity />
      </div>
    </section>
  )
}
