"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Video, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

type Appointment = {
  id: string
  date: string
  time: string
  doctorName: string
  specialty?: string
  location?: string
  mode?: "in-person" | "virtual"
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  notes?: string
  scheduledAt: string
}

export function AppointmentCard({ appt, className }: { appt: Appointment; className?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [notesOpen, setNotesOpen] = useState(false)
  const dt = new Date(appt.date)
  const weekday = dt.toLocaleDateString(undefined, { weekday: "short" })
  const month = dt.toLocaleDateString(undefined, { month: "short" })
  const day = dt.getDate()

  const statusStyles: Record<Appointment["status"], string> = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    accepted: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
    completed: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-destructive/10 text-destructive",
  }

  const canJoin = appt.mode === 'virtual' && appt.status === 'accepted'
  const canViewNotes = appt.status === 'completed'

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
              onClick={() => {
                const scheduled = new Date(appt.scheduledAt)
                const now = new Date()
                const windowStart = new Date(scheduled.getTime() - 10 * 60 * 1000)
                const sameDay = now.toDateString() === scheduled.toDateString()
                if (!sameDay || now < windowStart) {
                  toast({ title: "Not yet available", description: `You can join on ${scheduled.toLocaleDateString()} at ${scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` })
                  return
                }
                router.push(`/appointments/${appt.id}/consultation`)
              }}
              className="shrink-0"
            >
              <Video className="h-4 w-4 mr-1" />
              Join Consultation
            </Button>
          )}
          {canViewNotes && (
            <Button size="sm" variant="outline" onClick={() => setNotesOpen(true)} className="shrink-0">
              <FileText className="h-4 w-4 mr-1" />
              View Notes
            </Button>
          )}
        </div>
      </CardContent>

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Consultation Notes
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">
              {appt.notes?.trim()?.length ? appt.notes : 'No consultation notes available yet.'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
