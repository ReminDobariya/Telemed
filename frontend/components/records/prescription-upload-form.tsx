"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PrescriptionsAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText } from "lucide-react"

export function PrescriptionUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    prescriptionDate: "",
    doctorName: "",
    hospitalName: "",
    patientNotes: "",
    fileUrl: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.prescriptionDate) {
      toast({
        title: "Error",
        description: "Please enter the prescription date",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await PrescriptionsAPI.upload({
        prescriptionDate: formData.prescriptionDate,
        fileUrl: formData.fileUrl || undefined,
        doctorName: formData.doctorName || undefined,
        hospitalName: formData.hospitalName || undefined,
        patientNotes: formData.patientNotes || undefined,
      })
      
      toast({
        title: "Success",
        description: "Prescription uploaded successfully",
      })
      
      setFormData({
        prescriptionDate: "",
        doctorName: "",
        hospitalName: "",
        patientNotes: "",
        fileUrl: "",
      })
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload prescription",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload External Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload External Prescription</DialogTitle>
          <DialogDescription>
            Upload a prescription you received outside the platform. This will be stored as a historical document.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prescriptionDate">Prescription Date *</Label>
            <Input
              id="prescriptionDate"
              type="date"
              required
              value={formData.prescriptionDate}
              onChange={(e) => setFormData({ ...formData, prescriptionDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL (PDF or Image)</Label>
            <Input
              id="fileUrl"
              type="url"
              placeholder="https://example.com/prescription.pdf"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              You can upload the file to a cloud storage service and paste the URL here
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorName">Doctor Name (Optional)</Label>
            <Input
              id="doctorName"
              type="text"
              placeholder="Dr. John Doe"
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital Name (Optional)</Label>
            <Input
              id="hospitalName"
              type="text"
              placeholder="City Hospital"
              value={formData.hospitalName}
              onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientNotes">Notes (Optional)</Label>
            <Textarea
              id="patientNotes"
              placeholder="Any additional notes about this prescription..."
              rows={3}
              value={formData.patientNotes}
              onChange={(e) => setFormData({ ...formData, patientNotes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Uploading..." : "Upload Prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

