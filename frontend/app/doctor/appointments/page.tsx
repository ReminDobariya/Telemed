"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DoctorAppointmentsAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PatientDataDrawer } from "@/components/doctor/patient-data-drawer"
import { ConsultationRoom } from "@/components/doctor/consultation-room"
import { Calendar, Clock, User, MapPin, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function DoctorAppointmentsPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [consultationOpen, setConsultationOpen] = useState(false)
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [viewingNotes, setViewingNotes] = useState("")
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'pending')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        const today = new Date().toISOString().split('T')[0]
        const params: any = {}
        
        if (activeTab === 'today') {
          params.date = today
          params.status = 'accepted'
        } else if (activeTab !== 'all') {
          params.status = activeTab
        }
        
        const res = await DoctorAppointmentsAPI.list(params)
        if (!ignore) {
          setAppointments(res.appointments || [])
        }
      } catch (error) {
        console.error('Failed to load appointments:', error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [activeTab])

  async function handleAccept(id: string) {
    try {
      await DoctorAppointmentsAPI.accept(id)
      toast({ title: "Success", description: "Appointment accepted" })
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'accepted' } : a))
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to accept", variant: "destructive" })
    }
  }

  async function handleReject(id: string, reason?: string) {
    try {
      await DoctorAppointmentsAPI.reject(id, reason)
      toast({ title: "Success", description: "Appointment rejected" })
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'rejected' } : a))
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to reject", variant: "destructive" })
    }
  }

  async function handleViewPatient(appointment: any) {
    try {
      const res = await DoctorAppointmentsAPI.get(appointment._id)
      setSelectedAppointment({ ...appointment, patientData: res.patient })
      setDrawerOpen(true)
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load patient data", variant: "destructive" })
    }
  }

  function handleStartConsultation(appointment: any) {
    setSelectedAppointment(appointment)
    setConsultationOpen(true)
  }

  async function handleViewNotes(appointment: any) {
    try {
      const res = await DoctorAppointmentsAPI.get(appointment._id)
      setViewingNotes(res.appointment.notes || "No notes available for this appointment.")
      setNotesDialogOpen(true)
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to load notes", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary' as const, label: 'Pending' },
      accepted: { variant: 'default' as const, label: 'Accepted' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      completed: { variant: 'outline' as const, label: 'Completed' },
      scheduled: { variant: 'default' as const, label: 'Scheduled' },
    }
    const config = variants[status] || { variant: 'secondary' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <section className="space-y-4 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-pretty text-xl sm:text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">Manage your appointments</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b overflow-x-auto">
              <TabsTrigger value="pending" className="whitespace-nowrap">Pending</TabsTrigger>
              <TabsTrigger value="today" className="whitespace-nowrap">Today</TabsTrigger>
              <TabsTrigger value="accepted" className="whitespace-nowrap">Upcoming</TabsTrigger>
              <TabsTrigger value="completed" className="whitespace-nowrap">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="p-3 sm:p-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No appointments found</div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((appt) => (
                    <Card key={appt._id} className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium break-words">{appt.userId?.name || 'Patient'}</span>
                            {getStatusBadge(appt.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">{new Date(appt.time).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">{new Date(appt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">{appt.mode === 'virtual' ? 'Virtual' : 'In-Person'}</span>
                            </div>
                          </div>
                          {appt.reason && (
                            <p className="text-sm text-muted-foreground break-words">Reason: {appt.reason}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          {appt.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleAccept(appt._id)}>
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(appt._id)}>
                                Reject
                              </Button>
                            </>
                          )}
                          {(appt.status === 'accepted' || appt.status === 'scheduled') && (
                            <Button size="sm" onClick={() => handleStartConsultation(appt)}>
                              Start Consultation
                            </Button>
                          )}
                          {appt.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => handleViewNotes(appt)}>
                              <FileText className="h-4 w-4 mr-1" />
                              View Notes
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleViewPatient(appt)}>
                            View Patient
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedAppointment && (
        <>
          <PatientDataDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            appointment={selectedAppointment}
          />
          <ConsultationRoom
            open={consultationOpen}
            onOpenChange={setConsultationOpen}
            appointment={selectedAppointment}
            onPrescriptionGenerated={() => {
              setConsultationOpen(false)
              toast({ title: "Success", description: "Prescription generated successfully" })
            }}
          />
        </>
      )}

      {/* Notes View Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Consultation Notes
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{viewingNotes}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}


