"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DoctorPrescriptionsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Download } from "lucide-react"

type Medication = {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

export function PrescriptionBuilder({ 
  open, 
  onOpenChange, 
  appointment, 
  onSuccess 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment: any
  onSuccess?: () => void
}) {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "", notes: "" }
  ])
  const [notes, setNotes] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [testsRecommended, setTestsRecommended] = useState<string[]>([])
  const [testInput, setTestInput] = useState("")
  const [loading, setLoading] = useState(false)

  function addMedication() {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "", notes: "" }])
  }

  function removeMedication(index: number) {
    setMedications(medications.filter((_, i) => i !== index))
  }

  function updateMedication(index: number, field: keyof Medication, value: string) {
    setMedications(medications.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function addTest() {
    if (testInput.trim()) {
      setTestsRecommended([...testsRecommended, testInput.trim()])
      setTestInput("")
    }
  }

  function removeTest(index: number) {
    setTestsRecommended(testsRecommended.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    const validMeds = medications.filter(m => m.name && m.dosage && m.frequency && m.duration)
    if (validMeds.length === 0) {
      toast({ title: "Error", description: "Please add at least one medication", variant: "destructive" })
      return
    }

    if (!appointment?.userId?._id && !appointment?.userId) {
      toast({ title: "Error", description: "Patient information missing", variant: "destructive" })
      return
    }

    try {
      setLoading(true)
      const res = await DoctorPrescriptionsAPI.create({
        userId: appointment.userId._id || appointment.userId,
        appointmentId: appointment._id,
        medications: validMeds,
        notes,
        followUpDate: followUpDate || undefined,
        testsRecommended,
      })

      toast({ title: "Success", description: "Prescription generated successfully" })
      
      // Download PDF
      try {
        const pdfBlob = await DoctorPrescriptionsAPI.getPDF(res.prescription._id)
        const url = window.URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `prescription_${res.prescription._id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } catch (pdfError) {
        console.error('PDF download failed:', pdfError)
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate prescription", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Prescription</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Medications</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                <Plus className="h-4 w-4 mr-1" />
                Add Medication
              </Button>
            </div>
            <div className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Medication {index + 1}</span>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Medicine Name *</Label>
                      <Input
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        placeholder="e.g., Paracetamol"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Dosage *</Label>
                      <Input
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        placeholder="e.g., 500mg"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Frequency *</Label>
                      <Select
                        value={med.frequency}
                        onValueChange={(v) => updateMedication(index, 'frequency', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once daily">Once daily</SelectItem>
                          <SelectItem value="twice daily">Twice daily</SelectItem>
                          <SelectItem value="thrice daily">Thrice daily</SelectItem>
                          <SelectItem value="as needed">As needed</SelectItem>
                          <SelectItem value="every 6 hours">Every 6 hours</SelectItem>
                          <SelectItem value="every 8 hours">Every 8 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Duration *</Label>
                      <Input
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        placeholder="e.g., 7 days"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Notes (Optional)</Label>
                    <Input
                      value={med.notes}
                      onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                      placeholder="Additional instructions"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="prescription-notes">Additional Notes</Label>
            <Textarea
              id="prescription-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="General instructions or notes for the patient"
            />
          </div>

          {/* Follow-up Date */}
          <div className="space-y-2">
            <Label htmlFor="follow-up">Follow-up Date (Optional)</Label>
            <Input
              id="follow-up"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          {/* Tests Recommended */}
          <div className="space-y-2">
            <Label>Tests Recommended</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Blood Test, X-Ray"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTest()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTest}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {testsRecommended.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {testsRecommended.map((test, i) => (
                  <div key={i} className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm">
                    <span>{test}</span>
                    <button
                      type="button"
                      onClick={() => removeTest(i)}
                      className="text-destructive hover:underline"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Generating..." : "Generate Prescription"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


