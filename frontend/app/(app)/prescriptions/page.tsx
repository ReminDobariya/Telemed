"use client"

import { PrescriptionsTable } from "@/components/records/prescriptions-table"
import { PrescriptionUploadForm } from "@/components/records/prescription-upload-form"

export default function PrescriptionsPage() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-pretty text-xl font-semibold">Prescriptions</h1>
          <p className="text-sm text-muted-foreground">View and manage your prescriptions.</p>
        </div>
        <PrescriptionUploadForm />
      </div>
      <PrescriptionsTable />
    </section>
  )
}
