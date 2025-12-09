"use client"

import { HealthReportUploadForm } from "@/components/records/health-report-upload-form"
import { useEffect, useState } from "react"
import { HealthAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { FileText, CheckCircle2, XCircle } from "lucide-react"

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadReports = async () => {
    try {
      const res = await HealthAPI.overview()
      setReports(res.health?.reports || [])
    } catch (error) {
      console.error("Failed to load reports:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  return (
    <section className="space-y-4">
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-pretty text-xl font-semibold">Health Reports</h1>
          <p className="text-sm text-muted-foreground">View and manage your lab reports and test results.</p>
        </div>
        <HealthReportUploadForm onSuccess={loadReports} />
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading reports...</p>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">No health reports found. Upload your first report to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report: any, index: number) => (
            <Card key={report._id || index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{report.reportName || report.testType || "Health Report"}</CardTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant={report.type === "structured" ? "default" : "outline"}>
                        {report.type === "structured" ? "Structured" : "Uploaded"}
                      </Badge>
                      {report.verifiedByDoctor ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {report.reportDate && (
                    <p className="text-muted-foreground">
                      Date: {format(new Date(report.reportDate), "MMM d, yyyy")}
                    </p>
                  )}
                  {report.labName && (
                    <p className="text-muted-foreground">Lab: {report.labName}</p>
                  )}
                  {report.findings && (
                    <div>
                      <p className="font-medium">Findings:</p>
                      <p className="text-muted-foreground">{report.findings}</p>
                    </div>
                  )}
                  {report.summary && (
                    <div>
                      <p className="font-medium">Summary:</p>
                      <p className="text-muted-foreground">{report.summary}</p>
                    </div>
                  )}
                  {report.recommendations && (
                    <div>
                      <p className="font-medium">Recommendations:</p>
                      <p className="text-muted-foreground">{report.recommendations}</p>
                    </div>
                  )}
                  {report.patientNotes && (
                    <div>
                      <p className="font-medium">Notes:</p>
                      <p className="text-muted-foreground">{report.patientNotes}</p>
                    </div>
                  )}
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      View Report File
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
