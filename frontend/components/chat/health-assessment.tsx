import Link from "next/link"
import type { Assessment } from "@/lib/ai"
import { AlertTriangle, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

export function HealthAssessment({ data }: { data: Assessment }) {
  const urgencyTone =
    data.urgency === "high" ? "border-accent" : data.urgency === "medium" ? "border-secondary" : "border-muted"
  const urgencyBadge =
    data.urgency === "high"
      ? "bg-accent text-accent-foreground"
      : data.urgency === "medium"
        ? "bg-secondary text-secondary-foreground"
        : "bg-muted text-foreground"
  return (
    <div className={cn("rounded-lg border p-4", urgencyTone)} role="region" aria-label="Symptom assessment">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" aria-hidden="true" />
          <h3 className="text-sm font-semibold">{data.title}</h3>
        </div>
        <span className={cn("rounded px-2 py-0.5 text-xs font-medium", urgencyBadge)}>{data.urgency} urgency</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{data.summary}</p>
      <div className="mt-3">
        <p className="text-sm font-medium">Suggested Specialty</p>
        <p className="text-sm">{data.suggestedSpecialty}</p>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {data.actions.map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/doctors"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          <Stethoscope className="h-4 w-4" /> Find a doctor
        </Link>
        <Link href="/appointments" className="rounded-md border px-3 py-1.5 text-sm">
          Book appointment
        </Link>
      </div>
    </div>
  )
}
