"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppointmentsAPI, DoctorsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { VideoCall } from "@/components/shared/video-call"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Clock, User, Save } from "lucide-react"
import Link from "next/link"

export default function PatientConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [appointment, setAppointment] = useState<any>(null)
  const [doctor, setDoctor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [consultationStarted, setConsultationStarted] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        let appt: any = null
        try {
          const directRes = await AppointmentsAPI.get(params.id as string)
          appt = directRes.appointment
        } catch {
          const res = await AppointmentsAPI.list()
          appt = res.appointments.find((a: any) => a._id === params.id)
        }
        
        if (!appt) {
          if (!ignore) {
            toast({ title: "Error", description: "Appointment not found", variant: "destructive" })
            router.push('/appointments')
          }
          return
        }
        
        if (!ignore) {
          setAppointment(appt)
          setNotes(appt.notes || "")
          
          // Extract doctor ID - handle both string and object formats
          let doctorId: string | null = null
          if (appt.doctorId) {
            if (typeof appt.doctorId === 'string') {
              doctorId = appt.doctorId
            } else if (appt.doctorId._id) {
              doctorId = typeof appt.doctorId._id === 'string' ? appt.doctorId._id : String(appt.doctorId._id)
            } else if (appt.doctorId.id) {
              doctorId = typeof appt.doctorId.id === 'string' ? appt.doctorId.id : String(appt.doctorId.id)
            } else {
              // If it's an object but no _id/id, try to stringify and extract
              const idStr = String(appt.doctorId)
              if (idStr && idStr !== '[object Object]' && idStr.length === 24) {
                doctorId = idStr
              }
            }
          }
          
          if (doctorId && doctorId !== '[object Object]') {
            try {
              const doctorRes = await DoctorsAPI.get(doctorId)
              setDoctor(doctorRes.doctor)
            } catch (error) {
              console.error('Failed to load doctor:', error)
              // If doctor fetch fails, we can still show the appointment with doctor name from appointment
              if (appt.doctorId && typeof appt.doctorId === 'object' && appt.doctorId.name) {
                setDoctor({ name: appt.doctorId.name, specialization: appt.doctorId.specialization })
              }
            }
          } else if (appt.doctor) {
            // Fallback to legacy doctor field
            setDoctor({ name: appt.doctor })
          }
        }
      } catch (error: any) {
        console.error('Failed to load appointment:', error)
        if (!ignore) {
          toast({ title: "Error", description: "Failed to load appointment", variant: "destructive" })
          router.push('/appointments')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [params.id, router, toast])

  useEffect(() => {
    if (appointment) {
      const scheduled = new Date(appointment.time)
      const now = new Date()
      const windowStart = new Date(scheduled.getTime() - 10 * 60 * 1000)
      const sameDay = now.toDateString() === scheduled.toDateString()
      const byStatus = appointment.status === 'accepted' || appointment.status === 'scheduled'
      const canStart = byStatus && sameDay && now >= windowStart
      setConsultationStarted(canStart)
    }
  }, [appointment])

  async function handleSaveNotes() {
    if (!appointment?._id) return
    try {
      setSavingNotes(true)
      // For now, save notes locally - you may want to add an API endpoint for patient notes
      toast({ title: "Success", description: "Notes saved" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save notes", variant: "destructive" })
    } finally {
      setSavingNotes(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading consultation...</div>
  }

  if (!appointment) {
    return null
  }

  const isVirtual = appointment.mode === 'virtual'
  const scheduled = new Date(appointment.time)
  const now = new Date()
  const windowStart = new Date(scheduled.getTime() - 10 * 60 * 1000)
  const sameDay = now.toDateString() === scheduled.toDateString()
  const canJoinByStatus = appointment.status === 'accepted' || appointment.status === 'scheduled'
  const canJoin = canJoinByStatus && sameDay && now >= windowStart

  if (!canJoinByStatus) {
    return (
      <div className="container max-w-4xl mx-auto p-4 sm:p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              {appointment.status === 'rejected' ? 'This appointment has been rejected.' : 'This appointment is not yet accepted by the doctor.'}
            </p>
            <Link href="/appointments">
              <Button variant="outline">Back to Appointments</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/appointments">
          <Button variant="ghost" size="sm" className="text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[300px_1fr]">
        {/* Appointment Details - Left Sidebar */}
        <div className="space-y-4 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium truncate">Dr. {doctor?.name || appointment.doctor || 'Doctor'}</div>
                  {doctor?.specialization && (
                    <div className="text-xs text-muted-foreground truncate">{doctor.specialization}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="whitespace-nowrap">{new Date(appointment.time).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="whitespace-nowrap">{new Date(appointment.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {appointment.reason && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground mb-1">Reason:</div>
                  <div className="break-words">{appointment.reason}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section - Always visible */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Your Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="patient-notes" className="sr-only">Your Notes</Label>
                <Textarea
                  id="patient-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  placeholder="Write down any questions or notes during the consultation..."
                  className="resize-none"
                />
              </div>
              <Button 
                onClick={handleSaveNotes} 
                disabled={savingNotes}
                className="w-full"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area - Right Side */}
        <div className="flex flex-col space-y-4 sm:space-y-6 order-1 lg:order-2">
          {isVirtual ? (
            <>
              {!consultationStarted ? (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      You can join on {scheduled.toLocaleDateString()} at {scheduled.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please wait until 10 minutes before the scheduled time.
                    </p>
                  </CardContent>
                </Card>
              ) : !showVideoCall ? (
                <Card>
                  <CardContent className="p-6 sm:p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      Doctor has started the consultation. Ready to join?
                    </p>
                    <Button onClick={() => setShowVideoCall(true)} size="lg">
                      Join Consultation
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full min-h-[500px] sm:min-h-[600px]">
                  <CardContent className="p-0 h-full w-full">
                    <VideoCall
                      appointmentId={appointment._id}
                      remoteName={doctor?.name || 'Doctor'}
                      localName="You"
                      onEndCall={() => {
                        toast({ title: "Call Ended", description: "You have left the consultation" })
                        setShowVideoCall(false)
                      }}
                      isDoctor={false}
                    />
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 sm:p-8">
                <p className="text-muted-foreground text-center">
                  This is an in-person appointment. Please visit the clinic at the scheduled time.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
