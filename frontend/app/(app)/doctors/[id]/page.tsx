"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingDialog } from "@/components/appointments/booking-dialog"
import { DoctorsAPI, AppointmentsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Clock, MapPin, User, GraduationCap } from "lucide-react"

export default function DoctorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openBook, setOpenBook] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await DoctorsAPI.get(params.id)
        if (!ignore) {
          setDoctor(res.doctor)
        }
      } catch (error) {
        console.error('Failed to load doctor:', error)
        if (!ignore) {
          toast({ title: "Error", description: "Doctor not found", variant: "destructive" })
          router.push('/doctors')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [params.id, router, toast])

  async function handleBook(data: { doctorId: string; date: string; time: string; reason?: string }) {
    try {
      const iso = new Date(`${data.date}T${data.time}:00`).toISOString()
      await AppointmentsAPI.create({
        doctorId: data.doctorId,
        time: iso,
        reason: data.reason,
        mode: 'virtual'
      })
      setOpenBook(false)
      // BookingDialog already shows a success toast, so we just navigate
      setTimeout(() => router.push('/appointments'), 500)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to book appointment", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading doctor profile...</div>
  }

  if (!doctor) {
    return <div className="text-center py-8 text-muted-foreground">Doctor not found</div>
  }

  const doctorForBooking = { id: doctor._id, name: doctor.name, specialty: doctor.specialization }

  const modes = doctor.mode === 'both' ? ['virtual', 'in-person'] : (doctor.mode ? [doctor.mode] : ['virtual'])
  const languages = doctor.languages && Array.isArray(doctor.languages) ? doctor.languages : ['English']

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-pretty text-xl font-semibold">Dr. {doctor.name}</h1>
          <p className="text-sm text-muted-foreground">{doctor.specialization || "General Practitioner"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/doctors">
            <Button variant="outline">Back to directory</Button>
          </Link>
          <Button onClick={() => setOpenBook(true)}>Book Appointment</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {doctor.bio ? (
                <p className="text-sm text-muted-foreground">{doctor.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Dr. {doctor.name} is a {doctor.specialization || "general practitioner"} focused on
                  patient-centered care and evidence-based treatment.
                </p>
              )}
              {doctor.experience != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.experience}+ years of experience</span>
                </div>
              )}
              {doctor.qualifications && doctor.qualifications.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <GraduationCap className="h-4 w-4" />
                    Qualifications
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.qualifications.map((q: string, i: number) => (
                      <Badge key={i} variant="outline">{q}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consultation Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {modes.map((m) => (
                  <Badge key={m} className="capitalize">
                    {m === 'in-person' ? 'In-Person' : 'Virtual'}
                  </Badge>
                ))}
              </div>
              {doctor.fees != null && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Consultation Fee: </span>
                  <span className="font-medium">₹{doctor.fees}</span>
                </div>
              )}
              {languages.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Languages</div>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                      <Badge key={l} variant="outline">
                        {l === 'en' ? 'English' : l === 'hi' ? 'Hindi' : l === 'gu' ? 'Gujarati' : l === 'mr' ? 'Marathi' : l}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {doctor.photo && (
                <div className="flex justify-center">
                  <img 
                    src={doctor.photo} 
                    alt={doctor.name} 
                    className="h-32 w-32 rounded-full object-cover border-2"
                  />
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.name}</span>
                </div>
                {doctor.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{doctor.phone}</span>
                  </div>
                )}
                {doctor.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-xs">{doctor.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingDialog
        doctors={[doctorForBooking]}
        onBook={handleBook}
        initialDoctorId={doctor._id}
        open={openBook}
        onOpenChange={setOpenBook}
      />
    </section>
  )
}
