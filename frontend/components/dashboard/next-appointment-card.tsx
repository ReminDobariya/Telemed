"use client"

import { Calendar, Video, MapPin } from "lucide-react"
import Link from "next/link"

type Appointment = {
  id: string
  date: string
  time: string
  mode?: "virtual" | "in-person"
  doctor?: { name: string; specialty?: string }
}

export function NextAppointmentCard({ appt }: { appt?: Appointment | null }) {
  if (!appt) {
    return (
      <div className="rounded-xl border bg-card p-4 md:p-5">
        <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
        <Link href="/appointments" className="mt-3 inline-block text-sm text-primary hover:underline">
          Book an appointment
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4 md:p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base md:text-lg font-medium">Next appointment</h3>
        <Link href="/appointments" className="text-sm text-primary hover:underline">
          See all
        </Link>
      </div>
      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <Calendar className="size-4 text-muted-foreground" />
          <span>
            {appt.date} • {appt.time}
          </span>
        </div>
        {appt.mode ? (
          <div className="flex items-center gap-2">
            {appt.mode === "virtual" ? (
              <Video className="size-4 text-muted-foreground" />
            ) : (
              <MapPin className="size-4 text-muted-foreground" />
            )}
            <span className="capitalize">{appt.mode}</span>
          </div>
        ) : null}
        {appt.doctor?.name ? (
          <p className="text-muted-foreground">
            With {appt.doctor.name}
            {appt.doctor.specialty ? ` • ${appt.doctor.specialty}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  )
}
