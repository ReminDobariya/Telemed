"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Video } from "lucide-react"

type Appointment = {
  id: string
  date: string // ISO string
  time: string // "09:30"
  doctorName: string
  specialty?: string
  location?: string
  mode?: "in-person" | "virtual"
  status: "upcoming" | "completed" | "cancelled"
  notes?: string
}

export function AppointmentCard({ appt, className }: { appt: Appointment; className?: string }) {
  const router = useRouter()
  const dt = new Date(appt.date)
  const weekday = dt.toLocaleDateString(undefined, { weekday: "short" })
  const month = dt.toLocaleDateString(undefined, { month: "short" })
  const day = dt.getDate()

  const statusStyles: Record<Appointment["status"], string> = {
    upcoming: "bg-primary/10 text-primary",
    completed: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-destructive/10 text-destructive",
  }

  const canJoin = appt.mode === 'virtual' && appt.status === 'upcoming'

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 min-w-0">
        <CardTitle className="text-base truncate">
          {appt.doctorName}{" "}
          {appt.specialty ? <span className="font-normal text-muted-foreground">• {appt.specialty}</span> : null}
        </CardTitle>
        <Badge variant="secondary" className={cn("capitalize", statusStyles[appt.status])}>
          {appt.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4 min-w-0">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div aria-hidden className="text-center">
            <div className="text-xs text-muted-foreground">{weekday}</div>
            <div className="text-2xl font-semibold leading-tight">{day}</div>
            <div className="text-xs text-muted-foreground">{month}</div>
          </div>
          <div className="text-sm min-w-0">
            <div className="font-medium">{appt.time}</div>
            {appt.location ? <div className="text-muted-foreground">{appt.location}</div> : null}
            {appt.mode ? <div className="text-muted-foreground capitalize">{appt.mode}</div> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canJoin && (
            <Button 
              size="sm" 
              onClick={() => router.push(`/appointments/${appt.id}/consultation`)}
              className="shrink-0"
            >
              <Video className="h-4 w-4 mr-1" />
              Join Consultation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
