"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DoctorAppointmentsAPI, HealthAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { PrescriptionBuilder } from "./prescription-builder"
import { PatientDataDrawer } from "./patient-data-drawer"
import { VideoCall } from "@/components/shared/video-call"
import { User, Upload, CheckCircle2, Save, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type ConsultationRoomProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
  onPrescriptionGenerated: (() => void) | undefined
}

export function ConsultationRoom(props: ConsultationRoomProps) {
  const { open, onOpenChange, appointment, onPrescriptionGenerated } = props
  const { toast } = useToast()
  const [notes, setNotes] = useState(appointment?.notes || "")
  const [showPrescriptionBuilder, setShowPrescriptionBuilder] = useState(false)
  const [showReportUpload, setShowReportUpload] = useState(false)
  const [showPatientDrawer, setShowPatientDrawer] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appointmentWithPatient, setAppointmentWithPatient] = useState<any>(appointment)
  const [reportData, setReportData] = useState({ 
    testType: "", 
    reportName: "",
    fileUrl: "", 
    findings: "",
    summary: "",
    recommendations: "",
    notes: "" 
  })
  const isVirtual = appointment?.mode === 'virtual'

  // Load patient data when consultation room opens
  useEffect(() => {
    if (open && appointment?._id) {
      loadPatientData()
    }
  }, [open, appointment?._id])

  useEffect(() => {
    if (appointment?.notes) {
      setNotes(appointment.notes)
    }
  }, [appointment])

  async function loadPatientData() {
    if (!appointment?._id) return
    try {
      const res = await DoctorAppointmentsAPI.get(appointment._id)
      setAppointmentWithPatient({ ...appointment, patientData: res.patient })
    } catch (error) {
      console.error('Failed to load patient data:', error)
    }
  }

  async function handleSaveNotes() {
    if (!appointment?._id) return
    try {
      setLoading(true)
      await DoctorAppointmentsAPI.updateNotes(appointment._id, notes)
      toast({ title: "Success", description: "Notes saved" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save notes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete() {
    if (!appointment?._id) return
    try {
      setLoading(true)
      await DoctorAppointmentsAPI.complete(appointment._id)
      toast({ title: "Success", description: "Appointment marked as completed" })
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to complete", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleUploadReport() {
    if (!appointment?.userId?._id && !appointment?.userId) {
      toast({ title: "Error", description: "Patient information missing", variant: "destructive" })
      return
    }
    if (!reportData.testType || !reportData.reportName) {
      toast({ title: "Error", description: "Test type and report name are required", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const userId = appointment.userId._id || appointment.userId
      
      // Use HealthAPI to upload structured report
      await HealthAPI.uploadStructuredReport({
        userId,
        testType: reportData.testType,
        reportName: reportData.reportName,
        findings: reportData.findings || undefined,
        summary: reportData.summary || undefined,
        recommendations: reportData.recommendations || undefined,
        fileUrl: reportData.fileUrl || undefined,
      })
      
      toast({ title: "Success", description: "Health report uploaded successfully" })
      setShowReportUpload(false)
      setReportData({ 
        testType: "", 
        reportName: "",
        fileUrl: "", 
        findings: "",
        summary: "",
        recommendations: "",
        notes: "" 
      })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to upload report", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return null
  }

  return (
    <>
      {/* Prescription Builder Dialog - Opens over video call */}
      {showPrescriptionBuilder && (
        <PrescriptionBuilder
          open={showPrescriptionBuilder}
          onOpenChange={setShowPrescriptionBuilder}
          appointment={appointment}
          onSuccess={() => {
            setShowPrescriptionBuilder(false)
            if (onPrescriptionGenerated) {
              onPrescriptionGenerated()
            }
          }}
        />
      )}

      {/* Report Upload Dialog - Opens over video call */}
      <Dialog open={showReportUpload} onOpenChange={setShowReportUpload}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Test/Health Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="testType">Test Type *</Label>
              <Input
                id="testType"
                value={reportData.testType}
                onChange={(e) => setReportData({ ...reportData, testType: e.target.value })}
                placeholder="e.g., Blood Test, X-Ray, MRI, CT Scan"
                required
              />
            </div>
            <div>
              <Label htmlFor="reportName">Report Name *</Label>
              <Input
                id="reportName"
                value={reportData.reportName}
                onChange={(e) => setReportData({ ...reportData, reportName: e.target.value })}
                placeholder="e.g., Complete Blood Count, Chest X-Ray"
                required
              />
            </div>
            <div>
              <Label htmlFor="fileUrl">File URL (Optional)</Label>
              <Input
                id="fileUrl"
                value={reportData.fileUrl}
                onChange={(e) => setReportData({ ...reportData, fileUrl: e.target.value })}
                placeholder="https://example.com/report.pdf"
              />
            </div>
            <div>
              <Label htmlFor="findings">Findings (Optional)</Label>
              <Textarea
                id="findings"
                value={reportData.findings}
                onChange={(e) => setReportData({ ...reportData, findings: e.target.value })}
                rows={3}
                placeholder="Key findings from the test..."
              />
            </div>
            <div>
              <Label htmlFor="summary">Summary (Optional)</Label>
              <Textarea
                id="summary"
                value={reportData.summary}
                onChange={(e) => setReportData({ ...reportData, summary: e.target.value })}
                rows={3}
                placeholder="Summary of the report..."
              />
            </div>
            <div>
              <Label htmlFor="recommendations">Recommendations (Optional)</Label>
              <Textarea
                id="recommendations"
                value={reportData.recommendations}
                onChange={(e) => setReportData({ ...reportData, recommendations: e.target.value })}
                rows={3}
                placeholder="Recommendations based on the report..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowReportUpload(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleUploadReport} disabled={loading}>
                {loading ? "Uploading..." : "Upload Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient Data Drawer - Opens from left without interrupting video */}
      <PatientDataDrawer
        open={showPatientDrawer}
        onOpenChange={setShowPatientDrawer}
        appointment={appointmentWithPatient || appointment}
      />

      {/* Main Consultation Room */}
      <div className="fixed inset-0 z-50 bg-background">
        <div className="container max-w-7xl mx-auto h-full flex flex-col p-3 sm:p-4 md:p-6">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-semibold">Consultation Room</h1>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>

          <div className="flex-1 grid gap-4 sm:gap-6 overflow-hidden lg:grid-cols-[280px_1fr]">
            {/* Left Sidebar - Patient Button, Notes, Actions */}
            <div className="space-y-4 overflow-y-auto order-2 lg:order-1">
              {/* View Patient Button */}
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowPatientDrawer(true)}
              >
                <User className="h-4 w-4 mr-2" />
                View Patient
              </Button>

              {/* Notes Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Consultation Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="notes" className="sr-only">Consultation Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={10}
                      placeholder="Enter consultation notes here..."
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleSaveNotes}
                    disabled={loading}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Notes"}
                  </Button>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowPrescriptionBuilder(true)}
                    size="sm"
                  >
                    Generate Prescription
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowReportUpload(true)}
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Test/Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleComplete}
                    disabled={loading}
                    size="sm"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Completed
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area - Video Call */}
            <div className="flex flex-col overflow-hidden order-1 lg:order-2">
              {isVirtual ? (
                <Card className="h-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
                  <CardContent className="p-0 h-full w-full">
                    <VideoCall
                      appointmentId={appointment?._id}
                      remoteName={appointment?.userId?.name || 'Patient'}
                      localName="You (Doctor)"
                      onEndCall={() => {
                        toast({ title: "Call Ended", description: "Video call has been ended" })
                        onOpenChange(false)
                      }}
                      isDoctor={true}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8">
                    <p className="text-muted-foreground text-center">
                      This is an in-person appointment. Consultation notes can be added above.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
