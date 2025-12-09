"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Calendar, AlertTriangle, Pill, FileText, MessageSquare } from "lucide-react"

export function PatientDataDrawer({ open, onOpenChange, appointment }: { open: boolean; onOpenChange: (open: boolean) => void; appointment: any }) {
  const patient = appointment?.patientData || {}
  const profile = patient.profile || {}

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Patient Information</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid gap-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {patient.name || 'N/A'}</div>
              <div><span className="text-muted-foreground">Age:</span> {profile.age || 'N/A'}</div>
              <div><span className="text-muted-foreground">Gender:</span> {profile.gender || 'N/A'}</div>
              <div><span className="text-muted-foreground">Blood Group:</span> {profile.bloodGroup || 'N/A'}</div>
              {profile.bmi && <div><span className="text-muted-foreground">BMI:</span> {profile.bmi}</div>}
            </div>
          </div>

          {/* Appointment Reason */}
          {appointment.reason && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Reason for Visit</h3>
              <p className="text-sm">{appointment.reason}</p>
            </div>
          )}

          <Tabs defaultValue="allergies" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="allergies">Allergies</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="allergies" className="space-y-2 mt-4">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((allergy: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-3 border rounded-md">
                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{allergy.substance}</div>
                      <div className="text-sm text-muted-foreground">
                        {allergy.reaction} • {allergy.severity}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No allergies recorded</p>
              )}
            </TabsContent>

            <TabsContent value="medications" className="space-y-2 mt-4">
              {patient.medications && patient.medications.length > 0 ? (
                patient.medications.map((med: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-3 border rounded-md">
                    <Pill className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </div>
                      {med.status && <Badge variant="outline" className="mt-1">{med.status}</Badge>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No current medications</p>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Past Prescriptions
                </h4>
                {patient.prescriptions && patient.prescriptions.length > 0 ? (
                  <div className="space-y-2">
                    {patient.prescriptions.slice(0, 5).map((pres: any, i: number) => (
                      <div key={i} className="p-2 border rounded text-sm">
                        <div className="font-medium">{pres.medication || 'Prescription'}</div>
                        <div className="text-muted-foreground">
                          {pres.dosage} • {new Date(pres.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No past prescriptions</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lab Reports
                </h4>
                {patient.reports && patient.reports.length > 0 ? (
                  <div className="space-y-2">
                    {patient.reports.slice(0, 5).map((report: any, i: number) => (
                      <div key={i} className="p-2 border rounded text-sm">
                        <div className="font-medium">{report.name || 'Report'}</div>
                        <div className="text-muted-foreground">
                          {new Date(report.date || report.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No lab reports</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Recent Chat Summaries
                </h4>
                {patient.recentChats && patient.recentChats.length > 0 ? (
                  <div className="space-y-3">
                    {patient.recentChats.map((chat: any, i: number) => (
                      <div key={i} className="p-3 border rounded-md">
                        <div className="font-medium mb-2">{chat.title || 'Chat'}</div>
                        {chat.summary && (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-2 rounded mt-2">
                            {chat.summary}
                          </div>
                        )}
                        {chat.updatedAt && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent chats</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}


