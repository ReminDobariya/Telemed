"use client"

import { useEffect, useMemo, useState } from "react"
import { AppointmentFilters } from "@/components/appointments/appointment-filters"
import { AppointmentList } from "@/components/appointments/appointment-list"
import { BookingDialog, type BookingData } from "@/components/appointments/booking-dialog"
import { AppointmentsAPI, DoctorsAPI } from "@/lib/api"

// Local view model matching AppointmentCard expectations
type ViewAppointment = {
  id: string
  doctorName: string
  specialty?: string
  date: string // yyyy-mm-dd
  time: string // display time
  status: "upcoming" | "completed" | "cancelled"
  mode?: "in-person" | "virtual"
  location?: string
  notes?: string
}

// Convert 24h "HH:MM" → "h:mm AM/PM"
function toAmPm(hhmm: string) {
  if (!/^\d{2}:\d{2}$/.test(hhmm)) return hhmm
  const [hStr, m] = hhmm.split(":")
  let h = Number(hStr)
  const ampm = h >= 12 ? "PM" : "AM"
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

// Map dummy Appointment → ViewAppointment used by UI components
function mapDummyToView(a: {
  id: string
  doctorName: string
  specialty: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed" | "cancelled"
  type: "online" | "in-person"
  symptoms?: string
}): ViewAppointment {
  const status: ViewAppointment["status"] = a.status === "completed" || a.status === "cancelled" ? a.status : "upcoming"
  const mode: ViewAppointment["mode"] = a.type === "online" ? "virtual" : "in-person"
  const location = mode === "in-person" ? "Clinic" : "Video Visit"
  // Preserve AM/PM times from dummy; convert if 24h format
  const time = /AM|PM/i.test(a.time) ? a.time : toAmPm(a.time)
  return {
    id: a.id,
    doctorName: a.doctorName,
    specialty: a.specialty,
    date: a.date,
    time,
    status,
    mode,
    location,
    notes: a.symptoms,
  }
}

// Derive a simple doctors list from existing dummy appointments for the booking dialog
type Doctor = { id: string; name: string; specialty?: string }
function slugId(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<ViewAppointment[]>([])
  const [filter, setFilter] = useState<{ status: "all" | "upcoming" | "completed" | "cancelled" }>({ status: "all" })

  const [doctors, setDoctors] = useState<Doctor[]>([])

  useEffect(() => {
    let ignore = false
    async function loadDoctors() {
      try {
        const res = await DoctorsAPI.list()
        if (!ignore) {
          setDoctors(res.doctors.map((d: any) => ({
            id: d._id,
            name: d.name,
            specialty: d.specialization,
          })))
        }
      } catch {
        // ignore
      }
    }
    loadDoctors()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await AppointmentsAPI.list()
        if (ignore) return
        const mapped: ViewAppointment[] = res.appointments.map(a => ({
          id: a._id,
          doctorName: a.doctor || 'Doctor',
          specialty: '',
          date: new Date(a.time).toISOString().slice(0,10),
          time: new Date(a.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
          status: a.status === 'completed' || a.status === 'cancelled' ? a.status : 
                  (a.status === 'accepted' || a.status === 'scheduled' ? 'upcoming' : 'upcoming'),
          mode: a.mode === 'virtual' ? 'virtual' : 'in-person',
          location: a.mode === 'virtual' ? 'Video Visit' : 'Clinic',
          notes: a.reason,
        }))
        setAppointments(mapped)
      } catch {
        // ignore
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  async function handleBook(data: BookingData) {
    const iso = new Date(`${data.date}T${data.time}:00`).toISOString()
    const res = await AppointmentsAPI.create({ 
      doctorId: data.doctorId, 
      time: iso, 
      reason: data.reason,
      mode: 'virtual'
    })
    const doc = doctors.find((d) => d.id === data.doctorId)
    const newAppt: ViewAppointment = {
      id: res.appointment._id,
      doctorName: doc?.name || res.appointment.doctor || 'Doctor',
      specialty: doc?.specialty || '',
      date: new Date(res.appointment.time).toISOString().slice(0,10),
      time: new Date(res.appointment.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      status: res.appointment.status === 'pending' ? 'upcoming' : 'upcoming',
      mode: res.appointment.mode === 'virtual' ? 'virtual' : 'in-person',
      location: res.appointment.mode === 'virtual' ? 'Video Visit' : 'Clinic',
      notes: res.appointment.reason,
    }
    setAppointments((prev) => [newAppt, ...prev])
  }

  const totalLabel = useMemo(() => {
    const count =
      filter.status === "all" ? appointments.length : appointments.filter((a) => a.status === filter.status).length
    return `${count} ${count === 1 ? "appointment" : "appointments"}`
  }, [appointments, filter.status])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-pretty text-xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">{totalLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <BookingDialog doctors={doctors} onBook={handleBook} />
          </div>
        </div>
      </div>

      <div className="card p-4">
        <AppointmentFilters value={filter} onChange={setFilter} onClear={() => setFilter({ status: "all" })} />
      </div>

      <div className="grid gap-3">
        <AppointmentList items={appointments} status={filter.status === "all" ? "all" : filter.status} />
      </div>

      <div className="sm:hidden fixed right-4 bottom-20 z-40">
        <BookingDialog doctors={doctors} onBook={handleBook} />
      </div>
    </section>
  )
}
