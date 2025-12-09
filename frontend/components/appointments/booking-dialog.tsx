"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type Doctor = {
  id: string
  name: string
  specialty?: string
}

export type BookingData = {
  doctorId: string
  date: string // yyyy-mm-dd
  time: string // "09:30"
  reason?: string
}

export function BookingDialog({
  doctors,
  onBook,
  initialDoctorId, // NEW: allow pre-selecting a doctor (for direct booking)
  open: controlledOpen,
  onOpenChange,
}: {
  doctors: Doctor[]
  onBook: (data: BookingData) => void
  initialDoctorId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { toast } = useToast()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [doctorId, setDoctorId] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open && initialDoctorId) {
      setDoctorId(initialDoctorId)
    }
  }, [open, initialDoctorId])

  const timeSlots = useMemo(() => {
    // simple 30-min slots
    const slots: string[] = []
    for (let h = 9; h <= 17; h++) {
      for (const m of [0, 30]) {
        const hh = String(h).padStart(2, "0")
        const mm = String(m).padStart(2, "0")
        slots.push(`${hh}:${mm}`)
      }
    }
    return slots
  }, [])

  function handleSubmit() {
    if (!doctorId || !date || !time) {
      toast({ title: "Missing info", description: "Please select doctor, date, and time.", variant: "destructive" })
      return
    }
    onBook({ doctorId, date, time, reason })
    setOpen(false)
    setDoctorId("")
    setDate("")
    setTime("")
    setReason("")
    toast({ title: "Appointment booked", description: "You can view it in your Upcoming tab." })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button>Book appointment</Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-[95vw] sm:max-w-lg lg:max-w-xl max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a new appointment</DialogTitle>
          <DialogDescription>Select a doctor, date, and time. You can add an optional reason.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} {d.specialty ? `• ${d.specialty}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label>Time</Label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {timeSlots.map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={t === time ? "default" : "outline"}
                  onClick={() => setTime(t)}
                  className="justify-center text-xs sm:text-sm"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Confirm booking</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
