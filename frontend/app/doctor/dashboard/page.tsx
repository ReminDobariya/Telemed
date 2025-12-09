"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DoctorAppointmentsAPI, DoctorAuthAPI, NotificationsAPI } from "@/lib/api"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { DoctorProfileCompletion } from "@/components/dashboard/doctor-profile-completion"
import { DoctorRecentActivity } from "@/components/dashboard/doctor-recent-activity"
import { CalendarDays, Clock, CheckCircle2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function DoctorDashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [doctor, setDoctor] = useState<any>(null)
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
  })
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const [doctorRes, appointmentsRes, notificationsRes] = await Promise.all([
          DoctorAuthAPI.me().catch(() => null),
          DoctorAppointmentsAPI.list().catch(() => ({ appointments: [] })),
          NotificationsAPI.list().catch(() => ({ notifications: [], unreadCount: 0 })),
        ])

        if (ignore) return

        if (!doctorRes) {
          router.push('/doctor/login')
          return
        }

        setDoctor(doctorRes.doctor)
        const appointments = appointmentsRes.appointments || []
        const today = new Date().toISOString().split('T')[0]
        
        setStats({
          pending: appointments.filter((a: any) => a.status === 'pending').length,
          today: appointments.filter((a: any) => {
            const apptDate = new Date(a.time).toISOString().split('T')[0]
            return apptDate === today && (a.status === 'accepted' || a.status === 'scheduled')
          }).length,
          upcoming: appointments.filter((a: any) => a.status === 'accepted' || a.status === 'scheduled').length,
          completed: appointments.filter((a: any) => a.status === 'completed').length,
        })
        setUnreadNotifications(notificationsRes.unreadCount || 0)
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!doctor) {
    return null
  }

  return (
    <section className="space-y-4 md:space-y-6 w-full max-w-full">
      <header>
        <h1 className="text-pretty text-xl sm:text-2xl lg:text-3xl font-semibold break-words">
          Welcome, Dr. {doctor.name}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Your appointment overview</p>
      </header>

      {/* Profile Completion */}
      {!loading && doctor && <DoctorProfileCompletion doctor={doctor} />}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={<Clock />} label="Pending" value={stats.pending} />
        <KpiCard icon={<CalendarDays />} label="Today" value={stats.today} />
        <KpiCard icon={<CalendarDays />} label="Upcoming" value={stats.upcoming} />
        <KpiCard icon={<CheckCircle2 />} label="Completed" value={stats.completed} />
      </div>

      {/* Recent Activity */}
      <DoctorRecentActivity />
    </section>
  )
}


