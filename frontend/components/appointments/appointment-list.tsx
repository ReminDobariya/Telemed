"use client"

import { useMemo } from "react"
import { AppointmentCard } from "./appointment-card"

type Appointment = {
  id: string
  date: string // ISO
  time: string
  doctorName: string
  specialty?: string
  location?: string
  mode?: "in-person" | "virtual"
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
  notes?: string
  scheduledAt: string
}

export function AppointmentList({
  items,
  status,
}: {
  items: Appointment[]
  status: "all" | Appointment["status"]
}) {
  const filtered = useMemo(() => {
    return status === "all" ? items : items.filter((x) => x.status === status)
  }, [items, status])

  if (!filtered.length) {
    return <p className="text-sm text-muted-foreground">No appointments found.</p>
  }

  return (
    <div className="grid gap-3">
      {filtered.map((appt) => (
        <AppointmentCard key={appt.id} appt={appt} />
      ))}
    </div>
  )
}
