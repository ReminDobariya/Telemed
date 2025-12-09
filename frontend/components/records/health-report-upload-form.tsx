"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HealthAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"

const TEST_TYPES = [
  "Blood Test",
  "Urine Test",
  "Thyroid Panel",
  "X-ray",
  "MRI",
  "CT Scan",
  "ECG",
  "Ultrasound",
  "Other",
]

export function HealthReportUploadForm({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    testType: "",
    reportDate: "",
    labName: "",
    patientNotes: "",
    fileUrl: "",
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.testType) {
      toast({
        title: "Error",
        description: "Please select a test type",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      await HealthAPI.uploadReport({
        testType: formData.testType,
        reportDate: formData.reportDate || undefined,
        fileUrl: formData.fileUrl || undefined,
        labName: formData.labName || undefined,
        patientNotes: formData.patientNotes || undefined,
      })
      
      toast({
        title: "Success",
        description: "Health report uploaded successfully",
      })
      
      setFormData({
        testType: "",
        reportDate: "",
        labName: "",
        patientNotes: "",
        fileUrl: "",
      })
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload health report",
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
          Upload Health Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Health Report</DialogTitle>
          <DialogDescription>
            Upload a lab report or health test result. This will be stored as an unverified document until reviewed by a doctor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testType">Test Type *</Label>
            <Select
              value={formData.testType}
              onValueChange={(value) => setFormData({ ...formData, testType: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                {TEST_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportDate">Report Date (Optional)</Label>
            <Input
              id="reportDate"
              type="date"
              value={formData.reportDate}
              onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL (PDF or Image)</Label>
            <Input
              id="fileUrl"
              type="url"
              placeholder="https://example.com/report.pdf"
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              You can upload the file to a cloud storage service and paste the URL here
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labName">Lab Name (Optional)</Label>
            <Input
              id="labName"
              type="text"
              placeholder="City Lab"
              value={formData.labName}
              onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientNotes">Notes (Optional)</Label>
            <Textarea
              id="patientNotes"
              placeholder="Any additional notes about this report..."
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
              {loading ? "Uploading..." : "Upload Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

